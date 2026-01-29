'use client'

import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Create a singleton client instance
  if (typeof window === 'undefined') {
    // Server-side: return a basic client (shouldn't happen in client components)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Ensure session is refreshed on client creation
    client.auth.getSession().catch(() => {
      // Silently fail if session can't be retrieved
    })
  }
  
  return client
}
