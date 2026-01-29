'use client'

import { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface UpvoteButtonProps {
  projectId: string
  initialCount: number
  initialUpvoted?: boolean
  userId?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function UpvoteButton({
  projectId,
  initialCount,
  initialUpvoted = false,
  userId,
  size = 'md',
  className,
}: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [upvoted, setUpvoted] = useState(initialUpvoted)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpvote = async () => {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      if (upvoted) {
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId)

        if (!error) {
          setCount((prev) => prev - 1)
          setUpvoted(false)
        }
      } else {
        const { error } = await supabase
          .from('upvotes')
          .insert({ user_id: userId, project_id: projectId })

        if (!error) {
          setCount((prev) => prev + 1)
          setUpvoted(true)
        }
      }
    } catch (error) {
      console.error('Upvote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeStyles = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-14 text-sm',
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={cn(
        'flex flex-col items-center justify-center flex-shrink-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeStyles[size],
        className
      )}
    >
      <div className={cn(
        'w-full h-full flex flex-col items-center justify-center p-0 border-2 border-black rounded shadow-md bg-card box-border',
        upvoted && 'bg-primary text-primary-foreground'
      )}>
        <ChevronUp className={cn('w-4 h-4', size === 'sm' && 'w-3 h-3')} />
        <span className="font-head font-semibold tabular-nums">{count}</span>
      </div>
    </button>
  )
}
