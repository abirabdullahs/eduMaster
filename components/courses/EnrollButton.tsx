'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Course, Enrollment } from '@/lib/types';
import PaymentModal from './PaymentModal';
import { Loader2, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface EnrollButtonProps {
  course: Course;
  className?: string;
}

export default function EnrollButton({ course, className }: EnrollButtonProps) {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const checkEnrollment = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', course.id)
      .eq('student_id', session.user.id)
      .single();

    setEnrollment(data);
    setLoading(false);
  }, [course.id, supabase]);

  useEffect(() => {
    const init = async () => {
      await checkEnrollment();
    };
    init();
  }, [checkEnrollment]);

  const handleAction = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/login?next=/courses/${course.id}`);
      return;
    }

    if (enrollment?.status === 'active') {
      router.push(`/student/courses/${course.id}`);
      return;
    }

    if (enrollment?.status === 'pending') {
      return;
    }

    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <button disabled className={cn("px-6 py-2 bg-slate-800 text-slate-500 rounded-xl animate-pulse", className)}>
        Checking...
      </button>
    );
  }

  if (enrollment?.status === 'active') {
    return (
      <button 
        onClick={handleAction}
        className={cn("px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center gap-2", className)}
      >
        Go to Course <ChevronRight size={16} />
      </button>
    );
  }

  if (enrollment?.status === 'pending') {
    return (
      <div className={cn("px-6 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold rounded-xl flex items-center gap-2", className)}>
        <Clock size={16} />
        Pending Approval
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleAction}
        className={cn(
          "px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20",
          className
        )}
      >
        Enroll Now
      </button>

      {showPaymentModal && (
        <PaymentModal 
          course={course} 
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={() => {
            setShowPaymentModal(false);
            checkEnrollment();
          }}
        />
      )}
    </>
  );
}
