'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import SafeMarkdown from '@/components/shared/SafeMarkdown';

export default function RecentNotificationCards({ notifications }: { notifications: any[] }) {
  const [modalNotif, setModalNotif] = useState<any | null>(null);
  const router = useRouter();

  const handleClick = (notif: any) => {
    const link = notif.action_link;
    if (link) {
      if (link.startsWith('http')) window.location.href = link;
      else router.push(link);
    } else {
      setModalNotif(notif);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {notifications?.map((notif) => {
          const body = notif.body ?? notif.message ?? '';
          return (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={cn(
                "bg-[#161b22] border rounded-2xl p-5 space-y-2 transition-all cursor-pointer hover:border-indigo-500/50",
                notif.is_read ? "border-slate-800 opacity-60" : "border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/5"
              )}
            >
              <h4 className="font-bold text-white text-sm">{notif.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {(body || '').replace(/#{1,6}\s/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}
              </p>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                {format(new Date(notif.created_at), 'MMM d, p')}
              </p>
            </div>
          );
        })}
        {(!notifications || notifications.length === 0) && (
          <div className="p-8 text-center text-slate-600 bg-[#161b22] border border-slate-800 rounded-2xl text-xs">
            কোনো নোটিফিকেশন নেই।
          </div>
        )}
        {notifications && notifications.length > 0 && (
          <Link href="/student/notifications" className="block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
            সবগুলো দেখুন
          </Link>
        )}
      </div>

      {modalNotif && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 font-bengali"
          onClick={() => setModalNotif(null)}
        >
          <div
            className="bg-[#161b22] border border-slate-800 rounded-3xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{modalNotif.title}</h3>
                <button
                  onClick={() => setModalNotif(null)}
                  className="p-2 text-slate-500 hover:text-white rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400 prose-li:text-slate-300">
                <SafeMarkdown>{modalNotif.body ?? modalNotif.message ?? ''}</SafeMarkdown>
              </div>
            </div>
        </div>
      )}
    </>
  );
}
