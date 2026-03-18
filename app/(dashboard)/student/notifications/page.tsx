'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  Bell, 
  Loader2, 
  CheckCircle2, 
  Trash2, 
  Calendar,
  Clock,
  Info,
  AlertTriangle,
  MailOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

export default function StudentNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('student_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">নোটিফিকেশন</h1>
            <p className="text-slate-400">আপনার কোর্সের আপডেট এবং গুরুত্বপূর্ণ তথ্যগুলো এখানে পাবেন।</p>
          </div>
          <button 
            onClick={markAllAsRead}
            className="px-6 py-3 bg-[#161b22] border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500 rounded-2xl text-sm font-bold transition-all flex items-center gap-2"
          >
            <MailOpen size={18} />
            সবগুলো পঠিত হিসেবে চিহ্নিত করুন
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-slate-500 font-bold animate-pulse">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "group bg-[#161b22] border rounded-3xl p-6 transition-all flex gap-6 relative overflow-hidden",
                    notification.is_read ? "border-slate-800 opacity-60" : "border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                  )}
                >
                  {!notification.is_read && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    notification.type === 'alert' ? "bg-amber-500/10 text-amber-500" : 
                    notification.type === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-500/10 text-indigo-500"
                  )}>
                    {notification.type === 'alert' ? <AlertTriangle size={24} /> : 
                     notification.type === 'success' ? <CheckCircle2 size={24} /> : <Info size={24} />}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={cn(
                        "text-lg font-bold transition-colors",
                        notification.is_read ? "text-slate-400" : "text-white group-hover:text-indigo-400"
                      )}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <Clock size={14} />
                        {format(new Date(notification.created_at), 'MMM d, p')}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{notification.message}</p>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                        title="Mark as read"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-6 bg-[#161b22] border border-slate-800 rounded-3xl">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                  <Bell size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">কোনো নোটিফিকেশন নেই</h3>
                  <p className="text-slate-500">সবকিছু আপ-টু-ডেট আছে।</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
