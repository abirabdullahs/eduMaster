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

    const body = await req.json()
    const { payment_id, action } = body
    if (!payment_id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing payment_id or invalid action' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: payment, error: fetchErr } = await admin
      .from('offline_monthly_payments')
      .select('*')
      .eq('id', payment_id)
      .single()

    if (fetchErr || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending payments can be approved or rejected' }, { status: 400 })
    }

    if (action === 'approve') {
      const { error: updateErr } = await admin
        .from('offline_monthly_payments')
        .update({
          status: 'paid',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', payment_id)

      if (updateErr) throw updateErr

      // Create next month's payment row
      const prevDueDate = new Date(payment.due_date)
      const nextDueDate = addDays(prevDueDate, 30)
      const nextMonthLabel = format(nextDueDate, 'MMMM yyyy')

      await admin.from('offline_monthly_payments').insert({
        enrollment_id: payment.enrollment_id,
        student_id: payment.student_id,
        course_id: payment.course_id,
        due_date: nextDueDate.toISOString().split('T')[0],
        month_label: nextMonthLabel,
        status: 'due',
      })
    } else {
      // Reject: set back to due, clear receipt
      const { error: updateErr } = await admin
        .from('offline_monthly_payments')
        .update({
          status: 'due',
          receipt_number: null,
          submitted_at: null,
        })
        .eq('id', payment_id)

      if (updateErr) throw updateErr
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Monthly payment action error:', error)
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
  }
}
