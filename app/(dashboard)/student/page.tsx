import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { 
  BookOpen, 
  Users, 
  Clock, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Calendar,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import MonthlyDueAlert from '@/components/student/MonthlyDueAlert'

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'student') redirect(`/${profile?.role || 'login'}`)

  // 1. Fetch Enrolled Courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('student_id', session.user.id)
    .eq('status', 'active')

  const enrolledCourseIds = enrollments?.map(e => e.course_id) || []

  // 2. Fetch Progress for each course
  // We need to count total lectures per course and completed lectures per course
  const { data: allLectures } = await supabase
    .from('lectures')
    .select('id, chapter_id, chapters!inner(subject_id, subjects!inner(course_id))')
    .in('chapters.subjects.course_id', enrolledCourseIds)

  const { data: completedProgress } = await supabase
    .from('lecture_progress')
    .select('lecture_id')
    .eq('student_id', session.user.id)

  const completedLectureIds = new Set(completedProgress?.map(p => p.lecture_id) || [])

  const courseProgress = enrollments?.map(e => {
    const courseLectures = allLectures?.filter(l => (l.chapters as any).subjects.course_id === e.course_id) || []
    const total = courseLectures.length
    const completed = courseLectures.filter(l => completedLectureIds.has(l.id)).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { ...e.courses, percent, total, completed }
  }) || []

  // 3. Fetch Upcoming Exams (Enrolled Course Exams + Public Exams)
  const now = new Date().toISOString()
  const { data: upcomingExams } = await supabase
    .from('exams')
    .select('*')
    .or(`course_id.in.(${enrolledCourseIds.join(',')}),exam_type.eq.public`)
    .eq('status', 'published')
    .gt('start_time', now)
    .order('start_time', { ascending: true })
    .limit(5)

  // 4. Recent Notifications (3)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // 5. Recent Results (3)
  const { data: recentResults } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exams (*)
    `)
    .eq('student_id', session.user.id)
    .eq('is_practice', false)
    .order('submitted_at', { ascending: false })
    .limit(3)

  // 6. Monthly Due Alert
  const { data: duePayments } = await supabase
    .from('offline_monthly_payments')
    .select('*, courses(title, monthly_fee)')
    .eq('student_id', session.user.id)
    .in('status', ['due', 'pending'])
    .order('due_date', { ascending: true })

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Monthly Due Alert Banner */}
        {duePayments && duePayments.length > 0 && (
          <MonthlyDueAlert payments={duePayments} />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              স্বাগতম, <span className="text-indigo-400">{profile.name}</span>!
            </h1>
            <p className="text-slate-400">আপনার আজকের পড়াশোনার আপডেট দেখে নিন।</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-[#161b22] border border-slate-800 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed</p>
                <p className="text-lg font-bold text-white">{completedLectureIds.size} Lectures</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Courses & Exams */}
          <div className="lg:col-span-2 space-y-10">
            {/* Enrolled Courses */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="text-indigo-500" size={24} />
                  আমার কোর্সসমূহ
                </h2>
                <Link href="/student/courses" className="text-sm text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                  সবগুলো দেখুন <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {courseProgress.map((course) => (
                  <Link 
                    key={course.id} 
                    href={`/student/courses/${course.id}`}
                    className="group bg-[#161b22] border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition-all shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                          <BookOpen size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                          {course.percent}% Complete
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${course.percent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold text-right uppercase tracking-widest">
                          {course.completed}/{course.total} Lectures
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {courseProgress.length === 0 && (
                  <div className="col-span-full p-12 bg-[#161b22] border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                    <p className="text-slate-500">আপনি এখনো কোনো কোর্সে এনরোল করেননি।</p>
                    <Link href="/student/courses" className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                      কোর্স এক্সপ্লোর করুন <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming Exams */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Calendar className="text-emerald-500" size={24} />
                  আসন্ন পরীক্ষাসমূহ
                </h2>
                <Link href="/student/exams" className="text-sm text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                  সবগুলো দেখুন <ChevronRight size={16} />
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingExams?.map((exam) => (
                  <div key={exam.id} className="bg-[#161b22] border border-slate-800 rounded-3xl p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex flex-col items-center justify-center text-emerald-500">
                        <span className="text-xs font-bold uppercase">{format(new Date(exam.start_time!), 'MMM')}</span>
                        <span className="text-xl font-bold">{format(new Date(exam.start_time!), 'dd')}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{exam.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(exam.start_time!), 'p')}</span>
                          <span className="flex items-center gap-1"><Zap size={12} /> {exam.duration_minutes}m</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest",
                            exam.exam_type === 'public' ? "bg-purple-500/10 text-purple-400" : "bg-indigo-500/10 text-indigo-400"
                          )}>
                            {exam.exam_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/student/exams`}
                      className="p-3 bg-slate-800 hover:bg-emerald-600 text-white rounded-2xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                ))}
                {(!upcomingExams || upcomingExams.length === 0) && (
                  <div className="p-12 text-center text-slate-500 bg-[#161b22] border border-slate-800 rounded-3xl">
                    আপাতত কোনো আসন্ন পরীক্ষা নেই।
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Notifications & Results */}
          <div className="space-y-10">
            {/* Recent Results */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Target className="text-amber-500" size={24} />
                সাম্প্রতিক ফলাফল
              </h3>
              <div className="space-y-4">
                {recentResults?.map((result) => (
                  <div key={result.id} className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{result.exams?.title}</h4>
                      <span className="text-xs font-bold text-emerald-500">{result.score.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <span>{format(new Date(result.submitted_at!), 'MMM d, yyyy')}</span>
                      <span className="text-slate-400">{result.correct_count} Correct / {result.wrong_count} Wrong</span>
                    </div>
                  </div>
                ))}
                {(!recentResults || recentResults.length === 0) && (
                  <div className="p-8 text-center text-slate-600 bg-[#161b22] border border-slate-800 rounded-2xl text-xs">
                    কোনো পরীক্ষার ফলাফল পাওয়া যায়নি।
                  </div>
                )}
                {recentResults && recentResults.length > 0 && (
                  <Link href="/student/results" className="block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
                    সবগুলো দেখুন
                  </Link>
                )}
              </div>
            </section>

            {/* Recent Notifications */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Bell className="text-purple-500" size={24} />
                নোটিফিকেশন
              </h3>
              <div className="space-y-4">
                {notifications?.map((notif) => (
                  <div key={notif.id} className={cn(
                    "bg-[#161b22] border rounded-2xl p-5 space-y-2 transition-all",
                    notif.is_read ? "border-slate-800 opacity-60" : "border-purple-500/30 bg-purple-500/5 shadow-lg shadow-purple-500/5"
                  )}>
                    <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{notif.body}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      {format(new Date(notif.created_at), 'MMM d, p')}
                    </p>
                  </div>
                ))}
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
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
