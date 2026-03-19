'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, CreditCard, GraduationCap, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ActivityItem {
  id: string;
  activity_type: string;
  title: string;
  entity_type: string;
  entity_id: string | null;
  href: string;
  created_at: string;
}

const iconMap: Record<string, typeof BookOpen> = {
  course: BookOpen,
  enrollment: CreditCard,
  teacher: GraduationCap,
  default: FileText,
};

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch('/api/admin/activity?limit=100&hours=48&all=true');
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Activity (48 Hours)</h1>
            <p className="text-slate-400 mt-1">Your recent actions across the platform</p>
          </div>
        </div>
      </div>

      <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="mt-4">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <Clock size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="font-medium">No admin activity in the last 48 hours</p>
            <p className="text-sm mt-2">Create courses, approve enrollments, or add free content to see activity here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {activities.map((a) => {
              const Icon = iconMap[a.entity_type] || iconMap.default;
              return (
                <Link
                  key={a.id}
                  href={a.href}
                  className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-indigo-400">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {format(new Date(a.created_at), 'MMM d, yyyy h:mm a')} • {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{a.entity_type}</span>
                  <ArrowLeft size={18} className="text-slate-500 group-hover:text-indigo-400 rotate-180" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
