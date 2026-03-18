'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Loader2, 
  ChevronRight, 
  GraduationCap,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatPrice } from '@/lib/utils';
import { CourseCardSkeleton } from '@/components/shared/Skeletons';
import EnrollButton from '@/components/courses/EnrollButton';
import { useAuth } from '@/hooks/useAuth';

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'explore'>('my-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [exploreCourses, setExploreCourses] = useState<any[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch My Courses (Enrolled)
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('student_id', user.id);

      // Fetch progress for enrolled courses
      const enrolledCourseIds = enrollments?.filter(e => e.status === 'active').map(e => e.course_id) || [];
      
      const { data: allLectures } = await supabase
        .from('lectures')
        .select('id, chapter_id, chapters!inner(subject_id, subjects!inner(course_id))')
        .in('chapters.subjects.course_id', enrolledCourseIds);

      const { data: progressData } = await supabase
        .from('lecture_progress')
        .select('lecture_id')
        .eq('student_id', user.id);

      const completedLectureIds = new Set(progressData?.map(p => p.lecture_id) || []);

      // Fetch monthly payments for offline courses - use latest per course
      const { data: monthlyPayments } = await supabase
        .from('offline_monthly_payments')
        .select('*')
        .eq('student_id', user.id)
        .order('due_date', { ascending: false });

      const getLatestPaymentStatus = (courseId: string) => {
        const payments = monthlyPayments?.filter(p => p.course_id === courseId) || [];
        const latest = payments[0];
        return latest?.status ?? 'due';
      };

      const myCoursesWithProgress = enrollments?.map(e => {
        const courseLectures = allLectures?.filter(l => (l.chapters as any).subjects.course_id === e.course_id) || [];
        const total = courseLectures.length;
        const completed = courseLectures.filter(l => completedLectureIds.has(l.id)).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const paymentStatus = e.courses.is_offline 
          ? getLatestPaymentStatus(e.course_id) 
          : 'paid';

        return { 
          ...e.courses, 
          enrollment_status: e.status, 
          percent, 
          total, 
          completed,
          payment_status: paymentStatus
        };
      }) || [];

      setMyCourses(myCoursesWithProgress);

      // 2. Fetch Explore Courses (All Published)
      const { data: publishedCourses } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published');
      
      setExploreCourses(publishedCourses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMyCourses = myCourses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExploreCourses = exploreCourses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">কোর্সসমূহ</h1>
            <p className="text-slate-400">আপনার এনরোল করা কোর্স এবং নতুন কোর্স এক্সপ্লোর করুন।</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="কোর্স খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#161b22] border border-slate-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#161b22] border border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('my-courses')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'my-courses' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <GraduationCap size={18} />
            আমার কোর্সসমূহ
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'explore' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Globe size={18} />
            এক্সপ্লোর
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeTab === 'my-courses' ? (
              filteredMyCourses.length > 0 ? (
                filteredMyCourses.map((course) => (
                  <div key={course.id} className="group bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/800/450`} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-60" />
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {course.enrollment_status === 'pending' ? (
                          <span className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg">
                            Pending Approval
                          </span>
                        ) : (
                          course.is_offline && (
                            <span className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg",
                              course.payment_status === 'paid' ? "bg-emerald-500 text-black" : 
                              course.payment_status === 'pending' ? "bg-amber-500 text-black" : "bg-red-500 text-white"
                            )}>
                              {course.payment_status === 'paid' ? '✅ Paid' : 
                               course.payment_status === 'pending' ? '🟡 Pending' : '🔴 Payment Due'}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6 flex-1 flex flex-col">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                      </div>

                      {course.enrollment_status === 'active' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-indigo-400">{course.percent}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${course.percent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-4 mt-auto">
                        {course.enrollment_status === 'active' ? (
                          <Link 
                            href={`/student/courses/${course.id}`}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                          >
                            পড়াশোনা শুরু করুন <ChevronRight size={18} />
                          </Link>
                        ) : (
                          <div className="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-2xl text-center cursor-not-allowed">
                            অপেক্ষমান...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-6 bg-[#161b22] border border-slate-800 rounded-3xl">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <BookOpen size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">কোনো কোর্স পাওয়া যায়নি</h3>
                    <p className="text-slate-500">আপনি এখনো কোনো কোর্সে এনরোল করেননি।</p>
                  </div>
                  <button onClick={() => setActiveTab('explore')} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all">
                    নতুন কোর্স দেখুন
                  </button>
                </div>
              )
            ) : (
              filteredExploreCourses.map((course) => (
                <div key={course.id} className="group bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl flex flex-col">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/800/450`} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-60" />
                    
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg">
                        {course.is_offline ? 'Offline' : 'Online'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white">{formatPrice(course.discounted_price || course.main_price)}</span>
                          {course.discounted_price && (
                            <span className="text-xs text-slate-500 line-through">{formatPrice(course.main_price)}</span>
                          )}
                        </div>
                      </div>
                      <EnrollButton course={course} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

// Helper function for month label
function format(date: Date, pattern: string) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (pattern === 'MMMM yyyy') {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  return '';
}
