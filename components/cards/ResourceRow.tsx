'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink, BookOpen, Wrench, User, FileText, Video, Sparkles, Tag } from 'lucide-react'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { ResourceVoteButton } from '@/components/ui/ResourceVoteButton'
import type { Resource, ResourceCategory } from '@/types'

export interface ResourceRowProps {
  resource: Resource & {
    upvote_count?: number
    downvote_count?: number
    user_vote?: 'upvote' | 'downvote' | null
  }
  rank?: number
  userId?: string | null
}

const categoryIcons: Record<ResourceCategory, React.ReactNode> = {
  tutorial: <BookOpen className="w-5 h-5" />,
  tool: <Wrench className="w-5 h-5" />,
  expert: <User className="w-5 h-5" />,
  article: <FileText className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
}

export function ResourceRow({ resource, rank, userId }: ResourceRowProps) {
  const [imageError, setImageError] = useState(false)

  const isInternalArticle = resource.url.startsWith('/learn/')
  const tagsDisplay = resource.tags?.length
    ? resource.tags.slice(0, 2).join(' • ')
    : null

  return (
    <Card className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 w-full box-border overflow-hidden">
      {/* Rank */}
      {rank != null && (
        <span className="w-5 sm:w-8 flex-shrink-0 text-sm sm:text-lg font-head font-bold tabular-nums text-muted-foreground sm:text-foreground">
          {rank}.
        </span>
      )}

      {/* Thumbnail or Icon */}
      <div className="flex-shrink-0">
        {resource.thumbnail_url && !imageError ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md overflow-hidden rounded bg-white flex items-center justify-center p-1">
            <Image
              src={resource.thumbnail_url}
              alt={resource.title}
              width={48}
              height={48}
              className="w-full h-full object-contain"
              unoptimized={resource.thumbnail_url?.includes('google.com/s2/favicons') || resource.thumbnail_url?.includes('favicon.vemetric.com')}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md bg-primary flex items-center justify-center">
            {categoryIcons[resource.category]}
          </div>
        )}
      </div>

      {/* Title, description, badges */}
      <div className="flex-1 min-w-0">
        <a
          href={resource.url}
          target={isInternalArticle ? undefined : '_blank'}
          rel={isInternalArticle ? undefined : 'noopener noreferrer'}
          className="flex items-center gap-1 sm:gap-2"
        >
          <h3 className="font-head font-semibold text-sm sm:text-base line-clamp-1">
            {resource.title}
          </h3>
          {!isInternalArticle && (
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
          )}
        </a>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {resource.description}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
          <Badge variant={resource.is_featured ? 'surface' : 'default'} size="sm" className="text-[10px] sm:text-xs">
            {resource.category}
          </Badge>
          {resource.ai_tool_type && (
            <Badge variant="default" size="sm" className="hidden sm:flex items-center gap-1 text-[10px] sm:text-xs">
              <Sparkles className="w-3 h-3" />
              AI Tool
            </Badge>
          )}
          {tagsDisplay && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{tagsDisplay}</span>
            </span>
          )}
        </div>
      </div>

      {/* Vote buttons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ResourceVoteButton
          resourceId={resource.id}
          initialUpvotes={resource.upvote_count || 0}
          initialDownvotes={resource.downvote_count || 0}
          initialUserVote={resource.user_vote || null}
          userId={userId}
        />
      </div>
    </Card>
  )
}
