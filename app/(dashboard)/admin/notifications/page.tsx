'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Bell, 
  Send, 
  Users, 
  GraduationCap, 
  User, 
  Search, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  X,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const notificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  target: z.enum(['all', 'students', 'teachers', 'course', 'specific']),
  target_user_id: z.string(),
  target_course_id: z.string(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function AdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      target: 'all',
      target_user_id: '',
      target_course_id: '',
    }
  });

  const target = watch('target');

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotifications(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase.from('courses').select('id, title').eq('status', 'published').order('title');
      setCourses(data || []);
    }
    fetchCourses();
  }, [supabase]);

  const onSubmit = async (values: NotificationFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          message: values.message,
          target: values.target,
          target_user_id: values.target === 'specific' ? values.target_user_id : undefined,
          target_course_id: values.target === 'course' ? values.target_course_id : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      reset();
      fetchHistory();
      alert(`Notification sent successfully to ${data.count || 0} user(s)!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification record?')) return;
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      fetchHistory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      {/* Send Notification Form */}
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Notification Center</h1>
          <p className="text-slate-400 mt-1">Broadcast messages to your platform users.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-indigo-500" />
            Compose Message
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notification Title</label>
              <input 
                {...register('title')}
                type="text" 
                placeholder="e.g. New Course Launch!"
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.title && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message Content</label>
              <textarea 
                {...register('message')}
                rows={4}
                placeholder="Write your message here..."
                className={cn(
                  "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.message && "border-red-500 focus:ring-red-500"
                )}
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Audience</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'all', label: 'All Users', icon: Users },
                  { id: 'students', label: 'Students Only', icon: GraduationCap },
                  { id: 'teachers', label: 'Teachers Only', icon: User },
                  { id: 'course', label: 'Course Students', icon: BookOpen },
                  { id: 'specific', label: 'Specific User', icon: Search },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue('target', item.id as any)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                      target === item.id 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-[#0d1117] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {target === 'specific' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">User ID</label>
                <input 
                  {...register('target_user_id')}
                  type="text" 
                  placeholder="Paste user UID here..."
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.target_user_id && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
            )}

            {target === 'course' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Course</label>
                <select
                  {...register('target_course_id', { required: target === 'course' })}
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.target_course_id && "border-red-500 focus:ring-red-500"
                  )}
                >
                  <option value="">Select a course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {errors.target_course_id && <p className="mt-1 text-xs text-red-500">{errors.target_course_id.message as string}</p>}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            Send Notification
          </button>
        </form>
      </div>

      {/* Notification History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={24} className="text-slate-500" />
            Recent Notifications
          </h3>
          <button onClick={fetchHistory} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Refresh</button>
        </div>

        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-slate-500 text-sm">Loading history...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center bg-[#161b22] border border-dashed border-slate-800 rounded-3xl text-slate-500">
              No notifications sent yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 space-y-3 group relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                      notif.target === 'all' ? "bg-indigo-500/10 text-indigo-500" :
                      notif.target === 'students' ? "bg-emerald-500/10 text-emerald-500" :
                      notif.target === 'teachers' ? "bg-amber-500/10 text-amber-500" :
                      notif.target === 'course' ? "bg-blue-500/10 text-blue-500" :
                      notif.target === 'specific' ? "bg-purple-500/10 text-purple-500" :
                      "bg-slate-500/10 text-slate-500"
                    )}>
                      {notif.target || 'user'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
