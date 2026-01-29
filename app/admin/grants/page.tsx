'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Trophy } from 'lucide-react'
import { Button, Badge, ConfirmModal } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getDaysUntil } from '@/lib/utils'
import { GRANT_STATUS_COLORS, GRANT_STATUS_LABELS } from '@/lib/constants'
import type { Grant } from '@/types'

export default function AdminGrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchGrants = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('grants')
      .select('*')
      .order('created_at', { ascending: false })

    setGrants(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchGrants()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    const supabase = createClient()

    await supabase
      .from('grants')
      .delete()
      .eq('id', deleteId)

    await fetchGrants()
    setDeleteId(null)
    setIsDeleting(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl animate-pulse">
        <div className="h-10 w-48 bg-surface-hover rounded mb-8" />
        <div className="card">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 border-b border-border last:border-0">
              <div className="h-20 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Manage Grants</h1>
          <p className="text-text-secondary mt-1">
            Create and manage grant programs
          </p>
        </div>
        <Link href="/admin/grants/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Grant
          </Button>
        </Link>
      </div>

      {grants.length > 0 ? (
        <div className="card divide-y divide-border">
          {grants.map((grant) => {
            const daysLeft = getDaysUntil(grant.deadline)
            const isExpired = daysLeft < 0

            return (
              <div
                key={grant.id}
                className="p-6 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">
                        {grant.title}
                      </h3>
                      <Badge className={GRANT_STATUS_COLORS[grant.status]} size="sm">
                        {GRANT_STATUS_LABELS[grant.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {grant.sponsor_name} · {grant.prize_amount}
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      Deadline: {formatDate(grant.deadline)}
                      {isExpired ? ' (Ended)' : ` (${daysLeft} days left)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/grants/${grant.id}/edit`}>
                    <Button size="sm" variant="secondary">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleteId(grant.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">No grants created yet</p>
          <Link href="/admin/grants/new" className="mt-4 inline-block">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create First Grant
            </Button>
          </Link>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Grant"
        description="Are you sure you want to delete this grant? This will also remove all submissions."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
