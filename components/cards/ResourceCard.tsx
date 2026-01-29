'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, BookOpen, Wrench, User, FileText, Video, Sparkles, DollarSign, TrendingUp, Trash2, Edit } from 'lucide-react'
import { Card } from '@/components/retroui/Card'
import { Badge } from '@/components/retroui/Badge'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Resource, ResourceCategory } from '@/types'

export interface ResourceCardProps {
  resource: Resource
  userId?: string | null
  className?: string
}

const categoryIcons: Record<ResourceCategory, React.ReactNode> = {
  tutorial: <BookOpen className="w-5 h-5" />,
  tool: <Wrench className="w-5 h-5" />,
  expert: <User className="w-5 h-5" />,
  article: <FileText className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
}

export function ResourceCard({ resource, userId, className }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Check if it's an internal article (starts with /learn/)
  const isInternalArticle = resource.url.startsWith('/learn/')

  // Check if current user owns this resource
  const isOwner = userId && resource.user_id === userId

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  return (
    <a
      href={resource.url}
      target={isInternalArticle ? undefined : '_blank'}
      rel={isInternalArticle ? undefined : 'noopener noreferrer'}
      className={cn('block', className)}
    >
      <Card className="h-full">
        <Card.Content>
          <div className="flex gap-4">
            {/* Thumbnail or Icon */}
            {resource.thumbnail_url && !imageError ? (
              <div className="w-20 h-20 border-2 border-black shadow-md overflow-hidden flex-shrink-0 rounded bg-white flex items-center justify-center p-2">
                <Image
                  src={resource.thumbnail_url}
                  alt={resource.title}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  unoptimized={resource.thumbnail_url?.includes('google.com/s2/favicons')}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-black shadow-md bg-primary flex items-center justify-center flex-shrink-0">
                {categoryIcons[resource.category]}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Text as="h3" className="line-clamp-1">
                  {resource.title}
                </Text>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!isInternalArticle && (
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  )}
                  {isOwner && (
                    <>
                      <Link
                        href={`/dashboard/resources/${resource.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" title="Edit Resource" className="h-7 w-7">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={deleting}
                        title="Delete Resource"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {resource.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant={resource.is_featured ? 'surface' : 'default'} size="sm">
                  {resource.category}
                </Badge>
                {resource.is_featured && (
                  <Badge variant="surface" size="sm">
                    Featured
                  </Badge>
                )}
                {resource.ai_tool_type && (
                  <Badge variant="default" size="sm" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Tool
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
                {resource.difficulty && (
                  <Badge variant="default" size="sm" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                  </Badge>
                )}
              </div>

              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{resource.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    </a>
  )
}

export function ResourceCardSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      <Card.Content>
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-muted flex-shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-3/4 bg-muted mb-2" />
            <div className="h-4 w-full bg-muted mb-1" />
            <div className="h-4 w-2/3 bg-muted mb-3" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted" />
              <div className="h-5 w-16 bg-muted" />
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
