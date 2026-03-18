import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')

  if (!courseId) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Simulate enrollment creation
  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .insert({
      student_id: session.user.id,
      course_id: courseId,
      status: 'pending',
      payment_platform: 'free', // For simulation
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Redirect to student dashboard or payment success page
  return NextResponse.redirect(new URL('/student/courses', request.url))
}
