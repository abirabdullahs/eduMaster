'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardShell from '@/components/layout/DashboardShell';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const profileSchema = z.object({
  name: z.string().min(3, 'নাম অন্তত ৩ অক্ষরের হতে হবে'),
  mobile: z.string().min(11, 'সঠিক মোবাইল নাম্বার দিন'),
  class: z.enum(['SSC', 'HSC']).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  newPassword: z.string().min(6, 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string().min(6, 'পাসওয়ার্ড নিশ্চিত করুন'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "পাসওয়ার্ড মেলেনি",
  path: ["confirmPassword"],
});

export default function StudentProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const supabase = createClient();

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name || '',
        mobile: profile.mobile || '',
        class: profile.class ?? undefined,
      });
    }
  }, [profile, resetProfile]);

  const onProfileUpdate = async (data: any) => {
    if (!user) return;
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          mobile: data.mobile,
          class: data.class && ['SSC', 'HSC'].includes(data.class) ? data.class : null,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordUpdate = async (data: any) => {
    setUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      setPasswordSuccess(true);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 font-bengali">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">প্রোফাইল</h1>
          <p className="text-slate-400">আপনার ব্যক্তিগত তথ্য এবং পাসওয়ার্ড পরিবর্তন করুন।</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Profile Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                  <User size={24} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">ব্যক্তিগত তথ্য</h2>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <input 
                      {...registerProfile('name')}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {profileErrors.name && <p className="text-xs text-rose-500 font-bold">{profileErrors.name.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={14} /> Email Address
                    </label>
                    <input 
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-[#0d1117]/50 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={14} /> Mobile Number
                    </label>
                    <input 
                      {...registerProfile('mobile')}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {profileErrors.mobile && <p className="text-xs text-rose-500 font-bold">{profileErrors.mobile.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap size={14} /> Class
                    </label>
                    <select 
                      {...registerProfile('class')}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                      <option value="">সিলেক্ট করুন</option>
                      <option value="SSC">SSC</option>
                      <option value="HSC">HSC</option>
                    </select>
                    {profileErrors.class && <p className="text-xs text-rose-500 font-bold">{profileErrors.class.message as string}</p>}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {profileSuccess && (
                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 size={18} />
                      সফলভাবে আপডেট হয়েছে!
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={updatingProfile}
                    className="ml-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    {updatingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                  <Lock size={24} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">পাসওয়ার্ড পরিবর্তন</h2>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <KeyRound size={14} /> Current Password
                    </label>
                    <input 
                      type="password"
                      {...registerPassword('currentPassword')}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {passwordErrors.currentPassword && <p className="text-xs text-rose-500 font-bold">{passwordErrors.currentPassword.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} /> New Password
                    </label>
                    <input 
                      type="password"
                      {...registerPassword('newPassword')}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {passwordErrors.newPassword && <p className="text-xs text-rose-500 font-bold">{passwordErrors.newPassword.message as string}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} /> Confirm Password
                    </label>
                    <input 
                      type="password"
                      {...registerPassword('confirmPassword')}
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {passwordErrors.confirmPassword && <p className="text-xs text-rose-500 font-bold">{passwordErrors.confirmPassword.message as string}</p>}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 size={18} />
                      পাসওয়ার্ড আপডেট হয়েছে!
                    </div>
                  )}
                  {passwordError && (
                    <div className="flex items-center gap-2 text-rose-500 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                      <AlertCircle size={18} />
                      {passwordError}
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={updatingPassword}
                    className="ml-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Stats/Info */}
          <div className="space-y-8">
            <div className="bg-[#161b22] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-500 border-4 border-slate-800">
                  <User size={48} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">{profile?.name}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Student Account</p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg uppercase tracking-widest">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Member Since</span>
                  <span className="text-sm font-bold text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 space-y-4 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={160} />
              </div>
              <h3 className="text-xl font-bold text-white relative z-10">Security Tip</h3>
              <p className="text-indigo-100 text-sm leading-relaxed relative z-10">
                আপনার পাসওয়ার্ড কারো সাথে শেয়ার করবেন না। নিয়মিত পাসওয়ার্ড পরিবর্তন করা আপনার অ্যাকাউন্টের নিরাপত্তার জন্য ভালো।
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
