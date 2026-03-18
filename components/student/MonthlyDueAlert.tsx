'use client';

import { useState } from 'react';
import { AlertCircle, ChevronRight, Loader2, X, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { OfflineMonthlyPayment } from '@/lib/types';
import { format } from 'date-fns';

interface MonthlyDueAlertProps {
  payments: (OfflineMonthlyPayment & { courses: { title: string } })[];
}

export default function MonthlyDueAlert({ payments }: MonthlyDueAlertProps) {
  const [selectedPayment, setSelectedPayment] = useState<(OfflineMonthlyPayment & { courses: { title: string } }) | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!selectedPayment || !receiptNumber) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('offline_monthly_payments')
        .update({
          status: 'pending',
          receipt_number: receiptNumber,
          submitted_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;
      alert('পেমেন্ট যাচাইয়ের জন্য পাঠানো হয়েছে');
      setSelectedPayment(null);
      setReceiptNumber('');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div 
            key={payment.id}
            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  আপনার <span className="text-amber-400">{payment.courses.title}</span> কোর্সের <span className="text-amber-400">{payment.month_label}</span> মাসের পেমেন্ট {payment.status === 'due' ? 'বাকি আছে' : 'পেন্ডিং আছে'}।
                </p>
                <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">
                  Due Date: {format(new Date(payment.due_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            {payment.status === 'due' && (
              <button 
                onClick={() => setSelectedPayment(payment)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all flex items-center gap-2"
              >
                Pay Now <ChevronRight size={14} />
              </button>
            )}
            {payment.status === 'pending' && (
              <span className="px-4 py-2 bg-amber-500/10 text-amber-500 font-bold text-xs rounded-xl border border-amber-500/20">
                Pending Approval
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Payment Due Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Monthly Payment</h3>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-amber-500/60 uppercase tracking-widest">Course</p>
                <p className="text-white font-bold">{selectedPayment.courses.title}</p>
                <p className="text-xs text-slate-400">{selectedPayment.month_label} Month</p>
                {(selectedPayment.courses as any)?.monthly_fee != null && (
                  <p className="text-sm font-bold text-amber-400 mt-1">Amount: ৳{(selectedPayment.courses as any).monthly_fee}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Receipt Number</label>
                <input 
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Enter your receipt number"
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={submitting || !receiptNumber}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                Submit Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
