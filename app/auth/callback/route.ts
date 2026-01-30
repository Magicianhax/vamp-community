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
      // After successful OAuth, ensure user exists in users table
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Check if user exists in users table
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, twitter_handle')
            .eq('id', user.id)
            .single()

          // If user doesn't exist, create them (trigger might have failed)
          if (!existingUser) {
            console.log('User not found in users table, creating profile...')
            const twitterUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username
            const twitterName = user.user_metadata?.name || user.user_metadata?.full_name
            const twitterAvatar = user.user_metadata?.avatar_url
            
            const username = (twitterUsername || 
                            user.email?.split('@')[0] || 
                            `user_${user.id.slice(0, 8)}`).toLowerCase()

            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                username: username, // Already lowercase
                display_name: twitterName || username,
                avatar_url: twitterAvatar || null,
                twitter_handle: twitterUsername || null,
              })

            if (createError) {
              console.error('Error creating user profile:', createError)
            } else {
              console.log('User profile created successfully')
            }
          }

          // Get user profile to check for twitter_handle (now it should exist)
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

      // Redirect through loading page to ensure client-side auth state is initialized
      const loadingUrl = new URL('/auth/loading', origin)
      loadingUrl.searchParams.set('next', next)
      return NextResponse.redirect(loadingUrl)
    }
  }

  return NextResponse.redirect(new URL('/login', origin))
}
