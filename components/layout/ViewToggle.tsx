'use client';

import { useAdminView } from '@/lib/context/AdminViewContext';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, User, GraduationCap, ShieldCheck } from 'lucide-react';

export default function ViewToggle() {
  const { viewAs, setViewAs, isAdmin } = useAdminView();

  if (!isAdmin) return null;

  const roles: { role: UserRole | null; label: string; icon: any }[] = [
    { role: 'admin', label: 'Admin View', icon: ShieldCheck },
    { role: 'teacher', label: 'Teacher View', icon: GraduationCap },
    { role: 'student', label: 'Student View', icon: User },
  ];

  return (
    <div className="flex items-center gap-2 bg-[#161b22] border border-slate-800 rounded-2xl p-1.5 shadow-lg shadow-black/20">
      {roles.map((item) => {
        const Icon = item.icon;
        const isActive = (item.role === 'admin' && viewAs === null) || (item.role === viewAs);
        
        return (
          <button
            key={item.label}
            onClick={() => setViewAs(item.role === 'admin' ? null : item.role)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
              isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ViewAsBanner() {
  const { viewAs, setViewAs, isAdmin } = useAdminView();

  if (!isAdmin || !viewAs) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-600 text-white py-1.5 px-4 flex items-center justify-center gap-4 shadow-xl">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
        <Eye size={14} />
        You are currently viewing as a <span className="underline decoration-2 underline-offset-4">{viewAs}</span>
      </div>
      <button 
        onClick={() => setViewAs(null)}
        className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all flex items-center gap-1"
      >
        <EyeOff size={12} />
        Exit Simulation
      </button>
    </div>
  );
}
