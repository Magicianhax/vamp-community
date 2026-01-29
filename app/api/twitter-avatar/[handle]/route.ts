import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvatarFromStorage, downloadAndSaveAvatar } from '@/lib/utils/avatar-storage'

// Helper function to validate if an image URL actually works
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return response.ok && response.headers.get('content-type')?.startsWith('image/') === true
  } catch {
    return false
  }
}

// Try to get image from alternative sources (fallback methods)
async function getImageFromAlternatives(handle: string): Promise<string | null> {
  const cleanHandle = handle.replace('@', '')
  
  // Method 1: Try using api.dicebear.com with initials as fallback
  // This generates a nice avatar based on the username
  try {
    const dicebearUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanHandle)}&size=400`
    console.log(`Using dicebear.com fallback for ${cleanHandle}`)
    return dicebearUrl
  } catch (error) {
    console.error('dicebear.com failed:', error)
  }

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  const handle = params.handle

  if (!handle) {
    return NextResponse.json({ error: 'Twitter handle is required' }, { status: 400 })
  }

  // Remove @ if present
  const cleanHandle = handle.replace('@', '')

  try {
    // Method 0: Check Supabase storage first (if we have userId from query param)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      const storedAvatar = await getAvatarFromStorage(userId, cleanHandle)
      if (storedAvatar) {
        console.log(`Using stored avatar from Supabase for ${cleanHandle}`)
        return NextResponse.json({ imageUrl: storedAvatar })
      }
    }

    // Method 1: Try unavatar.io/x/{handle} (correct format per user)
    const unavatarUrl = `https://unavatar.io/x/${cleanHandle}`
    try {
      // Quick check to see if it returns an image
      const response = await fetch(unavatarUrl, { 
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      })
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.startsWith('image/')) {
          console.log(`Using unavatar.io/x for ${cleanHandle}`)
          
          // If we have userId, download and save to Supabase for future use
          if (userId) {
            // Try to save to storage, but don't block the response
            downloadAndSaveAvatar(unavatarUrl, userId, cleanHandle)
              .then(async savedUrl => {
                if (savedUrl) {
                  console.log(`Avatar saved to Supabase storage for ${cleanHandle}`)
                  // Update user's avatar_url in database
                  try {
                    const supabase = await createClient()
                    await supabase
                      .from('users')
                      .update({ avatar_url: savedUrl })
                      .eq('id', userId)
                    console.log(`Updated avatar_url in database for user ${userId}`)
                  } catch (err) {
                    console.error('Error updating avatar_url:', err)
                  }
                }
              })
              .catch(err => {
                console.error('Background avatar save failed:', err)
              })
          }
          
          return NextResponse.json({ imageUrl: unavatarUrl })
        }
      }
      // If HEAD fails, still try it (unavatar.io is usually reliable)
      console.log(`Using unavatar.io/x for ${cleanHandle} (fallback)`)
      
      // If we have userId, download and save to Supabase for future use
      if (userId) {
        downloadAndSaveAvatar(unavatarUrl, userId, cleanHandle)
          .then(async savedUrl => {
            if (savedUrl) {
              console.log(`Avatar saved to Supabase storage for ${cleanHandle}`)
              // Update user's avatar_url in database
              try {
                const supabase = await createClient()
                await supabase
                  .from('users')
                  .update({ avatar_url: savedUrl })
                  .eq('id', userId)
                console.log(`Updated avatar_url in database for user ${userId}`)
              } catch (err) {
                console.error('Error updating avatar_url:', err)
              }
            }
          })
          .catch(err => {
            console.error('Background avatar save failed:', err)
          })
      }
      
      return NextResponse.json({ imageUrl: unavatarUrl })
    } catch (unavatarError) {
      console.warn('unavatar.io/x check failed, trying alternatives:', unavatarError)
      // Continue to other methods
    }

    // Method 2: Try X API v2 (if bearer token is available)
    const bearerToken = process.env.TWITTER_BEARER_TOKEN

    if (bearerToken) {
      const apiUrl = `https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=profile_image_url`
      console.log(`Trying Twitter API for handle: ${cleanHandle}`)

      try {
        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()

          if (data.data?.profile_image_url) {
            // Try different resolutions
            const resolutions = ['_400x400', '_200x200', '_bigger', '_normal', '']
            
            for (const resolution of resolutions) {
              let imageUrl = data.data.profile_image_url
              if (resolution === '') {
                // Remove _normal to get original
                imageUrl = imageUrl.replace('_normal', '')
              } else {
                imageUrl = imageUrl.replace('_normal', resolution)
              }

              // Validate the URL actually works
              const isValid = await validateImageUrl(imageUrl)
              if (isValid) {
                console.log(`Successfully fetched Twitter avatar: ${imageUrl}`)
                return NextResponse.json({ imageUrl })
              }
            }

            // If all resolutions fail, try the original URL anyway
            const originalUrl = data.data.profile_image_url.replace('_normal', '')
            console.log(`Using original Twitter URL (not validated): ${originalUrl}`)
            return NextResponse.json({ imageUrl: originalUrl })
          }
        } else {
          console.warn(`Twitter API returned ${response.status}, trying other alternatives...`)
        }
      } catch (apiError) {
        console.error('Twitter API error:', apiError)
        // Continue to alternatives
      }
    }

    // Method 3: Try other alternative services
    const alternativeUrl = await getImageFromAlternatives(cleanHandle)
    if (alternativeUrl) {
      return NextResponse.json({ imageUrl: alternativeUrl })
    }

    // Method 3: Final fallback - use UI Avatars or similar
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanHandle)}&size=400&background=random&bold=true`
    console.log(`Using UI Avatars fallback for ${cleanHandle}`)
    return NextResponse.json({ imageUrl: fallbackUrl })

  } catch (error) {
    console.error('Error fetching Twitter avatar:', error)
    // Even on error, ALWAYS return a fallback - never return an error
    const cleanHandle = handle.replace('@', '')
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanHandle)}&size=400&background=random&bold=true`
    return NextResponse.json({ imageUrl: fallbackUrl })
  }
}
