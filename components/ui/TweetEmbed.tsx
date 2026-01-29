'use client'

import { useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/retroui/Button'

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void
        createTweet: (tweetId: string, container: HTMLElement, options?: object) => Promise<HTMLElement>
      }
    }
  }
}

export interface TweetEmbedProps {
  tweetUrl: string
  className?: string
}

function extractTweetId(url: string): string | null {
  // Match patterns like:
  // https://twitter.com/user/status/123456789
  // https://x.com/user/status/123456789
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)
  return match ? match[1] : null
}

export function TweetEmbed({ tweetUrl, className }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const tweetId = extractTweetId(tweetUrl)

  useEffect(() => {
    if (!tweetId || !containerRef.current) {
      setError(true)
      setLoading(false)
      return
    }

    // Load Twitter widget script if not already loaded
    const loadTwitterScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.twttr) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://platform.twitter.com/widgets.js'
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Twitter widgets'))
        document.head.appendChild(script)
      })
    }

    const embedTweet = async () => {
      try {
        await loadTwitterScript()

        if (window.twttr && containerRef.current) {
          // Clear container first
          containerRef.current.innerHTML = ''

          const tweet = await window.twttr.widgets.createTweet(tweetId, containerRef.current, {
            theme: 'light',
            dnt: true,
            align: 'center',
          })

          if (!tweet) {
            setError(true)
          }
        }
      } catch (err) {
        console.error('Error embedding tweet:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    embedTweet()
  }, [tweetId])

  // If we can't extract the tweet ID, show the fallback link
  if (!tweetId || error) {
    return (
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2"
      >
        <Button variant="outline" size="sm">
          <ExternalLink className="w-4 h-4" />
          View announcement on X
        </Button>
      </a>
    )
  }

  return (
    <div className={className}>
      {loading && (
        <div className="flex items-center justify-center py-8 border-2 border-black rounded shadow-md bg-card">
          <div className="animate-pulse text-sm text-muted-foreground">Loading tweet...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className={loading ? 'hidden' : ''}
        style={{ minHeight: loading ? 0 : 'auto' }}
      />
    </div>
  )
}
