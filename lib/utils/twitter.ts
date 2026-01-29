/**
 * Extract Twitter handle from various formats:
 * - https://x.com/username -> username
 * - https://twitter.com/username -> username
 * - @username -> username
 * - username -> username
 */
export function extractTwitterHandle(twitterUrl: string | null | undefined): string | null {
  if (!twitterUrl) return null

  // Remove @ if present
  let handle = twitterUrl.replace(/^@/, '')

  // Extract from URL patterns
  const urlPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/,
    /(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\/@?([a-zA-Z0-9_]+)/,
  ]

  for (const pattern of urlPatterns) {
    const match = handle.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // If it's already just a handle (no URL), return it
  if (/^[a-zA-Z0-9_]+$/.test(handle)) {
    return handle
  }

  return null
}
