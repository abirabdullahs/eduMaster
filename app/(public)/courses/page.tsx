import { createClient } from '@/lib/supabase/server'
import CourseCatalogClient from '@/components/courses/CourseCatalogClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Courses | Educational Platform',
  description: 'Explore our wide range of courses for SSC and HSC students. Learn from the best teachers and excel in your exams.',
}

export default async function CourseCatalog() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-20">
      <div className="container mx-auto px-4 space-y-12">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Explore <span className="text-indigo-400">Our Courses</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Choose from a variety of subjects designed to help you master your curriculum and achieve top results.
          </p>
        </div>
        
        <CourseCatalogClient initialCourses={courses || []} />
      </div>
    </div>
  )
}
