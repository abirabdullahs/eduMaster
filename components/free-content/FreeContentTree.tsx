'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Edit3, GripVertical, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FreeContentType } from '@/lib/types';

interface FreeContentTreeProps {
  chapters: any[];
  subjectId: string;
  onRefresh: () => void;
  onAddChapter: () => void;
  onAddTopic: (chapterId: string) => void;
  onAddContent: (topicId: string) => void;
  onSelectContentType: (topicId: string, type: FreeContentType) => void;
  onEditContent: (content: any) => void;
  isContentTypeOpen: boolean;
  onCloseContentType: () => void;
}

export default function FreeContentTree({
  chapters,
  onAddChapter,
  onAddTopic,
  onAddContent,
  onSelectContentType,
  onEditContent,
  isContentTypeOpen,
  onCloseContentType,
}: FreeContentTreeProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(chapters.map((c: any) => c.id)));
  const [pendingTopicForContent, setPendingTopicForContent] = useState<string | null>(null);

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddContentClick = (topicId: string) => {
    setPendingTopicForContent(topicId);
    onAddContent(topicId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Chapters & Topics</h3>
        <button
          onClick={onAddChapter}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
        >
          <Plus size={18} /> Add Chapter
        </button>
      </div>

      <div className="bg-[#161b22] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
        {chapters.map((chapter: any) => (
          <div key={chapter.id}>
            <div
              className="flex items-center gap-2 p-4 hover:bg-white/5 cursor-pointer"
              onClick={() => toggleChapter(chapter.id)}
            >
              {expandedChapters.has(chapter.id) ? (
                <ChevronDown size={18} className="text-slate-500" />
              ) : (
                <ChevronRight size={18} className="text-slate-500" />
              )}
              <span className="font-bold text-white flex-1">{chapter.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAddTopic(chapter.id); }}
                className="p-2 text-slate-500 hover:text-indigo-400 rounded-lg"
                title="Add Topic"
              >
                <Plus size={16} />
              </button>
            </div>
            {expandedChapters.has(chapter.id) && (
              <div className="pl-8 pr-4 pb-4 space-y-2">
                {(chapter.topics || []).map((topic: any) => (
                  <div key={topic.id} className="bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <span className="font-medium text-slate-300">{topic.name}</span>
                      <button
                        onClick={() => handleAddContentClick(topic.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg"
                      >
                        <Plus size={12} /> Add Content
                      </button>
                    </div>
                    <div className="px-3 pb-3 space-y-1">
                      {(topic.contents || []).map((content: any) => (
                        <div
                          key={content.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          <FileText size={14} className="text-slate-500" />
                          <span className="text-sm text-slate-400 flex-1">{content.title}</span>
                          <span className="text-[10px] text-slate-600 uppercase">{content.content_type}</span>
                          <button
                            onClick={() => onEditContent(content)}
                            className="p-1 text-slate-500 hover:text-white"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      ))}
                      {(!topic.contents || topic.contents.length === 0) && (
                        <p className="text-xs text-slate-600 italic px-3 py-2">No content yet</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!chapter.topics || chapter.topics.length === 0) && (
                  <p className="text-sm text-slate-500 italic">No topics. Add one with +</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
