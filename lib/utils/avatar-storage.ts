import { createClient } from '@supabase/supabase-js'

/**
 * Create an admin client with service role key for storage operations
 * This bypasses RLS policies
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration for admin client')
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Download avatar from URL and save to Supabase storage
 * Returns the public URL of the saved image
 */
export async function downloadAndSaveAvatar(
  imageUrl: string,
  userId: string,
  twitterHandle: string
): Promise<string | null> {
  try {
    // Use admin client for storage operations (bypasses RLS)
    const supabase = createAdminClient()
    if (!supabase) {
      console.error('Failed to create admin client for avatar storage')
      return null
    }

    // Download the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`Failed to download avatar from ${imageUrl}: ${imageResponse.status}`)
      return null
    }

    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()
    
    // Determine file extension from content type or URL
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    let extension = 'jpg'
    if (contentType.includes('png')) extension = 'png'
    if (contentType.includes('gif')) extension = 'gif'
    if (contentType.includes('webp')) extension = 'webp'
    if (contentType.includes('svg')) extension = 'svg'

    // Create filename: {userId}/{twitterHandle}.{ext} (within avatars bucket)
    const cleanHandle = twitterHandle.replace('@', '').toLowerCase()
    const filename = `${userId}/${cleanHandle}.${extension}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filename, imageBuffer, {
        contentType,
        upsert: true, // Overwrite if exists
      })

    if (error) {
      console.error('Error uploading avatar to Supabase:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)

    if (urlData?.publicUrl) {
      console.log(`Avatar saved to Supabase: ${urlData.publicUrl}`)
      return urlData.publicUrl
    }

    return null
  } catch (error) {
    console.error('Error downloading and saving avatar:', error)
    return null
  }
}

/**
 * Get avatar from Supabase storage if it exists
 */
export async function getAvatarFromStorage(
  userId: string,
  twitterHandle: string
): Promise<string | null> {
  try {
    // Use admin client for consistency (could also use server client for reads)
    const supabase = createAdminClient()
    if (!supabase) {
      console.error('Failed to create admin client for avatar storage')
      return null
    }
    const cleanHandle = twitterHandle.replace('@', '').toLowerCase()

    // Try different extensions
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

    for (const ext of extensions) {
      const filename = `${userId}/${cleanHandle}.${ext}`
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filename)

      // Check if file exists by trying to fetch it
      if (data?.publicUrl) {
        try {
          const checkResponse = await fetch(data.publicUrl, { method: 'HEAD' })
          if (checkResponse.ok) {
            return data.publicUrl
          }
        } catch {
          // Continue to next extension
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error checking avatar in storage:', error)
    return null
  }
}
