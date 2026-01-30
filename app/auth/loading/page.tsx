'use client'

import { Suspense } from 'react'
import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function AuthLoadingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, checkSession } = useAuth()
  const redirectTo = searchParams.get('next') || '/dashboard'
  const hasRedirected = useRef(false)
  const checkCount = useRef(0)

  useEffect(() => {
    if (hasRedirected.current) return

    // If we already have a user, redirect immediately
    if (user) {
      hasRedirected.current = true
      router.replace(redirectTo)
      return
    }

    // If still loading initially, wait
    if (isLoading) return

    // Aggressively check for session after OAuth
    const checkAuth = async () => {
      checkCount.current++

      const hasSession = await checkSession()

      if (hasSession && !hasRedirected.current) {
        hasRedirected.current = true
        router.replace(redirectTo)
        return
      }

      // After 5 attempts (2.5 seconds), give up and go to login
      if (checkCount.current >= 5 && !hasRedirected.current) {
        hasRedirected.current = true
        router.replace('/login')
        return
      }

      // Keep trying every 500ms
      if (checkCount.current < 5) {
        setTimeout(checkAuth, 500)
      }
    }

    // Start checking after a small delay to let cookies settle
    const initialDelay = setTimeout(checkAuth, 100)

    return () => clearTimeout(initialDelay)
  }, [user, isLoading, checkSession, router, redirectTo])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text-secondary">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthLoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-text-secondary">Signing you in...</p>
          </div>
        </div>
      }
    >
      <AuthLoadingContent />
    </Suspense>
  )
}
