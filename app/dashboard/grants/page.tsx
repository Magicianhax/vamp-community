'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ExternalLink, Trophy } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { GRANT_STATUS_LABELS } from '@/lib/constants'
import type { Grant } from '@/types'

export default function DashboardGrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const fetchGrants = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('grants')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    setGrants((data as Grant[]) || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchGrants()
  }, [])

  const handleDelete = async (grantId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(grantId)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('grants')
        .delete()
        .eq('id', grantId)

      if (error) {
        console.error('Error deleting grant:', error)
        alert('Failed to delete grant. Please try again.')
      } else {
        await fetchGrants()
      }
    } catch (err) {
      console.error('Unexpected error deleting grant:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setDeleting(null)
    }
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
          <h1 className="text-2xl font-bold text-text-primary">My Grants</h1>
          <p className="text-text-secondary mt-1">
            Manage grants you&apos;ve created to sponsor the community
          </p>
        </div>
        <Link href="/dashboard/grants/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Grant
          </Button>
        </Link>
      </div>

      {grants.length > 0 ? (
        <div className="card divide-y divide-border">
          {grants.map((grant) => (
            <div
              key={grant.id}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 border-2 border-black shadow-md bg-primary flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-text-primary truncate">
                      {grant.title}
                    </h3>
                    <Badge
                      size="sm"
                      variant={grant.status === 'active' ? 'accent' : 'default'}
                    >
                      {GRANT_STATUS_LABELS[grant.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary truncate mt-1">
                    {grant.prize_amount} &middot; Deadline: {formatDate(grant.deadline)}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Created {formatDate(grant.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/grants/${grant.id}`}>
                  <Button size="sm" variant="ghost" title="View Grant">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/grants/${grant.id}/edit`}>
                  <Button size="sm" variant="secondary" title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(grant.id, grant.title)}
                  disabled={deleting === grant.id}
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
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-text-secondary">You haven&apos;t created any grants yet</p>
          <p className="text-sm text-text-muted mt-1">
            Sponsor the community by creating a grant for vibecoded projects
          </p>
          <Link href="/dashboard/grants/new" className="mt-4 inline-block">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Grant
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
