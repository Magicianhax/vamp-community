import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('twitter_handle')
      .eq('id', authUser.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (!userProfile.twitter_handle) {
      return NextResponse.json(
        { error: 'No Twitter handle found' },
        { status: 400 }
      )
    }

    // Fetch fresh avatar from X API
    const bearerToken = process.env.TWITTER_BEARER_TOKEN
    if (!bearerToken) {
      return NextResponse.json(
        { error: 'Twitter API credentials not configured' },
        { status: 500 }
      )
    }

    const cleanHandle = userProfile.twitter_handle.replace('@', '')
    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Twitter API' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.data?.profile_image_url) {
      // Get higher resolution image
      const imageUrl = data.data.profile_image_url.replace('_normal', '_400x400')
      
      // Update user's avatar_url in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: imageUrl })
        .eq('id', authUser.id)

      if (updateError) {
        console.error('Error updating avatar_url:', updateError)
        return NextResponse.json(
          { error: 'Failed to update avatar' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        imageUrl 
      })
    }

    return NextResponse.json(
      { error: 'Profile image not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error refreshing avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
