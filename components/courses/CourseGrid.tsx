import CourseCard from './CourseCard'
import { Course } from '@/lib/types'

interface CourseGridProps {
  courses: Course[]
}

export default function CourseGrid({ courses }: CourseGridProps) {
  if (!courses.length) {
    return (
      <div className="text-center py-20 bg-white/5 rounded-2xl border-2 border-dashed border-slate-800">
        <p className="text-slate-400">No courses found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
