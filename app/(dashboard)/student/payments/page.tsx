'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { CreditCard, Loader2, BookOpen, Calendar, Hash } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollmentPayments, setEnrollmentPayments] = useState<any[]>([]);
  const [monthlyPayments, setMonthlyPayments] = useState<any[]>([]);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Enrollment payments (one-time course fees) - active enrollments with payment
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (title, main_price, discounted_price, is_offline)
        `)
        .eq('student_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const enrollmentList = (enrollments || []).map((e) => ({
        id: e.id,
        type: 'enrollment' as const,
        course: e.courses?.title,
        amount: (e.courses as any)?.discounted_price ?? (e.courses as any)?.main_price ?? 0,
        transaction_id: e.transaction_id,
        payment_method: e.payment_platform || 'Online',
        date: e.approved_at || e.created_at,
      }));
      setEnrollmentPayments(enrollmentList);

      // Monthly payments for offline courses
      const { data: monthly } = await supabase
        .from('offline_monthly_payments')
        .select(`
          *,
          courses (title, monthly_fee)
        `)
        .eq('student_id', user.id)
        .in('status', ['paid', 'pending'])
        .order('approved_at', { ascending: false })
        .order('submitted_at', { ascending: false })
        .order('created_at', { ascending: false });

      const monthlyList = (monthly || []).map((p) => ({
        id: p.id,
        type: 'monthly' as const,
        course: (p.courses as any)?.title,
        amount: (p.courses as any)?.monthly_fee ?? 0,
        transaction_id: p.receipt_number,
        month_label: p.month_label,
        status: p.status,
        date: p.approved_at || p.submitted_at || p.created_at,
      }));
      setMonthlyPayments(monthlyList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allPayments = [...enrollmentPayments, ...monthlyPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <DashboardShell>
      <div className="space-y-8 animate-in fade-in duration-500 font-bengali">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">পেমেন্ট হিস্ট্রি</h1>
          <p className="text-slate-400 mt-1">আপনার সব পেমেন্টের তালিকা</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-slate-500 mt-4">লোড হচ্ছে...</p>
          </div>
        ) : allPayments.length === 0 ? (
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-20 text-center">
            <CreditCard size={64} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">কোন পেমেন্ট নেই</h3>
            <p className="text-slate-400">আপনার পেমেন্ট হিস্ট্রি এখানে দেখা যাবে।</p>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#0d1117] border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">কোর্স</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">প্রকার</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">পরিমাণ</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allPayments.map((p) => (
                    <tr key={`${p.type}-${p.id}`} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-indigo-500" />
                          <span className="font-medium text-white">{p.course}</span>
                        </div>
                        {p.type === 'monthly' && (p as any).month_label && (
                          <p className="text-xs text-slate-500 mt-0.5">{(p as any).month_label} মাস</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          p.type === 'enrollment' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {p.type === 'enrollment' ? 'এনরোলমেন্ট' : 'মাসিক'}
                        </span>
                        {p.type === 'monthly' && (p as any).status && (
                          <span className={`ml-2 text-xs ${
                            (p as any).status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {(p as any).status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">{formatPrice(p.amount)}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-400">
                          {p.transaction_id || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(p.date).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
