import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { addDays, format } from 'date-fns'

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

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { enrollment_id, status } = await req.json()
    if (!enrollment_id || !status) {
      return NextResponse.json({ error: 'Missing enrollment_id or status' }, { status: 400 })
    }
    if (status !== 'active' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be active or rejected' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: enrollment, error: enrollErr } = await admin
      .from('enrollments')
      .select('*, courses(*)')
      .eq('id', enrollment_id)
      .single()

    if (enrollErr || !enrollment) {
      console.error('Enrollment fetch error:', enrollErr)
      const errMsg = enrollErr?.message || 'Enrollment not found'
      if (enrollErr?.message?.toLowerCase().includes('invalid') || enrollErr?.message?.toLowerCase().includes('jwt')) {
        return NextResponse.json({ error: 'Server configuration error. Please ensure SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local' }, { status: 500 })
      }
      return NextResponse.json({ error: errMsg }, { status: 404 })
    }

    const { error: updateErr } = await admin
      .from('enrollments')
      .update({
        status,
        approved_at: status === 'active' ? new Date().toISOString() : null,
        approved_by: status === 'active' ? user.id : null,
      })
      .eq('id', enrollment_id)

    if (updateErr) throw updateErr

    // When approving offline enrollment, create first monthly payment
    if (status === 'active' && enrollment.courses?.is_offline) {
      const dueDate = addDays(new Date(), 30)
      const monthLabel = format(new Date(), 'MMMM yyyy')

      const { error: payErr } = await admin
        .from('offline_monthly_payments')
        .insert({
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          due_date: dueDate.toISOString().split('T')[0],
          month_label: monthLabel,
          status: 'due',
        })

      if (payErr) {
        console.error('Failed to create first monthly payment:', payErr)
        // Don't fail the approval - payment can be added manually
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Enrollment approve error:', error)
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
