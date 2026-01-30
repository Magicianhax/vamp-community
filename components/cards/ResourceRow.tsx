'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink, BookOpen, Wrench, User, FileText, Video, Sparkles, Tag, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { ResourceVoteButton } from '@/components/ui/ResourceVoteButton'
import { cn } from '@/lib/utils'
import type { Resource, ResourceCategory } from '@/types'

export interface ResourceRowProps {
  resource: Resource & {
    upvote_count?: number
    downvote_count?: number
    user_vote?: 'upvote' | 'downvote' | null
  }
  rank?: number
  userId?: string | null
  isExpanded?: boolean
  onToggle?: () => void
}

const categoryIcons: Record<ResourceCategory, React.ReactNode> = {
  tutorial: <BookOpen className="w-5 h-5" />,
  tool: <Wrench className="w-5 h-5" />,
  expert: <User className="w-5 h-5" />,
  article: <FileText className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
}

export function ResourceRow({ resource, rank, userId, isExpanded, onToggle }: ResourceRowProps) {
  const [imageError, setImageError] = useState(false)
  // Use internal state if no external control is provided
  const [internalExpanded, setInternalExpanded] = useState(false)

  // Only tools (resources with ai_tool_type) are expandable
  const isExpandable = !!resource.ai_tool_type

  const expanded = isExpandable ? (isExpanded !== undefined ? isExpanded : internalExpanded) : false
  const handleToggle = onToggle || (() => setInternalExpanded(!internalExpanded))

  const isInternalArticle = resource.url.startsWith('/learn/')
  const tagsDisplay = resource.tags?.length
    ? resource.tags.slice(0, 3).join(' • ')
    : null

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't do anything if clicking on vote buttons or the visit button
    const target = e.target as HTMLElement
    if (target.closest('[data-no-toggle]')) {
      return
    }

    // If it's a tool, toggle expand/collapse
    if (isExpandable) {
      handleToggle()
    } else {
      // For articles and other resources, navigate to the URL
      if (isInternalArticle) {
        window.location.href = resource.url
      } else {
        window.open(resource.url, '_blank', 'noopener,noreferrer')
      }
    }
  }

  return (
    <Card
      className={cn(
        "w-full box-border overflow-hidden cursor-pointer transition-all duration-200",
        expanded && "ring-2 ring-primary/20"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
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
          <div className="flex items-center gap-1 sm:gap-2">
            <h3 className="font-head font-semibold text-sm sm:text-base line-clamp-1">
              {resource.title}
            </h3>
            {!isInternalArticle && (
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <p className={cn(
            "text-xs sm:text-sm text-muted-foreground mt-0.5 transition-all duration-200",
            expanded ? "" : "line-clamp-1"
          )}>
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

        {/* Expand indicator (only for tools) and Vote buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isExpandable && (
            <ChevronDown
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          )}
          <div data-no-toggle onClick={(e) => e.stopPropagation()}>
            <ResourceVoteButton
              resourceId={resource.id}
              initialUpvotes={resource.upvote_count || 0}
              initialDownvotes={resource.downvote_count || 0}
              initialUserVote={resource.user_vote || null}
              userId={userId}
            />
          </div>
        </div>
      </div>

      {/* Expanded content - only for tools */}
      {isExpandable && (
        <div
          className={cn(
            "grid transition-all duration-200 ease-in-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0 border-t border-border/50">
              <div className="pt-3 sm:pt-4 space-y-3">
                {/* Full description */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">
                    {resource.description}
                  </p>
                </div>

                {/* Additional info */}
                <div className="flex flex-wrap gap-2">
                  {resource.ai_tool_type && (
                    <Badge variant="default" size="sm" className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {resource.ai_tool_type.replace(/-/g, ' ')}
                    </Badge>
                  )}
                  {resource.pricing && (
                    <Badge variant="outline" size="sm">
                      {resource.pricing}
                    </Badge>
                  )}
                  {resource.difficulty && (
                    <Badge variant="outline" size="sm">
                      {resource.difficulty}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="default" size="sm" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Visit button */}
                <div className="pt-2" data-no-toggle>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="sm" className="w-full sm:w-auto">
                      Visit Website
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
