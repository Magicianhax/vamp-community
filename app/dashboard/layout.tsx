import { redirect } from 'next/navigation'
import { Header, Sidebar, MobileSidebar } from '@/components/layout'
import { DASHBOARD_NAV_LINKS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <div className="flex-1 flex">
        <div className="hidden lg:block">
          <Sidebar
            links={DASHBOARD_NAV_LINKS}
            title="Dashboard"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <MobileSidebar
            links={DASHBOARD_NAV_LINKS}
            title="Dashboard"
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
