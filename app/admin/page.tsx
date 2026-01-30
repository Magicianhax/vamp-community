import Link from 'next/link'
import { Users, Folder, Trophy, BookOpen, Send, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = await createClient()

  const [users, projects, grants, resources, submissions, pendingProjects] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('grants').select('*', { count: 'exact', head: true }),
    supabase.from('resources').select('*', { count: 'exact', head: true }),
    supabase.from('grant_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalUsers: users.count || 0,
    totalProjects: projects.count || 0,
    totalGrants: grants.count || 0,
    totalResources: resources.count || 0,
    totalSubmissions: submissions.count || 0,
    pendingProjects: pendingProjects.count || 0,
  }
}

interface RecentProject {
  id: string
  title: string
  status: string
  created_at: string
  user: { username: string } | null
}

async function getRecentActivity(): Promise<RecentProject[]> {
  const supabase = await createClient()

  const { data: recentProjects } = await supabase
    .from('projects')
    .select('id, title, status, created_at, user:users(username)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Supabase returns user as array, extract first element
  return (recentProjects || []).map((p: unknown) => {
    const project = p as { id: string; title: string; status: string; created_at: string; user: { username: string }[] }
    return {
      ...project,
      user: project.user?.[0] || null
    }
  })
}

export default async function AdminDashboardPage() {
  const [stats, recentProjects] = await Promise.all([
    getStats(),
    getRecentActivity(),
  ])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, href: '/admin/users' },
    { label: 'Total Projects', value: stats.totalProjects, icon: Folder, href: '/admin/projects' },
    { label: 'Pending Review', value: stats.pendingProjects, icon: TrendingUp, href: '/admin/projects?status=pending', highlight: true },
    { label: 'Active Grants', value: stats.totalGrants, icon: Trophy, href: '/admin/grants' },
    { label: 'Resources', value: stats.totalResources, icon: BookOpen, href: '/admin/resources' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: Send, href: '/admin/submissions' },
  ]

  return (
    <div className="max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          Overview of platform activity and management tools
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card-hover p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold mt-1 ${stat.highlight ? 'text-accent' : 'text-text-primary'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${stat.highlight ? 'bg-accent/10' : 'bg-primary/10'}`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.highlight ? 'text-accent' : 'text-primary'}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="font-semibold text-text-primary text-sm sm:text-base">Recent Projects</h2>
        </div>
        <div className="divide-y divide-border">
          {recentProjects.map((project) => (
            <div key={project.id} className="p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary text-sm sm:text-base truncate">{project.title}</p>
                <p className="text-xs sm:text-sm text-text-secondary">
                  by @{project.user?.username}
                </p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium ${
                project.status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : project.status === 'approved'
                  ? 'bg-green-500/10 text-green-500'
                  : project.status === 'featured'
                  ? 'bg-accent/10 text-accent'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
