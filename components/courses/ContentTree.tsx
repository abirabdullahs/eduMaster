'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  GripVertical, 
  Video, 
  FileText, 
  HelpCircle,
  FolderOpen,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
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

interface ContentTreeProps {
  subjects: any[];
  onEdit: (type: 'subject' | 'chapter' | 'lecture', item: any) => void;
  onDelete: (type: 'subject' | 'chapter' | 'lecture', id: string) => void;
  onAddChild: (type: 'chapter' | 'lecture', parentId: string) => void;
  onReorder: (type: 'subject' | 'chapter' | 'lecture', items: any[]) => void;
  onManageQuestions: (lecture: any) => void;
}

export default function ContentTree({ 
  subjects, 
  onEdit, 
  onDelete, 
  onAddChild, 
  onReorder,
  onManageQuestions
}: ContentTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, type: 'subject' | 'chapter' | 'lecture', parentId?: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let items: any[] = [];
    if (type === 'subject') {
      items = subjects;
    } else if (type === 'chapter') {
      const subject = subjects.find(s => s.id === parentId);
      items = subject?.chapters || [];
    } else if (type === 'lecture') {
      // This is a bit more complex as we need to find the chapter across all subjects
      for (const subject of subjects) {
        const chapter = subject.chapters.find((c: any) => c.id === parentId);
        if (chapter) {
          items = chapter.lectures || [];
          break;
        }
      }
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    
    onReorder(type, newItems);
  };

  return (
    <div className="space-y-4">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={(e) => handleDragEnd(e, 'subject')}
      >
        <SortableContext items={subjects.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {subjects.map((subject) => (
            <SortableItem 
              key={subject.id} 
              id={subject.id} 
              type="subject"
              item={subject}
              onEdit={() => onEdit('subject', subject)}
              onDelete={() => onDelete('subject', subject.id)}
              onAddChild={() => onAddChild('chapter', subject.id)}
            >
              <div className="p-4 space-y-4">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={(e) => handleDragEnd(e, 'chapter', subject.id)}
                >
                  <SortableContext items={subject.chapters.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    {subject.chapters.map((chapter: any) => (
                      <SortableItem 
                        key={chapter.id} 
                        id={chapter.id} 
                        type="chapter"
                        item={chapter}
                        onEdit={() => onEdit('chapter', chapter)}
                        onDelete={() => onDelete('chapter', chapter.id)}
                        onAddChild={() => onAddChild('lecture', chapter.id)}
                      >
                        <div className="p-4 space-y-2">
                          <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={(e) => handleDragEnd(e, 'lecture', chapter.id)}
                          >
                            <SortableContext items={chapter.lectures.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
                              {chapter.lectures.map((lecture: any) => (
                                <SortableItem 
                                  key={lecture.id} 
                                  id={lecture.id} 
                                  type="lecture"
                                  item={lecture}
                                  onEdit={() => onEdit('lecture', lecture)}
                                  onDelete={() => onDelete('lecture', lecture.id)}
                                  onManageQuestions={() => onManageQuestions(lecture)}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                          {chapter.lectures.length === 0 && (
                            <p className="text-xs text-slate-500 italic text-center py-2">No lectures yet.</p>
                          )}
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
                {subject.chapters.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-2">No chapters yet.</p>
                )}
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableItem({ 
  id, 
  type, 
  item, 
  children, 
  onEdit, 
  onDelete, 
  onAddChild,
  onManageQuestions
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const [isExpanded, setIsExpanded] = useState(type === 'subject');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = () => {
    switch (type) {
      case 'subject': return <BookOpen size={18} className="text-indigo-400" />;
      case 'chapter': return <FolderOpen size={16} className="text-amber-400" />;
      case 'lecture': return <Video size={14} className="text-emerald-400" />;
      default: return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "rounded-2xl border transition-all duration-200",
      type === 'subject' ? "bg-[#161b22] border-slate-800" : 
      type === 'chapter' ? "bg-[#0d1117] border-slate-800/50" : 
      "bg-white/5 border-white/5",
      isDragging && "shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/50"
    )}>
      <div className={cn(
        "flex items-center justify-between p-4 group",
        type === 'subject' ? "bg-[#1c2128]" : ""
      )}>
        <div className="flex items-center gap-3 flex-1">
          <button 
            {...attributes} 
            {...listeners}
            className="p-1.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing rounded-lg hover:bg-white/5 transition-colors"
          >
            <GripVertical size={16} />
          </button>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 flex-1 text-left"
          >
            <div className="text-slate-500">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className={cn(
                "font-bold tracking-tight",
                type === 'subject' ? "text-lg text-white" : 
                type === 'chapter' ? "text-sm text-slate-200" : 
                "text-xs text-slate-300"
              )}>
                {item.title}
              </span>
              {type === 'chapter' && item.pdf_url && (
                <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded uppercase tracking-widest border border-red-500/20">
                  PDF
                </span>
              )}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAddChild && (
            <button 
              onClick={onAddChild}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-500/20 transition-all mr-2"
            >
              <Plus size={12} />
              Add {type === 'subject' ? 'Chapter' : 'Lecture'}
            </button>
          )}
          {type === 'lecture' && onManageQuestions && (
            <button 
              onClick={onManageQuestions}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all mr-2"
            >
              <HelpCircle size={12} />
              MCQs
            </button>
          )}
          <button 
            onClick={onEdit}
            className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
