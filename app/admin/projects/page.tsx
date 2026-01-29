'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, Github, Check, X, Star, Eye } from 'lucide-react'
import { Button, Badge, Avatar, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import { PROJECT_STATUS_COLORS } from '@/lib/constants'
import type { Project, ProjectStatus } from '@/types'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<(Project & { user: any })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false })

    setProjects(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const updateStatus = async (projectId: string, status: ProjectStatus) => {
    setActionLoading(projectId)
    const supabase = createClient()

    await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)

    await fetchProjects()
    setActionLoading(null)
  }

  const pendingProjects = projects.filter((p) => p.status === 'pending')
  const approvedProjects = projects.filter((p) => p.status === 'approved')
  const featuredProjects = projects.filter((p) => p.status === 'featured')
  const rejectedProjects = projects.filter((p) => p.status === 'rejected')

  const ProjectRow = ({ project }: { project: Project & { user: any } }) => (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <Avatar
          src={project.user?.avatar_url}
          alt={project.user?.username || 'User'}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-text-primary truncate">
              {project.title}
            </h3>
            <Badge className={PROJECT_STATUS_COLORS[project.status]} size="sm">
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary truncate">{project.tagline}</p>
          <p className="text-xs text-text-muted mt-1">
            by @{project.user?.username} · {formatRelativeTime(project.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={project.demo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-text-muted"
          title="View Demo"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <a
          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-text-muted"
          title="View GitHub"
        >
          <Github className="w-4 h-4" />
        </a>
        <Link
          href={`/projects/${project.id}`}
          className="p-2 text-text-muted"
          title="View Project"
        >
          <Eye className="w-4 h-4" />
        </Link>

        {project.status === 'pending' && (
          <>
            <Button
              size="sm"
              onClick={() => updateStatus(project.id, 'approved')}
              isLoading={actionLoading === project.id}
              disabled={actionLoading !== null}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => updateStatus(project.id, 'rejected')}
              isLoading={actionLoading === project.id}
              disabled={actionLoading !== null}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </>
        )}

        {project.status === 'approved' && (
          <Button
            size="sm"
            variant="accent"
            onClick={() => updateStatus(project.id, 'featured')}
            isLoading={actionLoading === project.id}
            disabled={actionLoading !== null}
          >
            <Star className="w-4 h-4 mr-1" />
            Feature
          </Button>
        )}

        {project.status === 'featured' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateStatus(project.id, 'approved')}
            isLoading={actionLoading === project.id}
            disabled={actionLoading !== null}
          >
            Unfeature
          </Button>
        )}

        {project.status === 'rejected' && (
          <Button
            size="sm"
            onClick={() => updateStatus(project.id, 'approved')}
            isLoading={actionLoading === project.id}
            disabled={actionLoading !== null}
          >
            Approve
          </Button>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="h-10 w-48 bg-surface-hover rounded mb-8" />
        <div className="card">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-border last:border-0">
              <div className="h-16 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Manage Projects</h1>
        <p className="text-text-secondary mt-1">
          Review and moderate project submissions
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({featuredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="card divide-y divide-border">
            {pendingProjects.length > 0 ? (
              pendingProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No pending projects
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="card divide-y divide-border">
            {approvedProjects.length > 0 ? (
              approvedProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No approved projects
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="featured">
          <div className="card divide-y divide-border">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No featured projects
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="card divide-y divide-border">
            {rejectedProjects.length > 0 ? (
              rejectedProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            ) : (
              <div className="p-12 text-center text-text-secondary">
                No rejected projects
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
