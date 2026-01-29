'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export interface DownvoteButtonProps {
  projectId: string
  initialCount: number
  initialDownvoted?: boolean
  userId?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function DownvoteButton({
  projectId,
  initialCount,
  initialDownvoted = false,
  userId,
  size = 'md',
  className,
}: DownvoteButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [downvoted, setDownvoted] = useState(initialDownvoted)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownvote = async () => {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Verify user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || user.id !== userId) {
        console.error('Authentication error:', authError)
        alert('Authentication failed. Please sign in again.')
        setIsLoading(false)
        return
      }

      if (downvoted) {
        const { error } = await supabase
          .from('downvotes')
          .delete()
          .eq('user_id', userId)
          .eq('project_id', projectId)

        if (error) {
          console.error('Error removing downvote:', error)
          alert('Failed to remove downvote. Please try again.')
        } else {
          setCount((prev) => prev - 1)
          setDownvoted(false)
        }
      } else {
        const { error } = await supabase
          .from('downvotes')
          .insert({ user_id: userId, project_id: projectId })

        if (error) {
          console.error('Error adding downvote:', error)
          alert(error.message || 'Failed to downvote. Please try again.')
        } else {
          setCount((prev) => prev + 1)
          setDownvoted(true)
        }
      }
    } catch (error) {
      console.error('Unexpected downvote error:', error)
      alert('An unexpected error occurred. Please try again.')
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
      onClick={handleDownvote}
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
        downvoted && 'bg-muted'
      )}>
        <ChevronDown className={cn('w-4 h-4', size === 'sm' && 'w-3 h-3')} />
        <span className="font-head font-semibold tabular-nums">{count}</span>
      </div>
    </button>
  )
}
