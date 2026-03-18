import { createClient } from '@/lib/supabase/server';
import HomeCourseCard from './HomeCourseCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function FeaturedCourses() {
  const supabase = createClient();
  
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      profiles:teacher_id (name, avatar_url)
    `)
    .eq('status', 'published')
    .limit(6);

  // Map profiles to teacher for the card
  const mappedCourses = courses?.map(course => ({
    ...course,
    teacher: course.profiles
  })) || [];

  return (
    <section className="py-24 bg-[#0a0f1e] relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-hind-siliguri">
              আমাদের <span className="text-indigo-500">জনপ্রিয়</span> কোর্সসমূহ
            </h2>
            <p className="text-slate-400 max-w-xl font-poppins">
              Explore our top-rated courses designed by experts to help you achieve your academic goals.
            </p>
          </div>
          <Link 
            href="/courses" 
            className="group flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            সব কোর্স দেখুন
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {mappedCourses.map((course) => (
            <HomeCourseCard key={course.id} course={course} />
          ))}
          {mappedCourses.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card border-dashed">
              <p className="text-slate-500">No featured courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
