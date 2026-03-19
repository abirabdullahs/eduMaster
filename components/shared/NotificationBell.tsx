'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Inbox, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import SafeMarkdown from '@/components/shared/SafeMarkdown';
import type { Notification } from '@/lib/types';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalNotif, setModalNotif] = useState<Notification | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { profile } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    const link = (n as any).action_link;
    if (link) {
      setIsOpen(false);
      if (link.startsWith('http')) window.location.href = link;
      else router.push(link);
    } else {
      setModalNotif(n);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0d1117]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#161b22] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-800">
                {notifications.slice(0, 5).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-white/5 transition-all space-y-1 relative group",
                      !notification.is_read && "bg-indigo-500/5"
                    )}
                  >
                    {!notification.is_read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn("text-xs font-bold leading-tight", notification.is_read ? "text-slate-300" : "text-white")}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {(notification.body || '').replace(/#{1,6}\s/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-600">
                  <Inbox size={24} />
                </div>
                <p className="text-xs text-slate-500">No notifications yet</p>
              </div>
            )}
          </div>

          {profile?.role === 'student' && (
            <div className="p-3 bg-slate-800/20 border-t border-slate-800 text-center">
              <Link
                href="/student/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}

      {modalNotif && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setModalNotif(null)}
        >
          <div
            className="bg-[#161b22] border border-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{modalNotif.title}</h3>
                <button
                  onClick={() => setModalNotif(null)}
                  className="p-2 text-slate-500 hover:text-white rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-a:text-indigo-400">
                <SafeMarkdown>{modalNotif.body || ''}</SafeMarkdown>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
