'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Bell, 
  Calendar, 
  GraduationCap, 
  CreditCard,
  LogOut,
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { useAdminView } from '@/lib/context/AdminViewContext';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/lib/context/SidebarContext';

interface SidebarLink {
  href: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const sidebarLinks: SidebarLink[] = [
  // Admin Links
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, roles: ['admin'] },
  { href: '/admin/teachers?tab=pending', label: 'Teacher Requests', icon: UserCheck, roles: ['admin'] },
  { href: '/admin/teachers', label: 'Teachers', icon: GraduationCap, roles: ['admin'] },
  { href: '/admin/students', label: 'Students', icon: Users, roles: ['admin'] },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, roles: ['admin'] },
  { href: '/admin/enrollments', label: 'Enrollments', icon: CreditCard, roles: ['admin'] },
  { href: '/admin/free-content', label: 'Free Content', icon: BookOpen, roles: ['admin'] },
  { href: '/admin/exams', label: 'Exams', icon: FileText, roles: ['admin'] },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, roles: ['admin'] },
  { href: '/admin/events', label: 'Events', icon: Calendar, roles: ['admin'] },

  // Teacher Links
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard, roles: ['teacher'] },
  { href: '/teacher/courses', label: 'My Courses', icon: BookOpen, roles: ['teacher'] },
  { href: '/teacher/exams', label: 'My Exams', icon: FileText, roles: ['teacher'] },
  { href: '/teacher/students', label: 'My Students', icon: Users, roles: ['teacher'] },
  { href: '/teacher/notifications', label: 'Send Notification', icon: Bell, roles: ['teacher'] },

  // Student Links
  { href: '/student', label: 'My Dashboard', icon: LayoutDashboard, roles: ['student'] },
  { href: '/learn', label: 'Free Learning', icon: BookOpen, roles: ['student'] },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen, roles: ['student'] },
  { href: '/student/exams', label: 'My Exams', icon: FileText, roles: ['student'] },
  { href: '/student/payments', label: 'Payments', icon: CreditCard, roles: ['student'] },
];

export default function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { viewAs, isAdmin } = useAdminView();
  const { signOut } = useAuth();
  const { sidebarOpen, closeSidebar } = useSidebar();

  // If admin is viewing as another role, use that role for sidebar links
  const effectiveRole = (isAdmin && viewAs) ? viewAs : role;
  
  const filteredLinks = sidebarLinks.filter(link => link.roles.includes(effectiveRole));

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={closeSidebar}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-[#0d1117] border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-out",
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile close button */}
        <div className="md:hidden absolute top-4 right-4">
          <button onClick={closeSidebar} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>
      {/* Logo */}
      <div className="p-6 pr-14 md:pr-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">EduMaster</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="pb-2 px-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {effectiveRole} Menu
          </p>
        </div>
        
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeSidebar}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl transition-all group",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={cn(isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="text-sm font-medium">{link.label}</span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
}
