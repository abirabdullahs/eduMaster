'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `student_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-[#161b22] border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#161b22]" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-[#161b22] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 font-bengali">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">নোটিফিকেশন</h3>
              <Link 
                href="/student/notifications" 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    className={cn(
                      "p-3 rounded-xl transition-all flex gap-3 relative overflow-hidden",
                      n.is_read ? "bg-transparent opacity-60" : "bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      n.type === 'alert' ? "bg-amber-500/10 text-amber-500" : 
                      n.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
                    )}>
                      {n.type === 'alert' ? <AlertTriangle size={16} /> : 
                       n.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{format(new Date(n.created_at), 'MMM d, p')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-500 text-xs font-bold">
                  কোনো নোটিফিকেশন নেই
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
