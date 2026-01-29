'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, FileText, TrendingUp, Sparkles, DollarSign, Trash2, Edit } from 'lucide-react'
import { Card } from '@/components/retroui/Card'
import { Badge } from '@/components/retroui/Badge'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import { ResourceVoteButton } from '@/components/ui/ResourceVoteButton'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Resource } from '@/types'

export interface GuideArticleCardProps {
  resource: Resource & {
    upvote_count?: number
    downvote_count?: number
    user_vote?: 'upvote' | 'downvote' | null
  }
  userId?: string | null
  className?: string
}

export function GuideArticleCard({ resource, userId, className }: GuideArticleCardProps) {
  const [imageError, setImageError] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Check if it's an internal article (starts with /learn/)
  const isInternalArticle = resource.url.startsWith('/learn/')

  // Check if current user owns this resource
  const isOwner = userId && resource.user_id === userId

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${resource.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id)

      if (error) {
        console.error('Error deleting resource:', error)
        alert('Failed to delete resource. Please try again.')
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error deleting resource:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setDeleting(false)
    }
  }
  
  // Extract short description (before --- separator if exists)
  const shortDescription = resource.description.split('\n\n---\n\n')[0]
  
  return (
    <Card className={cn('w-full', className)}>
      <Card.Content className="p-6">
        <div className="flex gap-6">
          {/* Vote Buttons */}
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <ResourceVoteButton
              resourceId={resource.id}
              initialUpvotes={resource.upvote_count || 0}
              initialDownvotes={resource.downvote_count || 0}
              initialUserVote={resource.user_vote || null}
              userId={userId}
            />
          </div>

          {/* Thumbnail */}
          <Link href={resource.url} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {resource.thumbnail_url && !imageError ? (
              <div className="w-24 h-24 border-2 border-black shadow-md overflow-hidden rounded bg-white flex items-center justify-center p-2">
                <Image
                  src={resource.thumbnail_url}
                  alt={resource.title}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  unoptimized={resource.thumbnail_url?.includes('google.com/s2/favicons') || resource.thumbnail_url?.includes('favicon.vemetric.com')}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-24 h-24 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <Link
                href={resource.url}
                className="flex-1 min-w-0"
                target={isInternalArticle ? undefined : '_blank'}
                rel={isInternalArticle ? undefined : 'noopener noreferrer'}
              >
                <Text as="h3" className="text-xl font-head font-bold mb-2 hover:underline">
                  {resource.title}
                </Text>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isInternalArticle && (
                  <ExternalLink className="w-5 h-5 text-muted-foreground mt-1" />
                )}
                {isOwner && (
                  <>
                    <Link href={`/dashboard/resources/${resource.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit Resource">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={deleting}
                      title="Delete Resource"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <p className="text-muted-foreground mb-4 line-clamp-3">
              {shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={resource.is_featured ? 'surface' : 'default'} size="sm">
                {resource.category}
              </Badge>
              {resource.is_featured && (
                <Badge variant="surface" size="sm">
                  Featured
                </Badge>
              )}
              {resource.difficulty && (
                <Badge variant="default" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                </Badge>
              )}
              {resource.pricing && (
                <Badge variant="default" size="sm" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {resource.pricing === 'free' && 'Free'}
                  {resource.pricing === 'freemium' && 'Freemium'}
                  {resource.pricing === 'paid' && 'Paid'}
                  {resource.pricing === 'open-source' && 'Open Source'}
                </Badge>
              )}
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.slice(0, 5).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {resource.tags.length > 5 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{resource.tags.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
