'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(11, 'Mobile number must be at least 11 digits'),
  class: z.enum(['SSC', 'HSC'], {
    message: "Please select a class",
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role: 'student',
            mobile: values.mobile,
            class: values.class,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Trigger creates profile; upsert only when we have a session (email confirmed or confirm disabled)
        if (authData.session) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              name: values.name,
              email: values.email,
              mobile: values.mobile,
              class: values.class,
              role: 'student',
              status: 'active',
            });

          if (profileError) throw profileError;
        }
        // If no session (email confirmation pending), trigger already created profile with metadata
        router.push(authData.session ? '/student' : '/login?message=Check your email to confirm');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] px-4 py-12 font-bengali">
      <div className="w-full max-w-md space-y-8 bg-[#161b22] p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">ছাত্র সাইনআপ</h1>
          <p className="mt-2 text-slate-400">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">পুরো নাম</label>
              <input
                {...register('name')}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.name && "border-red-500 focus:ring-red-500"
                )}
                placeholder="আপনার নাম"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">শ্রেণী</label>
                <select
                  {...register('class')}
                  className={cn(
                    "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.class && "border-red-500 focus:ring-red-500"
                  )}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                </select>
                {errors.class && <p className="mt-1 text-xs text-red-500">{errors.class.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">মোবাইল নম্বর</label>
                <input
                  {...register('mobile')}
                  className={cn(
                    "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.mobile && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder="017XXXXXXXX"
                />
                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ইমেইল</label>
              <input
                {...register('email')}
                type="email"
                className={cn(
                  "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.email && "border-red-500 focus:ring-red-500"
                )}
                placeholder="example@mail.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">পাসওয়ার্ড</label>
                <input
                  {...register('password')}
                  type="password"
                  className={cn(
                    "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.password && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">নিশ্চিত করুন</label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className={cn(
                    "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                    errors.confirmPassword && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'সাইনআপ'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
