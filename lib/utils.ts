import clsx from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

export function cn(...classes: ClassNameValue[]) {
  return twMerge(clsx(classes));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getGithubUsername(url: string): string | null {
  const match = url.match(/github\.com\/([^\/]+)/)
  return match ? match[1] : null
}

export function getDaysUntil(date: string | Date): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getHoursUntil(date: string | Date): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60))
}

export function formatTimeLeft(date: string | Date): { text: string; isExpired: boolean; isUrgent: boolean } {
  const now = new Date()
  const target = new Date(date)
  const diffMs = target.getTime() - now.getTime()

  if (diffMs <= 0) {
    return { text: 'Ended', isExpired: true, isUrgent: false }
  }

  const hours = Math.ceil(diffMs / (1000 * 60 * 60))
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (hours <= 24) {
    return { text: `${hours}h left`, isExpired: false, isUrgent: true }
  }

  if (days <= 7) {
    return { text: `${days}d left`, isExpired: false, isUrgent: days <= 3 }
  }

  return { text: formatDate(date), isExpired: false, isUrgent: false }
}

// Export Twitter utilities
export { extractTwitterHandle } from './utils/twitter'

// Note: Avatar storage utilities are NOT exported here to avoid bundling server-only code
// Import them directly from './utils/avatar-storage' in server components/API routes only
