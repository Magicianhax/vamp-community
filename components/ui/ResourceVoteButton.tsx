'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface ResourceVoteButtonProps {
  resourceId: string
  initialUpvotes: number
  initialDownvotes: number
  initialUserVote?: 'upvote' | 'downvote' | null
  userId?: string | null
  className?: string
}

export function ResourceVoteButton({
  resourceId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
  userId,
  className,
}: ResourceVoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
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

      // First get session to ensure auth state is initialized
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        if (sessionError) console.error('ResourceVoteButton: Session error:', sessionError)
        window.location.href = '/login'
        setIsLoading(false)
        return
      }

      // Use session.user.id directly for reliability
      if (!userId || session.user.id !== userId) {
        console.error('ResourceVoteButton: User ID mismatch or missing:', session.user.id, 'vs', userId)
        alert('Authentication failed. Please sign in again.')
        setIsLoading(false)
        return
      }

      // If clicking the same vote, remove it
      if (userVote === voteType) {
        const { error } = await supabase
          .from('resource_votes')
          .delete()
          .eq('user_id', userId)
          .eq('resource_id', resourceId)

        if (error) {
          console.error('Error removing vote:', error)
          alert('Failed to remove vote. Please try again.')
        } else {
          if (voteType === 'upvote') {
            setUpvotes((prev) => Math.max(0, prev - 1))
          } else {
            setDownvotes((prev) => Math.max(0, prev - 1))
          }
          setUserVote(null)
        }
      } else {
        // Remove existing vote if any
        if (userVote) {
          const { error: deleteError } = await supabase
            .from('resource_votes')
            .delete()
            .eq('user_id', userId)
            .eq('resource_id', resourceId)

          if (!deleteError) {
            if (userVote === 'upvote') {
              setUpvotes((prev) => Math.max(0, prev - 1))
            } else {
              setDownvotes((prev) => Math.max(0, prev - 1))
            }
          }
        }

        // Add new vote
        const { error } = await supabase
          .from('resource_votes')
          .insert({ user_id: userId, resource_id: resourceId, vote_type: voteType })

        if (error) {
          console.error('Error adding vote:', error)
          alert(error.message || 'Failed to vote. Please try again.')
        } else {
          if (voteType === 'upvote') {
            setUpvotes((prev) => prev + 1)
          } else {
            setDownvotes((prev) => prev + 1)
          }
          setUserVote(voteType)
        }
      }
    } catch (error) {
      console.error('Unexpected vote error:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const netScore = upvotes - downvotes

  return (
    <div className={cn('flex flex-col items-center gap-0.5 sm:gap-1', className)}>
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={cn(
          'flex items-center justify-center border-2 border-black rounded shadow-md transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-8 h-8 sm:w-10 sm:h-10',
          userVote === 'upvote'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card hover:bg-muted'
        )}
      >
        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <span className={cn(
        'text-xs sm:text-sm font-head font-semibold tabular-nums min-w-[2ch] text-center',
        netScore > 0 && 'text-green-600',
        netScore < 0 && 'text-red-600'
      )}>
        {netScore}
      </span>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={cn(
          'flex items-center justify-center border-2 border-black rounded shadow-md transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'w-8 h-8 sm:w-10 sm:h-10',
          userVote === 'downvote'
            ? 'bg-red-500 text-white'
            : 'bg-card hover:bg-muted'
        )}
      >
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  )
}
