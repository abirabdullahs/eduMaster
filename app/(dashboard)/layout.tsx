import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import DashboardNavbar from '@/components/layout/DashboardNavbar'
import { AdminViewProvider } from '@/lib/context/AdminViewContext'
import { ViewAsBanner } from '@/components/layout/ViewToggle'
import { UserRole } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const role = profile.role as UserRole;

  return (
    <AdminViewProvider userRole={role}>
      <div className="min-h-screen bg-[#0a0e17] flex">
        <ViewAsBanner />
        <Sidebar role={role} />
        <div className="flex-1 ml-64 flex flex-col">
          <DashboardNavbar />
          <main className="p-6 md:p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </AdminViewProvider>
  )
}
