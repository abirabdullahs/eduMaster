import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EnrollButton from '@/components/courses/EnrollButton'
import { formatPrice } from '@/lib/utils'
import { Metadata } from 'next'
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  PlayCircle, 
  Clock,
  ShieldCheck,
  ChevronDown
} from 'lucide-react'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = createClient()
  const { data: course } = await supabase.from('courses').select('title, description, thumbnail_url').eq('id', courseId).single()
  
  return {
    title: `${course?.title || 'Course'} | Radiance`,
    description: course?.description || 'Learn more about this course.',
    openGraph: {
      images: [course?.thumbnail_url || '/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      images: [course?.thumbnail_url || '/og-image.png'],
    }
  }
}

export default async function CourseDetail({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const supabase = createClient()
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      profiles:teacher_id (name, bio, avatar_url, subject_expertise),
      subjects (
        *,
        chapters (
          *,
          lectures (*)
        )
      ),
      enrollments (count)
    `)
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const enrollmentCount = course.enrollments?.[0]?.count || 0;
  const teacher = course.profiles;

  return (
    <div className="min-h-screen bg-slate-50 font-hind-siliguri">
      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              <span className="bg-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {course.class || 'General'}
              </span>
              {course.is_offline ? (
                <span className="bg-emerald-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-black">
                  এই কোর্সটি অফলাইন — Free
                </span>
              ) : (
                <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                  {course.subject || 'All Subjects'}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              {course.title}
            </h1>
            
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {teacher?.avatar_url ? (
                    <Image src={teacher.avatar_url} alt={teacher.name} width={48} height={48} className="object-cover" />
                  ) : (
                    <GraduationCap className="text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Instructor</p>
                  <p className="font-bold text-white">{teacher?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Users className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Enrolled</p>
                  <p className="font-bold text-white">{enrollmentCount} Students</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl text-slate-900 space-y-8 border border-white/10">
            <div className="aspect-video relative bg-slate-100 rounded-3xl overflow-hidden shadow-inner group">
              {course.thumbnail_url ? (
                <Image 
                  src={course.thumbnail_url} 
                  alt={course.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <PlayCircle size={64} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <PlayCircle size={32} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Course Fee</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      {formatPrice(course.discounted_price || course.main_price)}
                    </span>
                    {course.discounted_price && (
                      <span className="text-lg text-slate-400 line-through font-medium">
                        {formatPrice(course.main_price)}
                      </span>
                    )}
                  </div>
                </div>
                {course.discounted_price && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/20">
                    {Math.round(((course.main_price - course.discounted_price) / course.main_price) * 100)}% OFF
                  </div>
                )}
              </div>

              <EnrollButton 
                course={course}
                className="w-full py-4 text-lg"
              />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Lifetime Access
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Clock size={16} className="text-indigo-500" />
                  Self-paced Learning
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {/* Intro Video */}
            {course.intro_video_url && (
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <PlayCircle className="text-primary" />
                  Intro Video
                </h2>
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <iframe
                    src={course.intro_video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* What you&apos;ll learn */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
              <h2 className="text-3xl font-bold text-slate-900">What you&apos;ll learn</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {course.subjects?.map((subject: any) => (
                  <div key={subject.id} className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                    <span className="text-slate-700 font-medium">{subject.title}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <BookOpen className="text-primary" />
                  Course Curriculum
                </h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                  {course.subjects?.length || 0} Subjects
                </p>
              </div>

              <div className="space-y-6">
                {course.subjects?.map((subject: any) => (
                  <div key={subject.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                    <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">{subject.title}</h3>
                      <ChevronDown className="text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-6 space-y-8">
                      {subject.chapters?.map((chapter: any) => (
                        <div key={chapter.id} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {chapter.order_index + 1}
                            </div>
                            <h4 className="font-bold text-slate-800">{chapter.title}</h4>
                          </div>
                          <div className="grid gap-3 pl-11">
                            {chapter.lectures?.map((lecture: any) => (
                              <div key={lecture.id} className="flex items-center justify-between text-sm text-slate-500 group/item">
                                <div className="flex items-center gap-3">
                                  <PlayCircle size={14} className="text-slate-300 group-hover/item:text-primary transition-colors" />
                                  <span>{lecture.title}</span>
                                </div>
                                {lecture.video_url && (
                                  <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Video</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Teacher Bio */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 sticky top-24">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto overflow-hidden border-4 border-white shadow-lg">
                  {teacher?.avatar_url ? (
                    <Image src={teacher.avatar_url} alt={teacher.name} width={96} height={96} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <GraduationCap size={40} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{teacher?.name}</h3>
                  <p className="text-sm text-primary font-bold uppercase tracking-widest">{teacher?.subject_expertise || 'Expert Instructor'}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed text-center italic">
                &quot;{teacher?.bio || 'Dedicated to helping students achieve their academic goals through quality education.'}&quot;
              </p>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">10+</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Courses</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">5k+</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
