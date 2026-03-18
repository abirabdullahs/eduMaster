'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { Loader2, Plus, BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FreeClass, FreeSubject } from '@/lib/types';

export default function AdminFreeContentPage() {
  const [activeTab, setActiveTab] = useState<'SSC' | 'HSC'>('SSC');
  const [classes, setClasses] = useState<FreeClass[]>([]);
  const [subjects, setSubjects] = useState<FreeSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingSubject, setAddingSubject] = useState(false);
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
                    <Link
                      key={s.id}
                      href={`/admin/free-content/${s.id}`}
                      className="group bg-[#161b22] border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {s.thumbnail_url ? (
                          <img src={s.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
                            <BookOpen size={24} className="text-slate-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-white group-hover:text-indigo-400">{s.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{s.description || 'No description'}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-500 group-hover:text-indigo-400" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
