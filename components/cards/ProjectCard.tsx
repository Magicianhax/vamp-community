import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Github } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { UpvoteButton, DeleteProjectButton } from '@/components/ui'
import type { Project } from '@/types'

export interface ProjectCardProps {
  project: Project
  userId?: string | null
  showStatus?: boolean
  className?: string
}

export function ProjectCard({ project, userId, showStatus = false, className }: ProjectCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex gap-4">
        {/* Upvote Button */}
        <UpvoteButton
          projectId={project.id}
          initialCount={project.upvote_count}
          initialUpvoted={project.has_upvoted}
          userId={userId}
          size="md"
        />

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {project.thumbnail_url ? (
            <div className="w-20 h-20 border-2 border-black shadow-md overflow-hidden">
              <Image
                src={project.thumbnail_url}
                alt={project.title}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 border-2 border-black shadow-md bg-primary flex items-center justify-center">
              <span className="text-2xl font-head font-bold text-primary-foreground">{project.title[0]}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/projects/${project.id}`}>
                <Text as="h3" className="font-head font-semibold line-clamp-1">
                  {project.title}
                </Text>
              </Link>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {project.tagline}
              </p>
            </div>

            {showStatus && (
              <Badge
                variant={
                  project.status === 'featured'
                    ? 'surface'
                    : project.status === 'approved'
                    ? 'default'
                    : 'default'
                }
                size="sm"
              >
                {project.status}
              </Badge>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm" variant="default">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge size="sm" variant="default">+{project.tags.length - 3}</Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {project.user && (
                <>
                  <TwitterAvatar
                    className="w-8 h-8"
                    src={project.user.avatar_url}
                    alt={project.user.display_name || project.user.username}
                    twitterHandle={project.user.twitter_handle}
                    userId={project.user.id}
                  />
                  <Link
                    href={`/u/${project.user.username}`}
                    className="text-sm text-muted-foreground"
                  >
                    {project.user.display_name || project.user.username}
                  </Link>
                </>
              )}
              <span className="text-muted-foreground text-sm">
                {formatRelativeTime(project.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View Demo"
              >
                <Button variant="ghost" size="icon">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View Source"
              >
                <Button variant="ghost" size="icon">
                  <Github className="w-4 h-4" />
                </Button>
              </a>
              {userId && project.user_id === userId && (
                <DeleteProjectButton
                  projectId={project.id}
                  projectTitle={project.title}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ProjectCardSkeleton() {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-16 bg-muted" />
        <div className="w-20 h-20 bg-muted" />
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-muted" />
          <div className="h-4 w-full bg-muted mt-2" />
          <div className="flex gap-2 mt-3">
            <div className="h-5 w-12 bg-muted" />
            <div className="h-5 w-12 bg-muted" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 bg-muted" />
            <div className="h-4 w-24 bg-muted" />
          </div>
        </div>
      </div>
    </Card>
  )
}
