'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Edit3, GripVertical, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FreeContentType } from '@/lib/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FreeContentTreeProps {
  chapters: any[];
  subjectId: string;
  onRefresh: () => void;
  onAddChapter: () => void;
  onAddTopic: (chapterId: string) => void;
  onAddContent: (topicId: string) => void;
  onSelectContentType: (topicId: string, type: FreeContentType) => void;
  onEditContent: (content: any) => void;
  onEditChapter: (chapter: any) => void;
  onDeleteChapter: (chapter: any) => void;
  onEditTopic: (topic: any, chapterId: string) => void;
  onDeleteTopic: (topic: any) => void;
  onReorderContent: (topicId: string, items: any[]) => void;
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
  onEditChapter,
  onDeleteChapter,
  onEditTopic,
  onDeleteTopic,
  onReorderContent,
  isContentTypeOpen,
  onCloseContentType,
}: FreeContentTreeProps) {
  const allTopicIds = chapters.flatMap((c: any) => (c.topics || []).map((t: any) => t.id));
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(chapters.map((c: any) => c.id)));
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => new Set(allTopicIds));

  // Keep expandedTopics in sync when chapters/topics change (e.g. new topic added)
  useEffect(() => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      let changed = false;
      for (const id of allTopicIds) {
        if (!next.has(id)) { next.add(id); changed = true; }
      }
      return changed ? next : prev;
    });
  }, [allTopicIds.join(',')]);
  const [pendingTopicForContent, setPendingTopicForContent] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => {
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
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEditChapter(chapter)}
                  className="p-2 text-slate-500 hover:text-indigo-400 rounded-lg"
                  title="Edit Chapter"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => onDeleteChapter(chapter)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg"
                  title="Delete Chapter"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => onAddTopic(chapter.id)}
                  className="p-2 text-slate-500 hover:text-indigo-400 rounded-lg"
                  title="Add Topic"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            {expandedChapters.has(chapter.id) && (
              <div className="pl-8 pr-4 pb-4 space-y-2">
                {(chapter.topics || []).map((topic: any) => (
                  <div key={topic.id} className="bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden">
                    <div
                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-white/5"
                      onClick={() => toggleTopic(topic.id)}
                    >
                      {expandedTopics.has(topic.id) ? (
                        <ChevronDown size={16} className="text-slate-500 shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-500 shrink-0" />
                      )}
                      <span className="font-medium text-slate-300 flex-1">{topic.name}</span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditTopic(topic, chapter.id)}
                          className="p-1.5 text-slate-500 hover:text-indigo-400 rounded-lg"
                          title="Edit Topic"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteTopic(topic)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                          title="Delete Topic"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => handleAddContentClick(topic.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg"
                        >
                          <Plus size={12} /> Add Content
                        </button>
                      </div>
                    </div>
                    {expandedTopics.has(topic.id) && (
                    <div className="px-3 pb-3 space-y-1 pl-6">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e: DragEndEvent) => {
                          const { active, over } = e;
                          if (!over || active.id === over.id) return;
                          const contents = (topic.contents || []);
                          const oldIdx = contents.findIndex((c: any) => c.id === active.id);
                          const newIdx = contents.findIndex((c: any) => c.id === over.id);
                          if (oldIdx >= 0 && newIdx >= 0) {
                            onReorderContent(topic.id, arrayMove(contents, oldIdx, newIdx));
                          }
                        }}
                      >
                        <SortableContext items={(topic.contents || []).map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                          {(topic.contents || []).map((content: any) => (
                            <SortableContentItem
                              key={content.id}
                              content={content}
                              onEdit={() => onEditContent(content)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      {(!topic.contents || topic.contents.length === 0) && (
                        <p className="text-xs text-slate-600 italic px-3 py-2">No content yet. Drag to reorder when you add content.</p>
                      )}
                    </div>
                    )}
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

function SortableContentItem({ content, onEdit }: { content: any; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: content.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10",
        isDragging && "opacity-50 shadow-lg z-10"
      )}
    >
      <button {...attributes} {...listeners} className="p-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} />
      </button>
      <FileText size={14} className="text-slate-500 shrink-0" />
      <span className="text-sm text-slate-400 flex-1">{content.title}</span>
      <span className="text-[10px] text-slate-600 uppercase">{content.content_type}</span>
      <button onClick={onEdit} className="p-1 text-slate-500 hover:text-white">
        <Edit3 size={14} />
      </button>
    </div>
  );
}
