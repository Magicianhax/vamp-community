import Link from 'next/link'
import { Folder, Trophy, Send, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { ProjectCard } from '@/components/cards'
import { createClient } from '@/lib/supabase/server'

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const [projectsRes, submissionsRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*, user:users(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('grant_submissions')
      .select('*')
      .eq('user_id', userId),
  ])

  return {
    projects: (projectsRes.data || []) as any[],
    totalProjects: projectsRes.data?.length || 0,
    totalSubmissions: submissionsRes.data?.length || 0,
  }
}

async function getActiveGrants() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('grants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return count || 0
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [dashboardData, activeGrantsCount] = await Promise.all([
    getDashboardData(user.id),
    getActiveGrants(),
  ])

  const stats = [
    {
      label: 'My Projects',
      value: dashboardData.totalProjects,
      icon: Folder,
      href: '/dashboard/projects',
    },
    {
      label: 'Submissions',
      value: dashboardData.totalSubmissions,
      icon: Send,
      href: '/dashboard/submissions',
    },
    {
      label: 'Active Grants',
      value: activeGrantsCount,
      icon: Trophy,
      href: '/grants',
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          Welcome back! Here&apos;s an overview of your activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card-hover p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="font-semibold text-text-primary mb-3 sm:mb-4 text-sm sm:text-base">Quick Actions</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link href="/dashboard/projects/new">
            <Button>Submit New Project</Button>
          </Link>
          <Link href="/grants">
            <Button variant="secondary">Browse Grants</Button>
          </Link>
          <Link href="/learn">
            <Button variant="ghost">Learn Vibecoding</Button>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Recent Projects</h2>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {dashboardData.projects.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                userId={user.id}
                showStatus
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-text-secondary">You haven&apos;t submitted any projects yet</p>
            <Link href="/dashboard/projects/new" className="mt-4 inline-block">
              <Button>Submit Your First Project</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
