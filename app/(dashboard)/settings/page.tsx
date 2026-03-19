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
  KeyRound,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  mobile: z.string().optional(),
  class: z.enum(['SSC', 'HSC']).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(6, 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  confirmPassword: z.string().min(6, 'পাসওয়ার্ড নিশ্চিত করুন'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "পাসওয়ার্ড মেলেনি",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
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

  const onProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          mobile: data.mobile || null,
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

  const onPasswordUpdate = async (data: z.infer<typeof passwordSchema>) => {
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

  const roleLabel = profile?.role === 'admin' ? 'Admin' : profile?.role === 'teacher' ? 'Teacher' : 'Student';

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and profile</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Profile */}
        <div className="p-6 bg-[#161b22] rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <User size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <p className="text-sm text-slate-400">Update your profile information</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input 
                  {...registerProfile('name')}
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    profileErrors.name && "border-red-500/50"
                  )}
                />
                {profileErrors.name && <p className="text-xs text-red-500">{profileErrors.name.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input 
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-[#0d1117]/50 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} /> Mobile
                </label>
                <input 
                  {...registerProfile('mobile')}
                  placeholder="01XXXXXXXXX"
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    profileErrors.mobile && "border-red-500/50"
                  )}
                />
                {profileErrors.mobile && <p className="text-xs text-red-500">{profileErrors.mobile.message as string}</p>}
              </div>
              {(profile?.role === 'student') && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} /> Class
                  </label>
                  <select 
                    {...registerProfile('class')}
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">সিলেক্ট করুন</option>
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              {profileSuccess && (
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <CheckCircle2 size={18} />
                  আপডেট হয়েছে!
                </div>
              )}
              <button 
                type="submit"
                disabled={updatingProfile}
                className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2"
              >
                {updatingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="p-6 bg-[#161b22] rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Lock size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-sm text-slate-400">Change your password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <KeyRound size={14} /> Current Password
                </label>
                <input 
                  type="password"
                  {...registerPassword('currentPassword')}
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    passwordErrors.currentPassword && "border-red-500/50"
                  )}
                />
                {passwordErrors.currentPassword && <p className="text-xs text-red-500">{passwordErrors.currentPassword.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> New Password
                </label>
                <input 
                  type="password"
                  {...registerPassword('newPassword')}
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    passwordErrors.newPassword && "border-red-500/50"
                  )}
                />
                {passwordErrors.newPassword && <p className="text-xs text-red-500">{passwordErrors.newPassword.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} /> Confirm
                </label>
                <input 
                  type="password"
                  {...registerPassword('confirmPassword')}
                  className={cn(
                    "w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    passwordErrors.confirmPassword && "border-red-500/50"
                  )}
                />
                {passwordErrors.confirmPassword && <p className="text-xs text-red-500">{passwordErrors.confirmPassword.message as string}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-emerald-500 text-sm">
                  <CheckCircle2 size={18} />
                  পাসওয়ার্ড আপডেট হয়েছে!
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={18} />
                  {passwordError}
                </div>
              )}
              <button 
                type="submit"
                disabled={updatingPassword}
                className="ml-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2"
              >
                {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Account info */}
        <div className="p-6 bg-[#161b22] rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-500/10 rounded-xl">
              <Shield size={20} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Account</h2>
              <p className="text-sm text-slate-400">{roleLabel} • {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
