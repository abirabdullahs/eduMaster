import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Verify user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { title, message, target, target_user_id, target_course_id } = body

    if (!title || !message || !target) {
      return NextResponse.json({ error: 'Missing title, message, or target' }, { status: 400 })
    }

    if (target === 'specific' && !target_user_id) {
      return NextResponse.json({ error: 'target_user_id required for specific target' }, { status: 400 })
    }

    if (target === 'course' && !target_course_id) {
      return NextResponse.json({ error: 'target_course_id required for course target' }, { status: 400 })
    }

    const admin = createAdminClient()
    let userIds: string[] = []

    if (target === 'all') {
      const { data: profiles } = await admin.from('profiles').select('id')
      userIds = profiles?.map(p => p.id) || []
    } else if (target === 'students') {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .eq('role', 'student')
      userIds = profiles?.map(p => p.id) || []
    } else if (target === 'teachers') {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id')
        .eq('role', 'teacher')
      userIds = profiles?.map(p => p.id) || []
    } else if (target === 'course') {
      const { data: enrollments } = await admin
        .from('enrollments')
        .select('student_id')
        .eq('course_id', target_course_id)
        .eq('status', 'active')
      userIds = enrollments?.map(e => e.student_id).filter(Boolean) || []
    } else if (target === 'specific') {
      userIds = [target_user_id]
    }

    if (userIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        message: 'No users matched the target' 
      })
    }

    const now = new Date().toISOString()
    const rows = userIds.map(user_id => ({
      user_id,
      title,
      body: message,
      is_read: false,
      type: 'general',
      created_at: now
    }))

    const { error } = await admin
      .from('notifications')
      .insert(rows)

    if (error) throw error

    return NextResponse.json({ success: true, count: rows.length })
  } catch (error: any) {
    console.error('Notification send error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send' }, { status: 500 })
  }
}
