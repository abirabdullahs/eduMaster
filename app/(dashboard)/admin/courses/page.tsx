'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  GraduationCap, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course } from '@/lib/types';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:teacher_id (name),
          enrollments (count)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Map counts
      const mappedCourses = data?.map(course => ({
        ...course,
        teacher_name: course.profiles?.name || 'Unassigned',
        enrollment_count: course.enrollments?.[0]?.count || 0
      })) || [];

      setCourses(mappedCourses);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will remove all related content.')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Course Management</h1>
          <p className="text-slate-400 mt-1">Create and manage your educational content.</p>
        </div>
        <Link 
          href="/admin/courses/new"
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Create New Course
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search courses by title or teacher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className="text-slate-400 font-medium tracking-wide">Fetching courses...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex flex-col items-center text-center gap-4">
          <AlertCircle className="text-red-500" size={48} />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Error Loading Data</h3>
            <p className="text-sm text-red-200">{error}</p>
          </div>
          <button onClick={fetchCourses} className="px-6 py-2 bg-red-500 text-white font-bold rounded-xl">Retry</button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center bg-[#161b22] border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <BookOpen size={32} />
          </div>
          <p className="text-slate-500 font-medium">No courses found. Start by creating one!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/50 transition-all flex flex-col">
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden">
                <Image 
                  src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/600/400`} 
                  alt={course.title} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent opacity-60" />
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg",
                    course.status === 'published' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                  )}>
                    {course.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors font-hind-siliguri">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <GraduationCap size={14} className="text-indigo-500" />
                    <span>{course.teacher_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-white/5">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-white">{course.enrollment_count} Students</span>
                  </div>
                  <div className="text-sm font-bold text-indigo-400">
                    {formatPrice(course.discounted_price || course.main_price)}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/courses/${course.id}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleToggleStatus(course.id, course.status)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        course.status === 'published' 
                          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      )}
                    >
                      {course.status === 'published' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    target="_blank"
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest"
                  >
                    Preview <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
