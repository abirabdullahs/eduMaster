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
  ChevronDown,
  Sparkles,
  Award,
  Building2
} from 'lucide-react'
import Image from 'next/image'
import CourseMarketingDisplay from '@/components/courses/CourseMarketingDisplay'

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
      profiles:teacher_id (
        name,
        bio,
        avatar_url,
        subject_expertise,
        education_subject,
        education_university,
        expertise_json,
        experience_time
      ),
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

  const { count: teacherCourseCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', course.teacher_id)
    .eq('status', 'published')

  const expertiseList: string[] = Array.isArray((teacher as any)?.expertise_json)
    ? (teacher as any).expertise_json.filter((x: unknown) => typeof x === 'string')
    : []

  // Sort curriculum by order_index (subjects, chapters, lectures)
  const sortedSubjects = (course.subjects || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((s: any) => ({
      ...s,
      chapters: (s.chapters || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((c: any) => ({
          ...c,
          lectures: (c.lectures || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        }))
    }));

  return (
    <div className="min-h-screen bg-[#060910] text-slate-200 font-hind-siliguri">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#0c1220] to-[#060910] text-white py-16 md:py-20 relative overflow-hidden border-b border-slate-800/80">
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

          <div className="bg-[#121820] rounded-[2.5rem] p-8 shadow-2xl shadow-black/40 text-slate-100 space-y-8 border border-slate-700/80 ring-1 ring-white/5">
            <div className="aspect-video relative bg-slate-900 rounded-3xl overflow-hidden shadow-inner group border border-slate-800">
              {course.thumbnail_url ? (
                <Image 
                  src={course.thumbnail_url} 
                  alt={course.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <PlayCircle size={64} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <PlayCircle size={32} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Course Fee</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-indigo-400">
                      {formatPrice(course.discounted_price || course.main_price)}
                    </span>
                    {course.discounted_price && (
                      <span className="text-lg text-slate-500 line-through font-medium">
                        {formatPrice(course.main_price)}
                      </span>
                    )}
                  </div>
                </div>
                {course.discounted_price && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/30">
                    {Math.round(((course.main_price - course.discounted_price) / course.main_price) * 100)}% OFF
                  </div>
                )}
              </div>

              <EnrollButton 
                course={course}
                className="w-full py-4 text-lg rounded-2xl"
              />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Lifetime Access
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Clock size={16} className="text-indigo-400" />
                  Self-paced Learning
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="lg:col-span-2 space-y-16">
            {/* Intro Video */}
            {course.intro_video_url && (
              <section className="space-y-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <PlayCircle className="text-indigo-400" />
                  Intro Video
                </h2>
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 ring-1 ring-white/5">
                  <iframe
                    src={course.intro_video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            <CourseMarketingDisplay
              details_markdown={course.details_markdown}
              curriculum_topics={course.curriculum_topics as any}
              faq_json={course.faq_json as any}
              dark
              themeSeed={course.id}
            />

            {/* What you&apos;ll learn */}
            <section className="bg-[#121820] rounded-[2.5rem] p-10 border border-slate-800 space-y-8 shadow-xl shadow-black/20">
              <h2 className="text-3xl font-bold text-white">What you&apos;ll learn</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {sortedSubjects.map((subject: any) => (
                  <div key={subject.id} className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={20} />
                    <span className="text-slate-300 font-medium">{subject.title}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BookOpen className="text-indigo-400" />
                  Course Curriculum
                </h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                  {sortedSubjects.length} Subjects
                </p>
              </div>

              <div className="space-y-6">
                {sortedSubjects.map((subject: any) => (
                  <div key={subject.id} className="bg-[#121820] rounded-3xl border border-slate-800 overflow-hidden group shadow-lg shadow-black/20">
                    <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{subject.title}</h3>
                      <ChevronDown className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="p-6 space-y-8">
                      {subject.chapters?.map((chapter: any) => (
                        <div key={chapter.id} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                              {(chapter.order_index ?? 0) + 1}
                            </div>
                            <h4 className="font-bold text-slate-200">{chapter.title}</h4>
                          </div>
                          <div className="grid gap-3 pl-11">
                            {chapter.lectures?.map((lecture: any) => (
                              <div key={lecture.id} className="flex items-center justify-between text-sm text-slate-500 group/item">
                                <div className="flex items-center gap-3">
                                  <PlayCircle size={14} className="text-slate-600 group-hover/item:text-indigo-400 transition-colors" />
                                  <span className="text-slate-400">{lecture.title}</span>
                                </div>
                                {lecture.video_url && (
                                  <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Video</span>
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
            {/* Teacher card */}
            <div className="sticky top-24">
              <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-br from-indigo-500/50 via-violet-500/35 to-cyan-500/40 shadow-2xl shadow-indigo-950/50">
                <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[#0b0f14] border border-white/[0.06]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-cyan-600/5 pointer-events-none" />
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140%] h-40 bg-gradient-to-r from-indigo-600/25 via-violet-600/20 to-cyan-600/20 blur-3xl rounded-full pointer-events-none" />

                  <div className="relative px-6 pt-8 pb-6 text-center space-y-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                      <Sparkles size={12} className="text-amber-400" />
                      Instructor
                    </div>

                    <div className="relative mx-auto w-[7.5rem] h-[7.5rem]">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 p-[3px] shadow-lg shadow-indigo-500/25">
                        <div className="w-full h-full rounded-full bg-[#0b0f14] p-[3px] overflow-hidden">
                          <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-700/80">
                            {teacher?.avatar_url ? (
                              <Image
                                src={teacher.avatar_url}
                                alt={teacher.name || 'Instructor'}
                                width={120}
                                height={120}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-indigo-400">
                                <GraduationCap size={44} strokeWidth={1.5} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">{teacher?.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        {(teacher as any)?.education_subject || teacher?.subject_expertise || 'Expert Instructor'}
                      </p>
                      {(teacher as any)?.education_university && (
                        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                          <Building2 size={12} className="text-slate-600 shrink-0" />
                          {(teacher as any).education_university}
                        </p>
                      )}
                    </div>

                    {expertiseList.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {expertiseList.map((ex) => (
                          <span
                            key={ex}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}

                    {(teacher as any)?.experience_time && (
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <Award size={14} className="text-amber-500/90 shrink-0" />
                        <span>{(teacher as any).experience_time}</span>
                      </div>
                    )}

                    <blockquote className="relative text-left rounded-2xl bg-slate-900/60 border border-slate-800/80 px-4 py-3.5">
                      <span className="absolute top-2 left-3 text-3xl leading-none text-indigo-500/30 font-serif select-none">&ldquo;</span>
                      <p className="text-sm text-slate-400 leading-relaxed pl-4 italic relative z-[1]">
                        {teacher?.bio || 'Dedicated to helping students achieve their academic goals through quality education.'}
                      </p>
                    </blockquote>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 px-3 py-3 text-center">
                        <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          {teacherCourseCount ?? 0}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Courses</p>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 px-3 py-3 text-center">
                        <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          5k+
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Students</p>
                      </div>
                    </div>
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
