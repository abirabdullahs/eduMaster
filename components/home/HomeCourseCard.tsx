import Link from 'next/link';
import { Users, Star, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  thumbnail_url: string;
  main_price: number;
  discounted_price?: number;
  teacher?: {
    name: string;
    avatar_url?: string;
  };
  enrollment_count?: number;
}

export default function HomeCourseCard({ course }: { course: Course }) {
  const discount = course.discounted_price 
    ? Math.round(((course.main_price - course.discounted_price) / course.main_price) * 100) 
    : 0;

  return (
    <div className="glass-card overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/600/400`} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {discount > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            {discount}% OFF
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center text-yellow-500">
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
            <Star size={14} fill="currentColor" />
          </div>
          <span className="text-xs text-slate-500 font-medium">(4.8)</span>
        </div>

        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors font-hind-siliguri">
          {course.title}
        </h3>

        <div className="flex items-center justify-between py-2 border-y border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
              <img 
                src={course.teacher?.avatar_url || `https://ui-avatars.com/api/?name=${course.teacher?.name || 'Teacher'}&background=random`} 
                alt="Teacher" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">{course.teacher?.name || 'Expert Teacher'}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Users size={14} />
            <span className="text-xs font-medium">{course.enrollment_count || 0}+</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            {course.discounted_price ? (
              <>
                <span className="text-xs text-slate-500 line-through">{formatPrice(course.main_price)}</span>
                <span className="text-xl font-bold text-white">{formatPrice(course.discounted_price)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-white">{formatPrice(course.main_price)}</span>
            )}
          </div>
          <Link 
            href={`/courses/${course.id}`}
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white transition-all shadow-lg shadow-indigo-500/20"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
