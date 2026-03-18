'use client';

import { useState } from 'react';
import { 
  Clock, 
  Infinity, 
  Play, 
  Settings2,
  ChevronRight,
  Zap,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeModeProps {
  onStart: (config: { timed: boolean; duration?: number }) => void;
}

export default function PracticeMode({ onStart }: PracticeModeProps) {
  const [mode, setMode] = useState<'timed' | 'untimed' | 'custom'>('timed');
  const [customDuration, setCustomDuration] = useState(30);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timed Mode */}
        <button
          onClick={() => setMode('timed')}
          className={cn(
            "p-6 rounded-2xl border text-left transition-all space-y-4 group",
            mode === 'timed' 
              ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20" 
              : "bg-[#161b22] border-slate-800 hover:border-slate-700 hover:bg-[#1c2128]"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            mode === 'timed' ? "bg-white text-indigo-600" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
          )}>
            <Timer size={20} />
          </div>
          <div className="space-y-1">
            <h4 className={cn("font-bold text-sm", mode === 'timed' ? "text-white" : "text-slate-300")}>Timed</h4>
            <p className={cn("text-[10px]", mode === 'timed' ? "text-indigo-200" : "text-slate-500")}>Original duration</p>
          </div>
        </button>

        {/* Untimed Mode */}
        <button
          onClick={() => setMode('untimed')}
          className={cn(
            "p-6 rounded-2xl border text-left transition-all space-y-4 group",
            mode === 'untimed' 
              ? "bg-purple-600 border-purple-500 shadow-xl shadow-purple-500/20" 
              : "bg-[#161b22] border-slate-800 hover:border-slate-700 hover:bg-[#1c2128]"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            mode === 'untimed' ? "bg-white text-purple-600" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
          )}>
            <Infinity size={20} />
          </div>
          <div className="space-y-1">
            <h4 className={cn("font-bold text-sm", mode === 'untimed' ? "text-white" : "text-slate-300")}>Untimed</h4>
            <p className={cn("text-[10px]", mode === 'untimed' ? "text-purple-200" : "text-slate-500")}>No time limit</p>
          </div>
        </button>

        {/* Custom Mode */}
        <button
          onClick={() => setMode('custom')}
          className={cn(
            "p-6 rounded-2xl border text-left transition-all space-y-4 group",
            mode === 'custom' 
              ? "bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-500/20" 
              : "bg-[#161b22] border-slate-800 hover:border-slate-700 hover:bg-[#1c2128]"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            mode === 'custom' ? "bg-white text-emerald-600" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
          )}>
            <Settings2 size={20} />
          </div>
          <div className="space-y-1">
            <h4 className={cn("font-bold text-sm", mode === 'custom' ? "text-white" : "text-slate-300")}>Custom</h4>
            <p className={cn("text-[10px]", mode === 'custom' ? "text-emerald-200" : "text-slate-500")}>Set your time</p>
          </div>
        </button>
      </div>

      {mode === 'custom' && (
        <div className="p-6 bg-[#161b22] border border-slate-800 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-400">Duration (Minutes)</label>
            <span className="text-xl font-bold text-emerald-500">{customDuration}m</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="180" 
            step="5"
            value={customDuration}
            onChange={(e) => setCustomDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      )}

      <button
        onClick={() => onStart({
          timed: mode !== 'untimed',
          duration: mode === 'custom' ? customDuration : undefined
        })}
        className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 group shadow-xl"
      >
        <Play size={20} className="fill-current" />
        Start Practice Session
        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
