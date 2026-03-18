'use client';

import Sidebar from './Sidebar'
import DashboardNavbar from './DashboardNavbar'
import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    )
  }

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar role={profile.role} />
      <div className="flex-1 ml-64 flex flex-col">
        <DashboardNavbar />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
