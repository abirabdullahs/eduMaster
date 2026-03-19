import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { course_id, title, message } = body

    if (!course_id || !title || !message) {
      return NextResponse.json({ error: 'Missing course_id, title, or message' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify teacher owns this course
    const { data: course } = await admin
      .from('courses')
      .select('id')
      .eq('id', course_id)
      .eq('teacher_id', user.id)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 })
    }

    const { data: enrollments } = await admin
      .from('enrollments')
      .select('student_id')
      .eq('course_id', course_id)
      .eq('status', 'active')

    const studentIds = enrollments?.map(e => e.student_id).filter(Boolean) || []

    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No enrolled students' })
    }

    const now = new Date().toISOString()
    const action_link = body.action_link || null;
    const rows = studentIds.map(student_id => ({
      user_id: student_id,
      title,
      body: message,
      is_read: false,
      type: 'general',
      action_link,
      created_at: now
    }))

    const { error } = await admin.from('notifications').insert(rows)

    if (error) throw error

    return NextResponse.json({ success: true, count: rows.length })
  } catch (error: any) {
    console.error('Teacher notification send error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send' }, { status: 500 })
  }
}
