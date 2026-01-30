import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import { ProjectCard } from '@/components/cards'
import { createClient } from '@/lib/supabase/server'

async function getUserProjects(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('*, user:users(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data || []) as any[]
}

export default async function DashboardProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const projects = await getUserProjects(user.id)

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">My Projects</h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            Manage your submitted projects
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="relative">
              <ProjectCard
                project={project}
                userId={user.id}
                showStatus
              />
              <Link
                href={`/dashboard/projects/${project.id}/edit`}
                className="absolute top-4 right-4 px-3 py-1.5 text-sm bg-surface-hover text-text-secondary"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">You haven&apos;t submitted any projects yet</p>
          <p className="text-sm text-text-muted mt-2">
            Submit your first vibecoded project to get started
          </p>
          <Link href="/dashboard/projects/new" className="mt-6 inline-block">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Submit Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
