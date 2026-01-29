'use client'

import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    throw new Error('Supabase configuration is missing. Please check your environment variables.')
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
