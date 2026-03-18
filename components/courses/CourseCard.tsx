import { Course } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-[#161b22] rounded-xl border border-slate-800 overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="aspect-video bg-white/5 relative">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Thumbnail
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {course.class && (
            <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {course.class}
            </span>
          )}
          {course.subject && (
            <span className="bg-white/5 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {course.subject}
            </span>
          )}
          {course.is_offline && (
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Offline
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white line-clamp-1">{course.title}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {course.discounted_price ? (
              <>
                <span className="text-xs text-slate-500 line-through">{formatPrice(course.main_price)}</span>
                <span className="text-lg font-bold text-indigo-400">{formatPrice(course.discounted_price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-indigo-400">{formatPrice(course.main_price)}</span>
            )}
          </div>
          <Link 
            href={`/courses/${course.id}`}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
