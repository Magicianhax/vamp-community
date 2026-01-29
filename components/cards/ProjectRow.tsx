import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, PencilLine } from 'lucide-react'
import { Card } from '@/components/retroui/Card'
import { ProjectVoteButtons } from '@/components/ui'
import type { Project } from '@/types'

export interface ProjectRowProps {
  project: Project
  rank: number
  userId?: string | null
}

export function ProjectRow({ project, rank, userId }: ProjectRowProps) {
  const tagsDisplay = project.tags?.length
    ? project.tags.slice(0, 3).join(' • ')
    : null

  return (
    <Card className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 w-full box-border overflow-hidden">
      {/* Rank */}
      <span className="w-5 sm:w-8 flex-shrink-0 text-sm sm:text-lg font-head font-bold tabular-nums text-muted-foreground sm:text-foreground">
        {rank}.
      </span>

      {/* Icon */}
      <div className="flex-shrink-0">
        {project.thumbnail_url ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md overflow-hidden">
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md bg-primary flex items-center justify-center">
            <span className="text-base sm:text-lg font-head font-bold text-primary-foreground">{project.title[0]}</span>
          </div>
        )}
      </div>

      {/* Title, description, tags */}
      <div className="flex-1 min-w-0">
        <Link href={`/projects/${project.id}`}>
          <h3 className="font-head font-semibold text-sm sm:text-base line-clamp-1">
            {project.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
          {project.tagline}
        </p>
        {tagsDisplay && (
          <p className="hidden sm:flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <PencilLine className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{tagsDisplay}</span>
          </p>
        )}
      </div>

      {/* Count boxes: upvote, downvote, comments */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ProjectVoteButtons
          projectId={project.id}
          initialUpvoteCount={project.upvote_count}
          initialDownvoteCount={project.downvote_count ?? 0}
          initialUserVote={project.has_upvoted ? 'upvote' : project.has_downvoted ? 'downvote' : null}
          userId={userId}
          size="sm"
        />
        <Link href={`/projects/${project.id}#comments`} className="hidden sm:flex flex-shrink-0">
          <div className="flex flex-col items-center justify-center w-10 h-10 p-0 border-2 border-black rounded shadow-md bg-card box-border">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium tabular-nums">
              {project.comment_count ?? 0}
            </span>
          </div>
        </Link>
      </div>
    </Card>
  )
}
