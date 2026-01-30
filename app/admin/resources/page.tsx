'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ExternalLink, Star } from 'lucide-react'
import { Button, Badge, ConfirmModal } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { Resource } from '@/types'

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchResources = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    setResources(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    await supabase
      .from('resources')
      .delete()
      .eq('id', deleteId)

    await fetchResources()
    setDeleteId(null)
    setIsDeleting(false)
  }

  const toggleFeatured = async (resourceId: string, isFeatured: boolean) => {
    setActionLoading(resourceId)
    const supabase = createClient()

    await supabase
      .from('resources')
      .update({ is_featured: !isFeatured })
      .eq('id', resourceId)

    await fetchResources()
    setActionLoading(null)
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Manage Resources</h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            Curate learning resources for the community
          </p>
        </div>
        <Link href="/admin/resources/new">
          <Button size="sm" className="w-full sm:w-auto">
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
              className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="font-medium text-text-primary text-sm sm:text-base truncate">
                    {resource.title}
                  </h3>
                  <Badge size="sm" className="text-[10px] sm:text-xs">{resource.category}</Badge>
                  <Badge
                    size="sm"
                    className="text-[10px] sm:text-xs"
                    variant={resource.status === 'approved' || resource.status === 'featured' ? 'accent' : 'default'}
                  >
                    {resource.status === 'pending' ? 'Pending' : resource.status === 'approved' ? 'Approved' : resource.status === 'rejected' ? 'Rejected' : 'Featured'}
                  </Badge>
                  {resource.is_featured && (
                    <Badge size="sm" variant="accent" className="text-[10px] sm:text-xs">Featured</Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-text-secondary truncate mt-1">
                  {resource.description}
                </p>
                <p className="text-[10px] sm:text-xs text-text-muted mt-1">
                  Added {formatDate(resource.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 text-text-muted"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
                <Button
                  size="sm"
                  variant={resource.is_featured ? 'accent' : 'secondary'}
                  onClick={() => toggleFeatured(resource.id, resource.is_featured)}
                  isLoading={actionLoading === resource.id}
                  disabled={actionLoading !== null}
                >
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                <Link href={`/admin/resources/${resource.id}/edit`}>
                  <Button size="sm" variant="secondary">
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setDeleteId(resource.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">No resources added yet</p>
          <Link href="/admin/resources/new" className="mt-4 inline-block">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Resource
            </Button>
          </Link>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        description="Are you sure you want to delete this resource?"
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
