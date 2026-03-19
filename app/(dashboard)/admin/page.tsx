'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  Bell,
  Clock,
  FileText,
  Calendar,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  pendingEnrollments: number;
  pendingTeachers: number;
  newStudentsThisWeek: number;
  newTeachersThisWeek: number;
  newCoursesThisWeek: number;
}

interface RecentEnrollment {
  id: string;
  created_at: string;
  status: string;
  profiles: { name: string; email?: string } | null;
  courses: { title: string } | null;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoIso = weekAgo.toISOString();

        const [
          { count: studentsCount },
          { count: teachersCount },
          { count: coursesCount },
          { count: pendingEnrollmentsCount },
          { count: pendingTeachersCount },
          { count: newStudentsThisWeek },
          { count: newTeachersThisWeek },
          { count: newCoursesThisWeek },
          { data: recentEnrollments }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('status', 'active'),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('status', 'pending'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('created_at', weekAgoIso),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').gte('created_at', weekAgoIso),
          supabase.from('courses').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoIso),
          supabase.from('enrollments').select(`
            id, created_at, status,
            profiles:student_id (name, email),
            courses (title)
          `).order('created_at', { ascending: false }).limit(8)
        ]);

        setStats({
          totalStudents: studentsCount || 0,
          totalTeachers: teachersCount || 0,
          totalCourses: coursesCount || 0,
          pendingEnrollments: pendingEnrollmentsCount || 0,
          pendingTeachers: pendingTeachersCount || 0,
          newStudentsThisWeek: newStudentsThisWeek || 0,
          newTeachersThisWeek: newTeachersThisWeek || 0,
          newCoursesThisWeek: newCoursesThisWeek || 0,
        });
        setRecentActivity((recentEnrollments || []) as RecentEnrollment[]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: stats?.newStudentsThisWeek ? `+${stats.newStudentsThisWeek} this week` : 'Live', href: undefined as string | undefined },
    { label: 'Active Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: stats?.newTeachersThisWeek ? `+${stats.newTeachersThisWeek} this week` : 'Live', href: undefined as string | undefined },
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: stats?.newCoursesThisWeek ? `+${stats.newCoursesThisWeek} this week` : 'Live', href: undefined as string | undefined },
    { label: 'Pending Enrollments', value: stats?.pendingEnrollments || 0, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Critical', href: '/admin/enrollments' },
    { label: 'Teacher Requests', value: stats?.pendingTeachers || 0, icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'New', href: '/admin/teachers?tab=pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/courses/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} />
            Create Course
          </Link>
          <Link 
            href="/admin/notifications"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#161b22] border border-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            <Bell size={18} />
            Send Notice
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 space-y-4 group hover:border-indigo-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                  <Icon size={24} />
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  stat.trend === 'Critical' ? "bg-red-500/10 text-red-500" :
                  stat.trend === 'New' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
              </div>
              {stat.href && (
                <Link href={stat.href} className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest pt-2">
                  View Details <ArrowUpRight size={10} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              Recent Activity
            </h3>
            <Link href="/admin/enrollments" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="py-8 text-center text-slate-500">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No recent enrollments yet.</div>
            ) : (
              recentActivity.map((e) => {
                const studentName = (e.profiles as { name?: string } | null)?.name || 'Unknown';
                const courseTitle = (e.courses as { title?: string } | null)?.title || 'Unknown Course';
                return (
                  <Link key={e.id} href="/admin/enrollments" className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        <span className="text-indigo-400 font-bold">{studentName}</span> enrolled in <span className="text-purple-400 font-bold">{courseTitle}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })} • {e.status}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="space-y-8">
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: 'Add Student', icon: Users, color: 'bg-blue-500/10 text-blue-500', href: '/admin/students' },
                { label: 'New Exam', icon: FileText, color: 'bg-purple-500/10 text-purple-500', href: '/admin/exams' },
                { label: 'Add Event', icon: Calendar, color: 'bg-emerald-500/10 text-emerald-500', href: '/admin/events' },
                { label: 'Settings', icon: Settings, color: 'bg-slate-500/10 text-slate-500', href: '/settings' },
              ].map((action, index) => (
                <Link 
                  key={index}
                  href={action.href}
                  className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-3 text-center"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-white">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-indigo-500/20">
            <h3 className="text-lg font-bold">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-100">Database</span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {loading ? '...' : 'Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
