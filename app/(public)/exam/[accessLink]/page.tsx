import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ExamAccessClient from '@/components/exams/ExamAccessClient'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ accessLink: string }> }): Promise<Metadata> {
  const { accessLink } = await params;
  const supabase = createClient()
  const { data: exam } = await supabase.from('exams').select('title').eq('access_link', accessLink).single()
  
  return {
    title: `${exam?.title || 'Exam'} | Radiance`,
    description: 'Take this exam to test your knowledge and track your progress.',
  }
}

export default async function ExamPage({ params }: { params: Promise<{ accessLink: string }> }) {
  const { accessLink } = await params;
  const supabase = createClient()
  
  const { data: exam } = await supabase
    .from('exams')
    .select('*')
    .eq('access_link', accessLink)
    .single()

  if (!exam) notFound()

  return <ExamAccessClient initialExam={exam} />
}
