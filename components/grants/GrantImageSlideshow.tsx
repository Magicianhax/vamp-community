'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/retroui/Button'

export interface GrantImageSlideshowProps {
  imageUrls: string[]
  alt?: string
  className?: string
}

export function GrantImageSlideshow({
  imageUrls,
  alt = 'Grant',
  className = '',
}: GrantImageSlideshowProps) {
  const [index, setIndex] = useState(0)

  const urls = imageUrls?.filter(Boolean) ?? []
  const count = urls.length

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 5000)
    return () => clearInterval(t)
  }, [count])

  if (count === 0) return null

  return (
    <div className={`relative w-full aspect-[21/9] bg-muted border-2 border-black shadow-md overflow-hidden ${className}`}>
      <Image
        src={urls[index]}
        alt={`${alt} image ${index + 1}`}
        fill
        className="object-cover"
        unoptimized
        priority
      />
      {count > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="absolute left-2 top-1/2 -translate-y-1/2"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2 h-2 border-2 border-black ${
                  i === index ? 'bg-foreground' : 'bg-background'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
