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

export default function AdminFreeSubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentTypeModal, setContentTypeModal] = useState<{ topicId: string } | null>(null);
  const [contentForm, setContentForm] = useState<{ topicId: string; type: FreeContentType; content?: any } | null>(null);
  const [addingChapter, setAddingChapter] = useState(false);
  const [addingTopic, setAddingTopic] = useState<string | null>(null);
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

  const handleAddChapter = async () => {
    const { data, error } = await supabase
      .from('free_chapters')
      .insert({ subject_id: subjectId, name: 'New Chapter', order_index: chapters.length })
      .select('id')
      .single();
    if (!error) fetchData();
  };

  const handleAddTopic = async (chapterId: string) => {
    const ch = chapters.find(c => c.id === chapterId);
    const len = ch?.topics?.length ?? 0;
    const { error } = await supabase
      .from('free_topics')
      .insert({ chapter_id: chapterId, name: 'New Topic', order_index: len });
    if (!error) fetchData();
    setAddingTopic(null);
  };

  const handleSelectContentType = (topicId: string, type: FreeContentType) => {
    setContentTypeModal(null);
    setContentForm({ topicId, type });
  };

  const handleEditContent = (content: any) => {
    setContentForm({ topicId: content.topic_id, type: content.content_type as FreeContentType, content });
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
    </DashboardShell>
  );
}
