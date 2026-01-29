'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { RESOURCE_STATUS_LABELS, RESOURCE_CATEGORIES } from '@/lib/constants'
import type { Resource } from '@/types'

export default function DashboardResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const fetchResources = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setResources((data as Resource[]) || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleDelete = async (resourceId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(resourceId)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)

      if (error) {
        console.error('Error deleting resource:', error)
        alert('Failed to delete resource. Please try again.')
      } else {
        await fetchResources()
      }
    } catch (err) {
      console.error('Unexpected error deleting resource:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryLabel = (category: string) => {
    return RESOURCE_CATEGORIES.find(c => c.value === category)?.label || category
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl animate-pulse">
        <div className="h-10 w-48 bg-muted rounded mb-8" />
        <div className="card">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-b border-border last:border-0">
              <div className="h-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Resources</h1>
          <p className="text-text-secondary mt-1">
            Manage your submitted tutorials, guides, and tools
          </p>
        </div>
        <Link href="/dashboard/resources/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Resource
          </Button>
        </Link>
      </div>

      {resources.length > 0 ? (
        <div className="card divide-y divide-border">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-text-primary truncate">
                    {resource.title}
                  </h3>
                  <Badge size="sm">{getCategoryLabel(resource.category)}</Badge>
                  <Badge
                    size="sm"
                    variant={resource.status === 'approved' || resource.status === 'featured' ? 'accent' : 'default'}
                  >
                    {RESOURCE_STATUS_LABELS[resource.status]}
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary truncate mt-1">
                  {resource.description}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Submitted {formatDate(resource.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-muted hover:text-text-primary"
                  title="View Resource"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Link href={`/dashboard/resources/${resource.id}/edit`}>
                  <Button size="sm" variant="secondary" title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(resource.id, resource.title)}
                  disabled={deleting === resource.id}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">You haven&apos;t submitted any resources yet</p>
          <p className="text-sm text-text-muted mt-1">
            Share tutorials, guides, tools, or other learning resources with the community
          </p>
          <Link href="/dashboard/resources/new" className="mt-4 inline-block">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Resource
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
