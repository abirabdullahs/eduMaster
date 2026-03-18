'use client';

import { useAuth } from '@/hooks/useAuth';
import { Search, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ViewToggle from './ViewToggle';
import NotificationBell from '../shared/NotificationBell';

export default function DashboardNavbar() {
  const { user, profile, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-20 bg-[#0a0e17]/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Search for courses, students, or exams..." 
          className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <ViewToggle />
        
        <div className="flex items-center gap-4">
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 bg-[#161b22] border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                {profile?.name?.[0] || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{profile?.name || 'User'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{profile?.role || 'Role'}</p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#161b22] border border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-800 mb-2">
                  <p className="text-sm font-bold text-white">{profile?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                </div>
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                  <User size={16} />
                  Profile
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                  <Settings size={16} />
                  Settings
                </button>
                <div className="h-px bg-slate-800 my-2" />
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
