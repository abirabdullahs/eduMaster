import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import DashboardNavbar from '@/components/layout/DashboardNavbar'
import { AdminViewProvider } from '@/lib/context/AdminViewContext'
import { SidebarProvider } from '@/lib/context/SidebarContext'
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
      <SidebarProvider>
        <div className="min-h-screen bg-[#0a0e17] flex">
          <ViewAsBanner />
          <Sidebar role={role} />
          <div className="flex-1 md:ml-64 flex flex-col min-w-0">
            <DashboardNavbar />
            <main className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminViewProvider>
  )
}
