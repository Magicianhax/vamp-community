'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as UserType } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: UserType | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  checkSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useRef(createClient()).current
  const profileCache = useRef<Map<string, UserType>>(new Map())

  // Fetch user profile with caching
  const fetchProfile = useCallback(async (userId: string): Promise<UserType | null> => {
    // Check cache first
    const cached = profileCache.current.get(userId)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist yet - will be created on first action
          return null
        }
        console.error('Profile fetch error:', error)
        return null
      }

      if (data) {
        profileCache.current.set(userId, data as UserType)
        return data as UserType
      }
      return null
    } catch (err) {
      console.error('AuthContext: Profile error:', err)
      return null
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession?.user) {
        setSession(currentSession)
        // Clear cache to force fresh fetch
        profileCache.current.delete(currentSession.user.id)
        const profile = await fetchProfile(currentSession.user.id)
        setUser(profile)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (err) {
      console.error('AuthContext: Refresh error:', err)
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    profileCache.current.clear()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    window.location.href = '/'
  }, [supabase])

  // Manual session check - useful after OAuth redirect
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession?.user) {
        setSession(currentSession)
        const profile = await fetchProfile(currentSession.user.id)
        setUser(profile)
        setIsLoading(false)
        return true
      }
      return false
    } catch (err) {
      console.error('AuthContext: Check session error:', err)
      return false
    }
  }, [supabase, fetchProfile])

  useEffect(() => {
    let mounted = true
    let hasInitialized = false

    // Use onAuthStateChange as the primary source of truth
    // It fires INITIAL_SESSION on page load which is more reliable
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        console.log('Auth event:', event, newSession?.user?.id)

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          hasInitialized = true
          if (newSession?.user) {
            setSession(newSession)
            // Use setTimeout to avoid Supabase deadlock issues
            setTimeout(async () => {
              if (!mounted) return
              const profile = await fetchProfile(newSession.user.id)
              if (mounted) {
                setUser(profile)
                setIsLoading(false)
              }
            }, 0)
          } else {
            setSession(null)
            setUser(null)
            setIsLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          hasInitialized = true
          profileCache.current.clear()
          setSession(null)
          setUser(null)
          setIsLoading(false)
        }
      }
    )

    // Fallback: if no auth event fires within 1 second, check manually
    const fallbackTimeout = setTimeout(async () => {
      if (!mounted || hasInitialized) return

      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession()
        if (!mounted) return

        if (existingSession?.user) {
          setSession(existingSession)
          const profile = await fetchProfile(existingSession.user.id)
          if (mounted) setUser(profile)
        }
      } catch (err) {
        console.error('Fallback auth check error:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }, 1000)

    return () => {
      mounted = false
      clearTimeout(fallbackTimeout)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, refreshUser, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
