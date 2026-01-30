'use client'

import { useState } from 'react'
import { ResourceRow } from './ResourceRow'
import type { Resource } from '@/types'

export interface ResourceListProps {
  resources: (Resource & {
    upvote_count?: number
    downvote_count?: number
    user_vote?: 'upvote' | 'downvote' | null
  })[]
  userId?: string | null
  showRank?: boolean
}

export function ResourceList({ resources, userId, showRank = true }: ResourceListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (resourceId: string) => {
    setExpandedId(prev => prev === resourceId ? null : resourceId)
  }

  return (
    <div className="space-y-2">
      {resources.map((resource, index) => (
        <ResourceRow
          key={resource.id}
          resource={resource}
          rank={showRank ? index + 1 : undefined}
          userId={userId}
          isExpanded={expandedId === resource.id}
          onToggle={() => handleToggle(resource.id)}
        />
      ))}
    </div>
  )
}
