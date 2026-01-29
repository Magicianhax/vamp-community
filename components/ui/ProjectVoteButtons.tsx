'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface ProjectVoteButtonsProps {
  projectId: string
  initialUpvoteCount: number
  initialDownvoteCount: number
  initialUserVote?: 'upvote' | 'downvote' | null
  userId?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function ProjectVoteButtons({
  projectId,
  initialUpvoteCount,
  initialDownvoteCount,
  initialUserVote = null,
  userId,
  size = 'md',
  className,
}: ProjectVoteButtonsProps) {
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount)
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        window.location.href = '/login'
        return
      }

      if (session.user.id !== userId) {
        alert('Authentication failed. Please sign in again.')
        return
      }

      const upvotesTable = 'upvotes'
      const downvotesTable = 'downvotes'

      // If clicking the same vote type, remove it
      if (userVote === voteType) {
        const table = voteType === 'upvote' ? upvotesTable : downvotesTable
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId)

        if (!error) {
          if (voteType === 'upvote') {
            setUpvoteCount(prev => Math.max(0, prev - 1))
          } else {
            setDownvoteCount(prev => Math.max(0, prev - 1))
          }
          setUserVote(null)
        }
      } else {
        // Remove opposite vote first if exists
        if (userVote) {
          const oppositeTable = userVote === 'upvote' ? upvotesTable : downvotesTable
          await supabase
            .from(oppositeTable)
            .delete()
            .eq('user_id', userId)
            .eq('project_id', projectId)

          // Update count for removed vote
          if (userVote === 'upvote') {
            setUpvoteCount(prev => Math.max(0, prev - 1))
          } else {
            setDownvoteCount(prev => Math.max(0, prev - 1))
          }
        }

        // Add new vote
        const table = voteType === 'upvote' ? upvotesTable : downvotesTable
        const { error } = await supabase
          .from(table)
          .insert({ user_id: userId, project_id: projectId })

        if (!error) {
          if (voteType === 'upvote') {
            setUpvoteCount(prev => prev + 1)
          } else {
            setDownvoteCount(prev => prev + 1)
          }
          setUserVote(voteType)
        }
      }
    } catch (error) {
      console.error('Vote error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-0.5 sm:gap-1', className)}>
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={cn(
          'flex flex-col items-center justify-center border-2 border-black rounded shadow-md transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-8 h-8 sm:w-10 sm:h-10',
          userVote === 'upvote'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card hover:bg-muted'
        )}
      >
        <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="font-head font-semibold tabular-nums text-[10px] sm:text-xs leading-none">{upvoteCount}</span>
      </button>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={cn(
          'flex flex-col items-center justify-center border-2 border-black rounded shadow-md transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-8 h-8 sm:w-10 sm:h-10',
          userVote === 'downvote'
            ? 'bg-red-500 text-white'
            : 'bg-card hover:bg-muted'
        )}
      >
        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="font-head font-semibold tabular-nums text-[10px] sm:text-xs leading-none">{downvoteCount}</span>
      </button>
    </div>
  )
}
