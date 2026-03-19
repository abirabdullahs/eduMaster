'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { Loader2, Plus, BookOpen, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FreeClass, FreeSubject } from '@/lib/types';

function EditSubjectModal({
  subject,
  onClose,
  onSave,
}: {
  subject: FreeSubject | null;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState(subject?.name || '');
  const [description, setDescription] = useState(subject?.description || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErr('Subject name is required');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSave(trimmed, description.trim());
    } catch (e: any) {
      setErr(e.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (!subject) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Edit Subject</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0d1117] border border-slate-700 rounded-xl text-white"
              placeholder="Subject name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#0d1117] border border-slate-700 rounded-xl text-white resize-none"
              placeholder="Description"
              rows={3}
            />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminFreeContentPage() {
  const [activeTab, setActiveTab] = useState<'SSC' | 'HSC'>('SSC');
  const [classes, setClasses] = useState<FreeClass[]>([]);
  const [subjects, setSubjects] = useState<FreeSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSubject, setAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<FreeSubject | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: classData } = await supabase
        .from('free_classes')
        .select('*')
        .order('order_index');
      setClasses(classData || []);

      const activeClass = (classData || []).find(c => c.name === activeTab);
      if (activeClass) {
        const { data: subjData } = await supabase
          .from('free_subjects')
          .select(`
            *,
            chapters:free_chapters(count)
          `)
          .eq('class_id', activeClass.id)
          .order('order_index');
        setSubjects(subjData || []);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditSubject = async (name: string, description: string) => {
    if (!editingSubject) return;
    const { error } = await supabase
      .from('free_subjects')
      .update({ name, description: description || null })
      .eq('id', editingSubject.id);
    if (!error) {
      const { logAdminActivity } = await import('@/lib/admin-activity');
      logAdminActivity({ activity_type: 'free_subject_updated', title: `Edited free subject: ${name}`, entity_type: 'free_content', entity_id: editingSubject.id, href: `/admin/free-content/${editingSubject.id}` });
      setEditingSubject(null);
      fetchData();
    } else throw new Error(error.message);
  };

  const handleDeleteSubject = async (subject: FreeSubject) => {
    if (!confirm(`Delete "${subject.name}" and all its chapters, topics, and contents?`)) return;
    const { error } = await supabase.from('free_subjects').delete().eq('id', subject.id);
    if (!error) fetchData();
    else alert('Failed: ' + error.message);
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Free Content</h1>
          <p className="text-slate-400 mt-1">Manage SSC and HSC free learning content</p>
        </div>

        <div className="flex gap-2 p-1 bg-[#161b22] rounded-2xl w-fit">
          {(['SSC', 'HSC'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold transition-all",
                activeTab === tab ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-slate-500 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {subjects.length === 0 ? (
              <div className="bg-[#161b22] border border-dashed border-slate-800 rounded-3xl p-20 text-center">
                <BookOpen size={64} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No subjects yet</h3>
                <p className="text-slate-400 mb-6">Add your first free subject for {activeTab}</p>
                <Link
                  href={`/admin/free-content/new?class=${activeTab}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  <Plus size={20} /> Add Subject
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Link
                    href={`/admin/free-content/new?class=${activeTab}`}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                  >
                    <Plus size={18} /> Add Subject
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((s) => (
                    <div
                      key={s.id}
                      className="group bg-[#161b22] border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all flex items-center justify-between gap-3"
                    >
                      <Link href={`/admin/free-content/${s.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                        {s.thumbnail_url ? (
                          <img src={s.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                            <BookOpen size={24} className="text-slate-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-white group-hover:text-indigo-400">{s.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{s.description || 'No description'}</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400 shrink-0" />
                      </Link>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.preventDefault()}>
                        <button
                          onClick={() => setEditingSubject(s)}
                          className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          title="Edit Subject"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(s)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Subject"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {editingSubject && (
          <EditSubjectModal
            subject={editingSubject}
            onClose={() => setEditingSubject(null)}
            onSave={handleEditSubject}
          />
        )}
      </div>
    </DashboardShell>
  );
}
