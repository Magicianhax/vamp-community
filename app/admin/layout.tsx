import { redirect } from 'next/navigation'
import { Header, Sidebar, MobileSidebar } from '@/components/layout'
import { ADMIN_NAV_LINKS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <div className="hidden lg:block">
          <Sidebar
            links={ADMIN_NAV_LINKS}
            title="Admin Panel"
            backLink={{ href: '/dashboard', label: 'Back to Dashboard' }}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <MobileSidebar
            links={ADMIN_NAV_LINKS}
            title="Admin"
          />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
