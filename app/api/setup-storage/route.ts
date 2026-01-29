import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API Route to setup Supabase Storage Bucket
 * This can be called once to initialize the avatars bucket
 * 
 * Usage: POST /api/setup-storage
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json(
        { error: 'Failed to list buckets', details: listError.message },
        { status: 500 }
      )
    }

    const avatarsBucket = buckets.find(b => b.name === 'avatars')

    if (avatarsBucket) {
      return NextResponse.json({
        success: true,
        message: 'Bucket "avatars" already exists',
        bucket: avatarsBucket
      })
    }

    // Create the bucket
    const { data: bucket, error: createError } = await supabase.storage.createBucket('avatars', {
      public: true, // Make bucket public so images can be accessed
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    })

    if (createError) {
      console.error('Error creating bucket:', createError)
      return NextResponse.json(
        { error: 'Failed to create bucket', details: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Bucket "avatars" created successfully',
      bucket,
      note: 'Please run the SQL migration file (supabase/migrations/create_avatars_storage.sql) in your Supabase SQL Editor to set up storage policies.'
    })

  } catch (error) {
    console.error('Error setting up storage:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
