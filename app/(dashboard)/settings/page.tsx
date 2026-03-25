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
  Shield,
  Plus,
  Trash2,
  BookOpen,
  ImageIcon,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
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
  const [teacherCourses, setTeacherCourses] = useState<{ id: string; title: string; status: string }[]>([]);
  const [teacherForm, setTeacherForm] = useState({
    bio: '',
    education_subject: '',
    education_university: '',
    expertise: [] as string[],
    expertiseDraft: '',
    experience_time: '',
    avatar_url: '',
  });
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
      const ex = (profile as any).expertise_json;
      setTeacherForm({
        bio: profile.bio || '',
        education_subject: (profile as any).education_subject || '',
        education_university: (profile as any).education_university || '',
        expertise: Array.isArray(ex) ? ex.filter((x: unknown) => typeof x === 'string') : [],
        expertiseDraft: '',
        experience_time: (profile as any).experience_time || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile, resetProfile]);

  useEffect(() => {
    if (!user || profile?.role !== 'teacher') return;
    (async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('teacher_id', user.id)
        .order('title');
      setTeacherCourses(data || []);
    })();
  }, [user, profile?.role, supabase]);

  const onProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const baseUpdate: Record<string, unknown> = {
        name: data.name,
        mobile: data.mobile || null,
        class: data.class && ['SSC', 'HSC'].includes(data.class) ? data.class : null,
      };
      if (profile?.role === 'teacher') {
        baseUpdate.bio = teacherForm.bio.trim() || null;
        baseUpdate.education_subject = teacherForm.education_subject.trim() || null;
        baseUpdate.education_university = teacherForm.education_university.trim() || null;
        baseUpdate.expertise_json = teacherForm.expertise;
        baseUpdate.experience_time = teacherForm.experience_time.trim() || null;
        baseUpdate.avatar_url = teacherForm.avatar_url.trim() || null;
      }

      const { error } = await supabase.from('profiles').update(baseUpdate).eq('id', user.id);

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

            {profile?.role === 'teacher' && (
              <div className="pt-6 border-t border-slate-800 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Briefcase size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Teacher profile</h3>
                    <p className="text-xs text-slate-500">Shown on public course pages</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio (public)</label>
                  <textarea
                    value={teacherForm.bio}
                    onChange={(e) => setTeacherForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    placeholder="Short bio shown on course pages..."
                    className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} /> Photo URL
                    </label>
                    <input
                      value={teacherForm.avatar_url}
                      onChange={(e) => setTeacherForm((p) => ({ ...p, avatar_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Education — subject</label>
                    <input
                      value={teacherForm.education_subject}
                      onChange={(e) => setTeacherForm((p) => ({ ...p, education_subject: e.target.value }))}
                      placeholder="e.g. Physics"
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">University</label>
                    <input
                      value={teacherForm.education_university}
                      onChange={(e) => setTeacherForm((p) => ({ ...p, education_university: e.target.value }))}
                      placeholder="e.g. University of Dhaka"
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</label>
                    <input
                      value={teacherForm.experience_time}
                      onChange={(e) => setTeacherForm((p) => ({ ...p, experience_time: e.target.value }))}
                      placeholder="e.g. 8 years teaching"
                      className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expertise (add multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {teacherForm.expertise.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setTeacherForm((p) => ({
                              ...p,
                              expertise: p.expertise.filter((_, j) => j !== i),
                            }))
                          }
                          className="p-1 rounded hover:bg-white/10 text-slate-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={teacherForm.expertiseDraft}
                      onChange={(e) => setTeacherForm((p) => ({ ...p, expertiseDraft: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const t = teacherForm.expertiseDraft.trim();
                          if (t) {
                            setTeacherForm((p) => ({
                              ...p,
                              expertise: [...p.expertise, t],
                              expertiseDraft: '',
                            }));
                          }
                        }
                      }}
                      placeholder="Type expertise and press Enter"
                      className="flex-1 bg-[#0d1117] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const t = teacherForm.expertiseDraft.trim();
                        if (!t) return;
                        setTeacherForm((p) => ({
                          ...p,
                          expertise: [...p.expertise, t],
                          expertiseDraft: '',
                        }));
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} /> Your courses (from platform)
                  </label>
                  <p className="text-[11px] text-slate-600">Synced automatically from courses assigned to you.</p>
                  <ul className="rounded-xl border border-slate-800 divide-y divide-slate-800 bg-[#0d1117] max-h-48 overflow-y-auto">
                    {teacherCourses.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-slate-500">No courses yet.</li>
                    ) : (
                      teacherCourses.map((c) => (
                        <li key={c.id} className="px-4 py-2 flex items-center justify-between gap-2 text-sm">
                          <span className="text-white truncate">{c.title}</span>
                          <span className="text-[10px] uppercase text-slate-500 shrink-0">{c.status}</span>
                        </li>
                      ))
                    )}
                  </ul>
                  <Link
                    href="/teacher/courses"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Open teacher courses →
                  </Link>
                </div>
              </div>
            )}
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
