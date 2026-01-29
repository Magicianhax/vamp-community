'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Search, X, FolderOpen, Trophy, Loader2, User, BookOpen, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { cn } from '@/lib/utils'

export interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  id: string
  title: string
  type: 'project' | 'grant' | 'user' | 'resource' | 'ai_tool'
  description?: string
  tagline?: string
  short_description?: string
  twitter_handle?: string
  username?: string
  url?: string
  category?: string
  thumbnail_url?: string
  logo_url?: string
  avatar_url?: string
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      const supabase = createClient()

      try {
        // Run all searches in parallel for efficiency
        const [projectsRes, grantsRes, usersRes, resourcesRes] = await Promise.all([
          // Search projects
          supabase
            .from('projects')
            .select('id, title, tagline, description, logo_url')
            .in('status', ['approved', 'featured'])
            .or(`title.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(5),
          // Search grants
          supabase
            .from('grants')
            .select('id, title, short_description, description, sponsor_logo_url')
            .or(`title.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(5),
          // Search users
          supabase
            .from('users')
            .select('id, display_name, username, twitter_handle, bio, avatar_url')
            .or(`display_name.ilike.%${query}%,username.ilike.%${query}%,twitter_handle.ilike.%${query}%,bio.ilike.%${query}%`)
            .limit(5),
          // Search resources (learn + AI tools)
          supabase
            .from('resources')
            .select('id, title, description, url, category, ai_tool_type, thumbnail_url')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .limit(6),
        ])

        const projects = projectsRes.data
        const grants = grantsRes.data
        const users = usersRes.data
        const resources = resourcesRes.data

        const searchResults: SearchResult[] = [
          ...(users || []).map((u: any) => ({
            id: u.id,
            title: u.display_name || u.username,
            type: 'user' as const,
            twitter_handle: u.twitter_handle,
            username: u.username,
            description: u.bio,
            avatar_url: u.avatar_url,
          })),
          ...(projects || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            type: 'project' as const,
            tagline: p.tagline,
            description: p.description,
            logo_url: p.logo_url,
          })),
          ...(grants || []).map((g: any) => ({
            id: g.id,
            title: g.title,
            type: 'grant' as const,
            short_description: g.short_description,
            description: g.description,
            logo_url: g.sponsor_logo_url,
          })),
          ...(resources || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            type: r.ai_tool_type ? 'ai_tool' as const : 'resource' as const,
            description: r.description,
            url: r.url,
            category: r.category,
            thumbnail_url: r.thumbnail_url,
          })),
        ]

        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(search, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-2xl border-2 border-black shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search projects, users, AI tools, learn..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 text-base w-full px-4 py-2 border-2 border-black rounded shadow-md focus:outline-none focus:shadow-xs"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 border-black rounded shadow-md bg-card hover:shadow-sm transition-all"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="p-12 text-center">
              <Text className="text-muted-foreground">No results found</Text>
            </div>
          ) : !query.trim() ? (
            <div className="p-12 text-center">
              <Text className="text-muted-foreground">Start typing to search...</Text>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) =>
                result.type === 'resource' || result.type === 'ai_tool' ? (
                  <a
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block"
                  >
                    <Card className="p-4 mb-2 border-2 border-black shadow-md hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 flex items-center justify-center border-2 border-black rounded shadow-md flex-shrink-0 overflow-hidden',
                          !result.thumbnail_url && (result.type === 'ai_tool' ? 'bg-purple-500' : 'bg-blue-500')
                        )}>
                          {result.thumbnail_url ? (
                            <img src={result.thumbnail_url} alt={result.title} className="w-full h-full object-cover" />
                          ) : result.type === 'ai_tool' ? (
                            <Sparkles className="w-5 h-5 text-white" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text as="h3" className="font-head font-semibold line-clamp-1">
                            {result.title}
                          </Text>
                          <Text className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.description}
                          </Text>
                          <div className="mt-2">
                            <span className={cn(
                              'text-xs px-2 py-1 border-2 border-black rounded shadow-sm',
                              result.type === 'ai_tool' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                            )}>
                              {result.type === 'ai_tool' ? 'AI Tool' : 'Learn'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </a>
                ) : (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={
                      result.type === 'project'
                        ? `/projects/${result.id}`
                        : result.type === 'grant'
                          ? `/grants/${result.id}`
                          : `/u/${result.username}`
                    }
                    onClick={onClose}
                    className="block"
                  >
                    <Card className="p-4 mb-2 border-2 border-black shadow-md hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 flex items-center justify-center border-2 border-black rounded shadow-md flex-shrink-0 overflow-hidden',
                          !(result.logo_url || result.avatar_url) && (result.type === 'project' ? 'bg-primary' : result.type === 'grant' ? 'bg-accent' : 'bg-secondary')
                        )}>
                          {result.logo_url || result.avatar_url ? (
                            <img src={result.logo_url || result.avatar_url} alt={result.title} className="w-full h-full object-cover" />
                          ) : result.type === 'project' ? (
                            <FolderOpen className="w-5 h-5 text-primary-foreground" />
                          ) : result.type === 'grant' ? (
                            <Trophy className="w-5 h-5 text-accent-foreground" />
                          ) : (
                            <User className="w-5 h-5 text-secondary-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text as="h3" className="font-head font-semibold line-clamp-1">
                            {result.title}
                          </Text>
                          <Text className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.type === 'user' && result.twitter_handle
                              ? `@${result.twitter_handle}${result.description ? ` · ${result.description}` : ''}`
                              : result.tagline || result.short_description || result.description}
                          </Text>
                          <div className="mt-2">
                            <span className={cn(
                              'text-xs px-2 py-1 border-2 border-black rounded shadow-sm',
                              result.type === 'project'
                                ? 'bg-primary text-primary-foreground'
                                : result.type === 'grant'
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                            )}>
                              {result.type === 'project' ? 'Project' : result.type === 'grant' ? 'Grant' : 'User'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  if (typeof window === 'undefined') return null

  return createPortal(modalContent, document.body)
}
