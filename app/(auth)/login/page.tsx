'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTeacher, setPendingTeacher] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    setPendingTeacher(false);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.role === 'admin') {
          router.push('/admin');
        } else if (profile.role === 'teacher') {
          if (profile.status === 'active') {
            router.push('/teacher');
          } else if (profile.status === 'pending') {
            setPendingTeacher(true);
            await supabase.auth.signOut();
          } else {
            setError('Your teacher account has been rejected.');
            await supabase.auth.signOut();
          }
        } else if (profile.role === 'student') {
          router.push('/student');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] px-4 font-bengali">
      <div className="w-full max-w-md space-y-8 bg-[#161b22] p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">লগইন করুন</h1>
          <p className="mt-2 text-slate-400">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        {pendingTeacher && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-200">
              <p className="font-bold">Approval Pending</p>
              <p>আপনার শিক্ষক অ্যাকাউন্টটি এখনো অনুমোদনের অপেক্ষায় আছে। অ্যাডমিন অনুমোদন করলে আপনি ড্যাশবোর্ডে প্রবেশ করতে পারবেন।</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ইমেইল</label>
              <input
                {...register('email')}
                type="email"
                className={cn(
                  "w-full px-4 py-3 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.email && "border-red-500 focus:ring-red-500"
                )}
                placeholder="example@mail.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">পাসওয়ার্ড</label>
              <input
                {...register('password')}
                type="password"
                className={cn(
                  "w-full px-4 py-3 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.password && "border-red-500 focus:ring-red-500"
                )}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'লগইন'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-800 space-y-4 text-center">
          <p className="text-sm text-slate-400">
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold">
              ছাত্র হিসেবে সাইনআপ
            </Link>
          </p>
          <p className="text-sm text-slate-400">
            শিক্ষক হিসেবে যোগ দিতে চান?{' '}
            <Link href="/teacher-signup" className="text-indigo-400 hover:text-indigo-300 font-bold">
              শিক্ষক সাইনআপ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
