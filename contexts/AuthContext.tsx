'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as UserType } from '@/types'
import type { User as AuthUser, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: UserType | null
  authUser: AuthUser | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabaseRef = useRef(createClient())
  const fetchingRef = useRef(false)

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserType | null> => {
    const supabase = supabaseRef.current

    try {
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // User doesn't exist in users table, create them
        const authData = authUser || (await supabase.auth.getUser()).data.user
        if (authData) {
          const twitterUsername = authData.user_metadata?.user_name || authData.user_metadata?.preferred_username
          const twitterName = authData.user_metadata?.name || authData.user_metadata?.full_name
          const twitterAvatar = authData.user_metadata?.avatar_url

          const username = (twitterUsername ||
                          authData.email?.split('@')[0] ||
                          `user_${authData.id.slice(0, 8)}`).toLowerCase()

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: authData.id,
              email: authData.email,
              username: username,
              display_name: twitterName || username,
              avatar_url: twitterAvatar || null,
              twitter_handle: twitterUsername || null,
            })
            .select()
            .single()

          if (!createError && newUser) {
            return newUser as UserType
          }
        }
        return null
      }

      return data as UserType
    } catch (err) {
      console.error('AuthContext: Error fetching user profile:', err)
      return null
    }
  }, [authUser])

  const refreshUser = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const supabase = supabaseRef.current
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession?.user) {
        setSession(currentSession)
        setAuthUser(currentSession.user)
        const profile = await fetchUserProfile(currentSession.user.id)
        setUser(profile)
      } else {
        setSession(null)
        setAuthUser(null)
        setUser(null)
      }
    } catch (err) {
      console.error('AuthContext: Error refreshing user:', err)
    } finally {
      fetchingRef.current = false
    }
  }, [fetchUserProfile])

  const signOut = useCallback(async () => {
    const supabase = supabaseRef.current
    setIsLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setAuthUser(null)
    setSession(null)
    setIsLoading(false)
    window.location.href = '/'
  }, [])

  useEffect(() => {
    const supabase = supabaseRef.current
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (!mounted) return

        if (initialSession?.user) {
          setSession(initialSession)
          setAuthUser(initialSession.user)
          const profile = await fetchUserProfile(initialSession.user.id)
          if (mounted) setUser(profile)
        }
      } catch (err) {
        console.error('AuthContext: Error initializing auth:', err)
      } finally {
        if (mounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        console.log('AuthContext: Auth state changed:', event)

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            setSession(newSession)
            setAuthUser(newSession.user)
            const profile = await fetchUserProfile(newSession.user.id)
            if (mounted) setUser(profile)
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setAuthUser(null)
          setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        session,
        isLoading,
        isInitialized,
        signOut,
        refreshUser,
      }}
    >
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
