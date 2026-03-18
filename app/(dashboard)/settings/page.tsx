'use client';

import { User, Bell, Shield } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account settings</p>
      </div>
      <div className="space-y-8 max-w-2xl">
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
          <p className="text-slate-400 text-sm">Profile settings coming soon.</p>
        </div>

        <div className="p-6 bg-[#161b22] rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Bell size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="text-sm text-slate-400">Configure notification preferences</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Notification settings coming soon.</p>
        </div>

        <div className="p-6 bg-[#161b22] rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Shield size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-sm text-slate-400">Password and security options</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Security settings coming soon.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
