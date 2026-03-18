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

const teacherSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(11, 'Mobile number must be at least 11 digits'),
  expertise: z.string().min(5, 'Please specify your subject expertise'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TeacherSignupFormValues = z.infer<typeof teacherSignupSchema>;

export default function TeacherSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSignupFormValues>({
    resolver: zodResolver(teacherSignupSchema),
  });

  const onSubmit = async (values: TeacherSignupFormValues) => {
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
            role: 'teacher',
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            subject_expertise: values.expertise,
            bio: values.bio,
            role: 'teacher',
            status: 'pending',
          });

        if (profileError) throw profileError;

        setSuccess(true);
        // We don't redirect because status is pending
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] px-4 font-bengali">
        <div className="w-full max-w-md space-y-8 bg-[#161b22] p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">আবেদন জমা হয়েছে!</h1>
          <p className="text-slate-400">
            Application submitted. Admin will review your request. অনুমোদনের পর আপনি ইমেইল পাবেন এবং লগইন করতে পারবেন।
          </p>
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
          >
            লগইন পেজে ফিরুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] px-4 py-12 font-bengali">
      <div className="w-full max-w-lg space-y-8 bg-[#161b22] p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">শিক্ষক সাইনআপ</h1>
          <p className="mt-2 text-slate-400">আমাদের শিক্ষক প্যানেলে যোগ দিন</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">বিষয় দক্ষতা (Subject Expertise)</label>
              <input
                {...register('expertise')}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.expertise && "border-red-500 focus:ring-red-500"
                )}
                placeholder="উদা: পদার্থবিজ্ঞান, গণিত"
              />
              {errors.expertise && <p className="mt-1 text-xs text-red-500">{errors.expertise.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">সংক্ষিপ্ত পরিচিতি (Bio)</label>
              <textarea
                {...register('bio')}
                rows={3}
                className={cn(
                  "w-full px-4 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                  errors.bio && "border-red-500 focus:ring-red-500"
                )}
                placeholder="আপনার সম্পর্কে কিছু লিখুন..."
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}
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
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'শিক্ষক হিসেবে আবেদন করুন'}
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
