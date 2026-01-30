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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initializedRef = useRef(false)
  const supabase = useRef(createClient()).current

  // Fetch user profile from users table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, will be created by trigger or on first action
        return null
      }

      return data as UserType
    } catch (err) {
      console.error('AuthContext: Error fetching profile:', err)
      return null
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession?.user) {
        setSession(currentSession)
        const profile = await fetchProfile(currentSession.user.id)
        setUser(profile)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (err) {
      console.error('AuthContext: Error refreshing:', err)
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    window.location.href = '/'
  }, [supabase])

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initializedRef.current) return
    initializedRef.current = true

    let mounted = true

    const init = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (!mounted) return

        if (initialSession?.user) {
          setSession(initialSession)
          const profile = await fetchProfile(initialSession.user.id)
          if (mounted) setUser(profile)
        }
      } catch (err) {
        console.error('AuthContext: Init error:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    init()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && newSession?.user) {
          setSession(newSession)
          const profile = await fetchProfile(newSession.user.id)
          if (mounted) setUser(profile)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty deps - only run once

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, refreshUser }}>
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
