'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ShieldOff, ExternalLink } from 'lucide-react'
import { Button, Badge, Avatar } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    setUsers(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    setActionLoading(userId)
    const supabase = createClient()

    await supabase
      .from('users')
      .update({ is_admin: !isAdmin })
      .eq('id', userId)

    await fetchUsers()
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Manage Users</h1>
        <p className="text-text-secondary mt-1">
          View and manage platform users
        </p>
      </div>

      <div className="card divide-y divide-border">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar
                src={user.avatar_url}
                alt={user.display_name || user.username}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-primary truncate">
                    {user.display_name || user.username}
                  </h3>
                  {user.is_admin && (
                    <Badge variant="accent" size="sm">Admin</Badge>
                  )}
                </div>
                <p className="text-sm text-text-secondary">@{user.username}</p>
                <p className="text-xs text-text-muted mt-1">
                  Joined {formatDate(user.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/u/${user.username}`}
                className="p-2 text-text-muted"
                title="View Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <Button
                size="sm"
                variant={user.is_admin ? 'secondary' : 'accent'}
                onClick={() => toggleAdmin(user.id, user.is_admin)}
                isLoading={actionLoading === user.id}
                disabled={actionLoading !== null}
              >
                {user.is_admin ? (
                  <>
                    <ShieldOff className="w-4 h-4 mr-1" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-1" />
                    Make Admin
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
