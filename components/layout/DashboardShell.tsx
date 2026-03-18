'use client';

import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface DashboardShellProps {
  children: React.ReactNode
}

/**
 * Auth wrapper for dashboard pages. Layout provides Sidebar + Navbar.
 * This only handles loading state and auth redirect.
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    )
  }

  if (!profile) {
    redirect('/login')
  }

  return <>{children}</>
}
