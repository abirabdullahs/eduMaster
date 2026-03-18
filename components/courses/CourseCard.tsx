import { Course } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-video bg-slate-100 relative">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            No Thumbnail
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {course.class && (
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {course.class}
            </span>
          )}
          {course.subject && (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {course.subject}
            </span>
          )}
          {course.is_offline && (
            <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Offline
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 line-clamp-1">{course.title}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {course.discounted_price ? (
              <>
                <span className="text-xs text-slate-400 line-through">{formatPrice(course.main_price)}</span>
                <span className="text-lg font-bold text-primary">{formatPrice(course.discounted_price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">{formatPrice(course.main_price)}</span>
            )}
          </div>
          <Link 
            href={`/courses/${course.id}`}
            className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
