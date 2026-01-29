import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { downloadAndSaveAvatar } from '@/lib/utils/avatar-storage'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // After successful OAuth, refresh the avatar from X API in the background
      // This ensures we have a fresh, high-resolution image stored
      // We'll do this server-side to ensure proper authentication
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get user profile to check for twitter_handle
          const { data: userProfile } = await supabase
            .from('users')
            .select('twitter_handle')
            .eq('id', user.id)
            .single()

          if (userProfile?.twitter_handle) {
            // Fetch avatar from unavatar.io/x and save to Supabase storage
            const cleanHandle = userProfile.twitter_handle.replace('@', '')
            const unavatarUrl = `https://unavatar.io/x/${cleanHandle}`
            
            try {
              // Download and save to Supabase storage
              const savedUrl = await downloadAndSaveAvatar(unavatarUrl, user.id, cleanHandle)
              
              if (savedUrl) {
                // Update user's avatar_url in database with Supabase storage URL
                await supabase
                  .from('users')
                  .update({ avatar_url: savedUrl })
                  .eq('id', user.id)
                console.log(`Avatar saved to Supabase storage for user ${user.id}`)
              } else {
                // If save fails, still update with unavatar.io URL
                await supabase
                  .from('users')
                  .update({ avatar_url: unavatarUrl })
                  .eq('id', user.id)
              }
            } catch (err) {
              // Silently fail - the TwitterAvatar component will handle fetching
              console.error('Error downloading avatar on signup:', err)
            }
          }
        }
      } catch (err) {
        // Silently fail - not critical, TwitterAvatar component will handle it
        console.error('Error in avatar refresh on signup:', err)
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/login', origin))
}
