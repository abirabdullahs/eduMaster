'use client';

import { FileText, HelpCircle, Edit3, Video, Layers, CheckSquare, Minus, Link2, Sigma, Image as ImageIcon, Key, Code, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FreeContentType } from '@/lib/types';

const TYPES: { type: FreeContentType; label: string; icon: any }[] = [
  { type: 'markdown', label: 'Markdown', icon: FileText },
  { type: 'mcq', label: 'MCQ', icon: HelpCircle },
  { type: 'short_answer', label: 'Short Answer', icon: Edit3 },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'flashcard', label: 'Flashcard', icon: Layers },
  { type: 'true_false', label: 'True/False', icon: CheckSquare },
  { type: 'fill_blank', label: 'Fill in the Blank', icon: Minus },
  { type: 'latex_formula', label: 'Formula (LaTeX)', icon: Sigma },
  { type: 'image_diagram', label: 'Image/Diagram', icon: ImageIcon },
  { type: 'key_points', label: 'Key Points', icon: Key },
  { type: 'match_following', label: 'Match Following', icon: Link2 },
  { type: 'code_snippet', label: 'Code Snippet', icon: Code },
  { type: 'mnemonic', label: 'Mnemonic', icon: Brain },
];

interface ContentTypeSelectorProps {
  topicId: string;
  onSelect: (type: FreeContentType) => void;
  onClose: () => void;
}

export default function ContentTypeSelector({ topicId, onSelect, onClose }: ContentTypeSelectorProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Select Content Type</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl">
            ×
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex flex-col items-center gap-2 p-4 bg-[#0d1117] border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
            >
              <Icon size={24} className="text-indigo-400" />
              <span className="text-sm font-medium text-white">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
