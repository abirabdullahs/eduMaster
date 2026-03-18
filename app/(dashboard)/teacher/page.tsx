import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { BookOpen, Users, FileText, Clock, ArrowRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'teacher') redirect(`/${profile?.role || 'login'}`)

  // Fetch Teacher's Courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .eq('teacher_id', session.user.id)

  const courseIds = courses?.map(c => c.id) || []

  // Fetch Enrollments for these courses
  const { count: totalStudents } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .in('course_id', courseIds)
    .eq('status', 'active')

  // Fetch Exams for these courses
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .in('course_id', courseIds)
    .order('start_time', { ascending: true })

  const now = new Date().toISOString()
  const upcomingExams = exams?.filter(e => e.start_time && e.start_time > now) || []

  // Fetch Recent Attempts (Pending Review is a placeholder for now, showing recent 5)
  const { data: recentAttempts } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      profiles:student_id (name),
      exams:exam_id (title)
    `)
    .in('exam_id', exams?.map(e => e.id) || [])
    .order('submitted_at', { ascending: false })
    .limit(5)

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-indigo-400">{profile.name}</span>!
            </h1>
            <p className="text-slate-400">Here&apos;s what&apos;s happening in your classes today.</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/teacher/notifications"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all flex items-center gap-2"
            >
              <Bell size={18} />
              Send Notification
            </Link>
            <Link 
              href="/teacher/courses"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              Manage Courses
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-[#161b22] border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <BookOpen size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Courses</p>
              <p className="text-3xl font-bold text-white">{courses?.length || 0}</p>
            </div>
          </div>

          <div className="p-6 bg-[#161b22] border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <Users size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Students</p>
              <p className="text-3xl font-bold text-white">{totalStudents || 0}</p>
            </div>
          </div>

          <div className="p-6 bg-[#161b22] border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <FileText size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upcoming Exams</p>
              <p className="text-3xl font-bold text-white">{upcomingExams.length}</p>
            </div>
          </div>

          <div className="p-6 bg-[#161b22] border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Submissions</p>
              <p className="text-3xl font-bold text-white">{recentAttempts?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Recent Submissions</h3>
              <Link href="/teacher/exams" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
            </div>
            <div className="divide-y divide-slate-800">
              {recentAttempts?.map((attempt: any) => (
                <div key={attempt.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                  <div className="space-y-1">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{attempt.profiles?.name}</p>
                    <p className="text-xs text-slate-500">{attempt.exams?.title}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-emerald-500">Score: {attempt.score.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-600">{attempt.submitted_at ? format(new Date(attempt.submitted_at), 'MMM d, p') : 'N/A'}</p>
                  </div>
                </div>
              ))}
              {(!recentAttempts || recentAttempts.length === 0) && (
                <div className="p-12 text-center text-slate-500">No recent submissions found.</div>
              )}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Upcoming Exams</h3>
              <Link href="/teacher/exams" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Schedule</Link>
            </div>
            <div className="divide-y divide-slate-800">
              {upcomingExams.slice(0, 5).map((exam: any) => (
                <div key={exam.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                  <div className="space-y-1">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{exam.title}</p>
                    <p className="text-xs text-slate-500">
                      {courses?.find(c => c.id === exam.course_id)?.title}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-indigo-400">{exam.start_time ? format(new Date(exam.start_time), 'MMM d, p') : 'N/A'}</p>
                    <p className="text-[10px] text-slate-600">{exam.duration_minutes}m Duration</p>
                  </div>
                </div>
              ))}
              {upcomingExams.length === 0 && (
                <div className="p-12 text-center text-slate-500">No upcoming exams scheduled.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
