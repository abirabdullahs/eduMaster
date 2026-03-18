'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  BookOpen, 
  Users, 
  Loader2, 
  Search, 
  ChevronRight, 
  Layers,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          *,
          subjects:subjects (count),
          enrollments:enrollments (count)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      setCourses(courseData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardShell>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-medium tracking-wide">Loading your courses...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">My Courses</h1>
            <p className="text-slate-400">Manage your assigned courses and student progress.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-[#161b22] border border-slate-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all group flex flex-col"
            >
              <div className="relative aspect-video bg-slate-800">
                {course.thumbnail_url ? (
                  <Image 
                    src={course.thumbnail_url} 
                    alt={course.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg",
                    course.status === 'published' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  )}>
                    {course.status}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Layers size={18} className="text-indigo-500" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subjects</p>
                      <p className="text-sm font-bold text-white">{course.subjects?.[0]?.count || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Users size={18} className="text-emerald-500" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Students</p>
                      <p className="text-sm font-bold text-white">{course.enrollments?.[0]?.count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-slate-800 flex items-center justify-between">
                <Link 
                  href={`/teacher/courses/${course.id}`}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Manage Course
                  <ChevronRight size={18} />
                </Link>
                <Link 
                  href={`/courses/${course.id}`}
                  target="_blank"
                  className="ml-3 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all"
                  title="View Public Page"
                >
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="p-20 bg-[#161b22] border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 mx-auto">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No courses found</h3>
              <p className="text-slate-400">You don&apos;t have any assigned courses yet.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
