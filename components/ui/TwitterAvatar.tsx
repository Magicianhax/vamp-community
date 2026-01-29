'use client'

import * as React from 'react'
import { Avatar } from '@/components/retroui/Avatar'

export interface TwitterAvatarProps {
  src?: string | null
  alt: string
  twitterHandle?: string | null
  className?: string
  userId?: string | null
}

export function TwitterAvatar({
  src,
  alt,
  twitterHandle,
  className,
  userId,
}: TwitterAvatarProps) {
  // Check if src is a Twitter URL that might be broken - NEVER use these directly
  const isTwitterUrl = src?.includes('pbs.twimg.com') || src?.includes('abs.twimg.com')

  // Check if src is a valid non-Twitter URL (like Supabase storage)
  const hasValidSrc = src && !isTwitterUrl

  // Only fetch from API if:
  // 1. src is a broken Twitter URL, OR
  // 2. src is missing AND we have a twitter handle to fetch
  // If we have a valid Supabase URL, use it directly
  const shouldFetchFromAPI = isTwitterUrl || (!hasValidSrc && twitterHandle)

  const [imageSrc, setImageSrc] = React.useState<string | undefined>(
    hasValidSrc ? src : undefined
  )
  const [isFetching, setIsFetching] = React.useState(shouldFetchFromAPI && !hasValidSrc)
  const [hasTriedTwitter, setHasTriedTwitter] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  // Fetch from API (which uses multiple fallbacks and ALWAYS returns a valid URL)
  const fetchFromTwitter = React.useCallback(async (handle: string) => {
    if (isFetching || hasTriedTwitter) return

    setIsFetching(true)
    setHasTriedTwitter(true)
    setImageError(false)
    try {
      // Include userId in query params if available to check Supabase storage first
      const url = userId 
        ? `/api/twitter-avatar/${handle}?userId=${userId}`
        : `/api/twitter-avatar/${handle}`
      const response = await fetch(url)
      // The API always returns a valid imageUrl, even if it's a fallback
      const data = await response.json()
      if (data.imageUrl) {
        setImageSrc(data.imageUrl)
        setIsFetching(false)
        return
      }
      // This should never happen, but just in case:
      console.warn('API returned no imageUrl, using fallback')
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&size=400&background=random&bold=true`
      setImageSrc(fallbackUrl)
    } catch (error) {
      console.error('Error fetching avatar:', error)
      // Even on error, use a fallback URL
      const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&size=400&background=random&bold=true`
      setImageSrc(fallbackUrl)
    } finally {
      setIsFetching(false)
    }
  }, [isFetching, hasTriedTwitter, userId])

  // On mount: only fetch from API if we don't have a valid src
  React.useEffect(() => {
    // If we already have a valid non-Twitter URL, don't fetch
    if (hasValidSrc) return

    if (shouldFetchFromAPI && twitterHandle) {
      // Fetch from API if src is broken Twitter URL or missing
      fetchFromTwitter(twitterHandle)
    } else if (isTwitterUrl && !twitterHandle) {
      // Twitter URL but no handle - can't fetch, show error immediately
      setImageError(true)
      setIsFetching(false)
    }
  }, []) // Only run on mount

  // Handle image load error
  const handleImageError = React.useCallback(() => {
    // If current image failed and we have twitter handle but haven't tried it yet
    if (twitterHandle && !hasTriedTwitter && !isFetching) {
      fetchFromTwitter(twitterHandle)
    } else {
      // No more options, show error
      setImageError(true)
    }
  }, [twitterHandle, hasTriedTwitter, isFetching, fetchFromTwitter])

  // Render logic: Always show something, never show broken Twitter URLs
  // Priority: imageSrc > loading > fallback initials
  
  // If we have a valid image source (not a Twitter URL), show it
  if (imageSrc && !imageSrc.includes('pbs.twimg.com') && !imageSrc.includes('abs.twimg.com')) {
    return (
      <Avatar className={className}>
        <Avatar.Image
          src={imageSrc}
          alt={alt}
          onError={handleImageError}
        />
        <Avatar.Fallback>
          {alt ? alt[0].toUpperCase() : '?'}
        </Avatar.Fallback>
      </Avatar>
    )
  }

  // If we're fetching and don't have an image yet, show loading
  if (isFetching && !imageSrc) {
    return (
      <Avatar className={className}>
        <Avatar.Fallback>...</Avatar.Fallback>
      </Avatar>
    )
  }

  // Final fallback: Always show initials - never show empty/broken
  return (
    <Avatar className={className}>
      <Avatar.Fallback>{alt ? alt[0].toUpperCase() : '?'}</Avatar.Fallback>
    </Avatar>
  )
}
