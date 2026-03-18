'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Loader2, ArrowLeft, Plus, Edit3, Trash2, GripVertical,
  ChevronDown, ChevronRight, FileText, HelpCircle, Video, Image as ImageIcon,
  Type, CheckSquare, Link2, Code, Brain, Hash
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import FreeContentTree from '@/components/free-content/FreeContentTree';
import ContentTypeSelector from '@/components/free-content/ContentTypeSelector';
import FreeContentForms from '@/components/free-content/FreeContentForms';
import type { FreeContentType } from '@/lib/types';

function EditChapterTopicModal({
  title,
  initialName,
  onClose,
  onSave,
}: {
  title: string;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErr('নাম দিন');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await onSave(trimmed);
    } catch (e: any) {
      setErr(e.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d1117] border border-slate-700 rounded-xl text-white placeholder-slate-500"
            placeholder="নাম দিন"
            autoFocus
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white rounded-xl">
              বাতিল
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl disabled:opacity-50">
              {saving ? 'সংরক্ষণ...' : 'সংরক্ষণ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminFreeSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentTypeModal, setContentTypeModal] = useState<{ topicId: string } | null>(null);
  const [contentForm, setContentForm] = useState<{ topicId: string; type: FreeContentType; content?: any } | null>(null);
  const [editingChapter, setEditingChapter] = useState<any | null>(null);
  const [editingTopic, setEditingTopic] = useState<{ topic: any; chapterId: string } | null>(null);
  const [addingChapter, setAddingChapter] = useState(false);
  const [addingTopic, setAddingTopic] = useState<{ chapterId: string } | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: subj } = await supabase
        .from('free_subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
      setSubject(subj);

      const { data: chaps } = await supabase
        .from('free_chapters')
        .select(`
          *,
          topics:free_topics (
            *,
            contents:free_contents (*)
          )
        `)
        .eq('subject_id', subjectId)
        .order('order_index');

      const sorted = (chaps || []).map((c: any) => ({
        ...c,
        topics: (c.topics || []).sort((a: any, b: any) => a.order_index - b.order_index).map((t: any) => ({
          ...t,
          contents: (t.contents || []).sort((a: any, b: any) => a.order_index - b.order_index),
        })),
      })).sort((a: any, b: any) => a.order_index - b.order_index);
      setChapters(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [subjectId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddChapter = () => setAddingChapter(true);

  const handleAddTopic = (chapterId: string) => setAddingTopic({ chapterId });

  const handleSelectContentType = (topicId: string, type: FreeContentType) => {
    setContentTypeModal(null);
    setContentForm({ topicId, type });
  };

  const handleEditContent = (content: any) => {
    setContentForm({ topicId: content.topic_id, type: content.content_type as FreeContentType, content });
  };

  const handleEditChapter = (chapter: any) => setEditingChapter(chapter);
  const handleDeleteChapter = async (chapter: any) => {
    if (!confirm(`Delete chapter "${chapter.name}" and all its topics/contents?`)) return;
    const { error } = await supabase.from('free_chapters').delete().eq('id', chapter.id);
    if (!error) fetchData();
    else alert('Failed: ' + error.message);
  };

  const handleEditTopic = (topic: any, chapterId: string) => setEditingTopic({ topic, chapterId });
  const handleDeleteTopic = async (topic: any) => {
    if (!confirm(`Delete topic "${topic.name}" and all its contents?`)) return;
    const { error } = await supabase.from('free_topics').delete().eq('id', topic.id);
    if (!error) fetchData();
    else alert('Failed: ' + error.message);
  };

  if (loading || !subject) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <Link href="/admin/free-content" className="inline-flex items-center gap-2 text-slate-400 hover:text-white">
          <ArrowLeft size={18} /> Back to Free Content
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
            <p className="text-slate-400 text-sm">{subject.description || 'No description'}</p>
          </div>
        </div>

        <FreeContentTree
          chapters={chapters}
          subjectId={subjectId}
          onRefresh={fetchData}
          onAddChapter={handleAddChapter}
          onAddTopic={handleAddTopic}
          onAddContent={(topicId) => setContentTypeModal({ topicId })}
          onSelectContentType={handleSelectContentType}
          onEditContent={handleEditContent}
          onEditChapter={handleEditChapter}
          onDeleteChapter={handleDeleteChapter}
          onEditTopic={handleEditTopic}
          onDeleteTopic={handleDeleteTopic}
          isContentTypeOpen={!!contentTypeModal}
          onCloseContentType={() => setContentTypeModal(null)}
        />
      </div>

      {contentTypeModal && (
        <ContentTypeSelector
          topicId={contentTypeModal.topicId}
          onSelect={(type) => handleSelectContentType(contentTypeModal.topicId, type)}
          onClose={() => setContentTypeModal(null)}
        />
      )}

      {contentForm && contentForm.type && (
        <FreeContentForms
          topicId={contentForm.topicId}
          contentType={contentForm.type}
          initialData={contentForm.content}
          onClose={() => setContentForm(null)}
          onSuccess={() => {
            setContentForm(null);
            fetchData();
          }}
        />
      )}

      {/* Edit Chapter Modal */}
      {editingChapter && (
        <EditChapterTopicModal
          title="Edit Chapter"
          initialName={editingChapter.name}
          onClose={() => setEditingChapter(null)}
          onSave={async (name: string) => {
            const { error } = await supabase.from('free_chapters').update({ name }).eq('id', editingChapter.id);
            if (!error) {
              setEditingChapter(null);
              fetchData();
            } else throw new Error(error.message);
          }}
        />
      )}

      {/* Edit Topic Modal */}
      {editingTopic && (
        <EditChapterTopicModal
          title="Edit Topic"
          initialName={editingTopic.topic.name}
          onClose={() => setEditingTopic(null)}
          onSave={async (name: string) => {
            const { error } = await supabase.from('free_topics').update({ name }).eq('id', editingTopic.topic.id);
            if (!error) {
              setEditingTopic(null);
              fetchData();
            } else throw new Error(error.message);
          }}
        />
      )}

      {/* Add Chapter Modal - নাম দিয়ে add */}
      {addingChapter && (
        <EditChapterTopicModal
          title="Add Chapter"
          initialName=""
          onClose={() => setAddingChapter(false)}
          onSave={async (name: string) => {
            const { error } = await supabase
              .from('free_chapters')
              .insert({ subject_id: subjectId, name, order_index: chapters.length });
            if (!error) {
              setAddingChapter(false);
              fetchData();
            } else throw new Error(error.message);
          }}
        />
      )}

      {/* Add Topic Modal - নাম দিয়ে add */}
      {addingTopic && (
        <EditChapterTopicModal
          title="Add Topic"
          initialName=""
          onClose={() => setAddingTopic(null)}
          onSave={async (name: string) => {
            const ch = chapters.find(c => c.id === addingTopic.chapterId);
            const len = ch?.topics?.length ?? 0;
            const { error } = await supabase
              .from('free_topics')
              .insert({ chapter_id: addingTopic.chapterId, name, order_index: len });
            if (!error) {
              setAddingTopic(null);
              fetchData();
            } else throw new Error(error.message);
          }}
        />
      )}
    </DashboardShell>
  );
}
