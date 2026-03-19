'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, BookOpen, User, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type PaymentType = 'enrollment' | 'monthly';

interface PaymentRow {
  id: string;
  type: PaymentType;
  student_name: string;
  student_email: string;
  course: string;
  amount: number;
  transaction_id: string;
  month_label?: string;
  status?: string;
  date: string;
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [enrollmentPayments, setEnrollmentPayments] = useState<PaymentRow[]>([]);
  const [monthlyPayments, setMonthlyPayments] = useState<PaymentRow[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'enrollment' | 'monthly'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // All enrollment payments (active enrollments)
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (name, email),
          courses (title, main_price, discounted_price, is_offline)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const enrollmentList: PaymentRow[] = (enrollments || []).map((e) => ({
        id: e.id,
        type: 'enrollment' as const,
        student_name: (e.profiles as any)?.name || 'Unknown',
        student_email: (e.profiles as any)?.email || '',
        course: (e.courses as any)?.title || '',
        amount: (e.courses as any)?.discounted_price ?? (e.courses as any)?.main_price ?? 0,
        transaction_id: e.transaction_id || '—',
        date: e.approved_at || e.created_at,
      }));
      setEnrollmentPayments(enrollmentList);

      // All monthly payments (paid + pending)
      const { data: monthly } = await supabase
        .from('offline_monthly_payments')
        .select(`
          *,
          profiles:student_id (name, email),
          courses (title, monthly_fee)
        `)
        .in('status', ['paid', 'pending'])
        .order('approved_at', { ascending: false })
        .order('submitted_at', { ascending: false })
        .order('created_at', { ascending: false });

      const monthlyList: PaymentRow[] = (monthly || []).map((p) => ({
        id: p.id,
        type: 'monthly' as const,
        student_name: (p.profiles as any)?.name || 'Unknown',
        student_email: (p.profiles as any)?.email || '',
        course: (p.courses as any)?.title || '',
        amount: (p.courses as any)?.monthly_fee ?? 0,
        transaction_id: p.receipt_number || '—',
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
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allPayments: PaymentRow[] = [...enrollmentPayments, ...monthlyPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredPayments = allPayments.filter((p) => {
    const matchType = filterType === 'all' || p.type === filterType;
    const matchSearch = !searchQuery || 
      p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">All Payments</h1>
        <p className="text-slate-400 mt-1">কোন কোর্সের জন্য কে কত দিয়েছে – Transaction ID সহ</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by student, course, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'enrollment', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterType === t ? 'bg-indigo-600 text-white' : 'bg-[#161b22] text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : t === 'enrollment' ? 'Enrollment' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Records</p>
          <p className="text-2xl font-bold text-white mt-1">{filteredPayments.length}</p>
        </div>
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatPrice(totalAmount)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0d1117] border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
                    <p className="text-slate-500 mt-4">Loading payments...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={`${p.type}-${p.id}`} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{p.student_name}</p>
                          <p className="text-xs text-slate-500">{p.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-indigo-500 shrink-0" />
                        <div>
                          <span className="font-medium text-white">{p.course}</span>
                          {p.month_label && (
                            <p className="text-xs text-slate-500">{p.month_label} Month</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        p.type === 'enrollment' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.type === 'enrollment' ? 'Enrollment' : 'Monthly'}
                      </span>
                      {p.status && (
                        <span className={`ml-2 text-xs ${
                          p.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {p.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">{formatPrice(p.amount)}</td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-slate-400 bg-slate-800/50 px-2 py-1 rounded font-mono">
                        {p.transaction_id}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
