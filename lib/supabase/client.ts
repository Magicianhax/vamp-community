'use client'

import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Get environment variables - these should be available at build time for client components
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = 'Missing Supabase environment variables. Please check your Vercel environment variables.'
    console.error(errorMsg, {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
    })
    // Don't throw - return a client that will fail gracefully
    // This allows the app to load and show proper error messages
  }

  // Create a singleton client instance
  if (typeof window === 'undefined') {
    // Server-side: return a basic client (shouldn't happen in client components)
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  if (!client) {
    try {
      client = createBrowserClient(supabaseUrl, supabaseAnonKey)
      
      // Ensure session is refreshed on client creation
      client.auth.getSession().catch((error) => {
        console.error('Error getting session on client init:', error)
      })
    } catch (error) {
      console.error('Error creating Supabase client:', error)
      throw error
    }
  }
  
  return client
}
