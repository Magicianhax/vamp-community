'use client'

import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

export interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const imageSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const initials = getInitials(alt)

  // Get larger Twitter profile image
  const getOptimizedSrc = (url: string) => {
    if (url.includes('pbs.twimg.com')) {
      // Replace _normal with _400x400 for higher resolution
      return url.replace('_normal', '_400x400')
    }
    return url
  }

  // Show fallback if no src, or if image failed to load
  if (!src || imageError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-semibold text-white',
          sizeStyles[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-surface', sizeStyles[size], className)}>
      <Image
        src={getOptimizedSrc(src)}
        alt={alt}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="object-cover w-full h-full"
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  )
}
