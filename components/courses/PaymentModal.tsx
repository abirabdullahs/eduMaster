'use client';

import { useState } from 'react';
import { X, Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Course } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

interface PaymentModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ course, onClose, onSuccess }: PaymentModalProps) {
  const [platform, setPlatform] = useState<'bkash' | 'nagad'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!course.is_offline && !transactionId) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: session.user.id,
          course_id: course.id,
          status: 'pending',
          payment_platform: course.is_offline ? null : platform,
          transaction_id: course.is_offline ? null : transactionId,
          is_offline_course: course.is_offline
        });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#161b22] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CreditCard size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Course Enrollment</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">Request Submitted!</h4>
              <p className="text-slate-400 text-sm">
                আপনার enrollment request পাঠানো হয়েছে। Admin approve করলে access পাবেন।
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-indigo-500/60 uppercase tracking-widest">Course</p>
              <p className="text-white font-bold">{course.title}</p>
              <p className="text-lg font-bold text-indigo-400">{formatPrice(course.discounted_price || course.main_price)}</p>
            </div>

            {course.is_offline ? (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-sm text-amber-200/80">
                  এই কোর্সে এনরোল করতে Admin approval প্রয়োজন। Submit করুন।
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Instructions</p>
                  <div className="p-4 bg-slate-800/50 rounded-2xl space-y-2 text-sm text-slate-300">
                    <p>১. নিচের যেকোনো নাম্বারে <span className="text-white font-bold">{formatPrice(course.discounted_price || course.main_price)}</span> টাকা Send Money করুন।</p>
                    <p>২. bKash/Nagad: <span className="text-white font-bold">017XXXXXXXX</span></p>
                    <p>৩. পেমেন্ট শেষে Transaction ID টি নিচে দিন।</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPlatform('bkash')}
                      className={cn(
                        "py-3 rounded-2xl font-bold text-sm transition-all border",
                        platform === 'bkash' ? "bg-[#e2136e] border-[#e2136e] text-white shadow-lg shadow-[#e2136e]/20" : "bg-[#0d1117] border-slate-800 text-slate-500 hover:text-white"
                      )}
                    >
                      bKash
                    </button>
                    <button 
                      onClick={() => setPlatform('nagad')}
                      className={cn(
                        "py-3 rounded-2xl font-bold text-sm transition-all border",
                        platform === 'nagad' ? "bg-[#f7941d] border-[#f7941d] text-white shadow-lg shadow-[#f7941d]/20" : "bg-[#0d1117] border-slate-800 text-slate-500 hover:text-white"
                      )}
                    >
                      Nagad
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transaction ID</label>
                    <input 
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                      placeholder="Enter Transaction ID"
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={submitting || (!course.is_offline && !transactionId)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Confirm Enrollment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
