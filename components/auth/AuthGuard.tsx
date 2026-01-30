'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, isLoading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.push(redirectTo)
    }
  }, [isInitialized, isLoading, user, router, redirectTo])

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}
