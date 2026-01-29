import Link from 'next/link'
import { Container } from '@/components/layout'
import { ResourceCard, GuideArticleCard } from '@/components/cards'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import { createClient } from '@/lib/supabase/server'
import { RESOURCE_CATEGORIES, AI_TOOL_TYPES, RESOURCE_PRICING, RESOURCE_DIFFICULTY } from '@/lib/constants'
import type { Resource } from '@/types'
import { BookOpen, Wrench, FileText, Video, User, Sparkles } from 'lucide-react'

interface LearnPageProps {
  searchParams: { 
    section?: string
    category?: string
    ai_tool?: string
    pricing?: string
    difficulty?: string
    tag?: string
  }
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getResources(filters: LearnPageProps['searchParams'], userId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('resources')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  // Section-based filtering
  if (filters.section === 'guides') {
    query = query.eq('category', 'article')
  } else if (filters.section === 'tools') {
    query = query.not('ai_tool_type', 'is', null)
  } else if (filters.section === 'tutorials') {
    query = query.eq('category', 'tutorial')
  } else if (filters.section === 'videos') {
    query = query.eq('category', 'video')
  } else if (filters.section === 'experts') {
    query = query.eq('category', 'expert')
  }

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  // Handle AI tool filtering - can be 'true' for all AI tools, or a specific type
  // Note: This is only applied when not already filtered by section
  if (filters.ai_tool && filters.section !== 'tools') {
    if (filters.ai_tool === 'true') {
      query = query.not('ai_tool_type', 'is', null)
    } else {
      // Filter by specific AI tool type
      query = query.eq('ai_tool_type', filters.ai_tool)
    }
  } else if (filters.ai_tool && filters.section === 'tools') {
    // When in tools section, allow filtering by specific type
    if (filters.ai_tool !== 'true') {
      query = query.eq('ai_tool_type', filters.ai_tool)
    }
  }

  if (filters.pricing) {
    query = query.eq('pricing', filters.pricing)
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  if (filters.tag) {
    query = query.contains('tags', [filters.tag])
  }

  const { data: resources } = await query.limit(100)

  if (!resources || resources.length === 0) {
    return []
  }

  // Get vote counts and user votes for guides/articles
  const resourceIds = resources.map(r => r.id)
  
  // Get vote counts
  const { data: voteCounts } = await supabase
    .from('resource_votes')
    .select('resource_id, vote_type')
    .in('resource_id', resourceIds)

  // Get user votes if logged in
  let userVotes: Record<string, 'upvote' | 'downvote'> = {}
  if (userId) {
    const { data: votes } = await supabase
      .from('resource_votes')
      .select('resource_id, vote_type')
      .eq('user_id', userId)
      .in('resource_id', resourceIds)
    
    if (votes) {
      userVotes = votes.reduce((acc, vote) => {
        acc[vote.resource_id] = vote.vote_type as 'upvote' | 'downvote'
        return acc
      }, {} as Record<string, 'upvote' | 'downvote'>)
    }
  }

  // Calculate vote counts per resource
  const voteCountsMap = voteCounts?.reduce((acc, vote) => {
    if (!acc[vote.resource_id]) {
      acc[vote.resource_id] = { upvotes: 0, downvotes: 0 }
    }
    if (vote.vote_type === 'upvote') {
      acc[vote.resource_id].upvotes++
    } else {
      acc[vote.resource_id].downvotes++
    }
    return acc
  }, {} as Record<string, { upvotes: number; downvotes: number }>) || {}

  // Add vote data to resources
  return resources.map((resource) => ({
    ...resource,
    upvote_count: voteCountsMap[resource.id]?.upvotes || 0,
    downvote_count: voteCountsMap[resource.id]?.downvotes || 0,
    user_vote: userVotes[resource.id] || null,
  })) as (Resource & {
    upvote_count: number
    downvote_count: number
    user_vote: 'upvote' | 'downvote' | null
  })[]
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const user = await getCurrentUser()
  const resources = await getResources(searchParams, user?.id)
  
  // Build filter URLs
  const buildFilterUrl = (updates: Partial<LearnPageProps['searchParams']>) => {
    const params = new URLSearchParams()
    if (searchParams.section) params.set('section', searchParams.section)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.ai_tool) params.set('ai_tool', searchParams.ai_tool)
    if (searchParams.pricing) params.set('pricing', searchParams.pricing)
    if (searchParams.difficulty) params.set('difficulty', searchParams.difficulty)
    if (searchParams.tag) params.set('tag', searchParams.tag)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    return `/learn?${params.toString()}`
  }

  const sections = [
    { id: 'all', label: 'All Resources', icon: null },
    { id: 'guides', label: 'Guides', icon: <FileText className="w-4 h-4" /> },
    { id: 'tools', label: 'AI Tools', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'tutorials', label: 'Tutorials', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
    { id: 'experts', label: 'Experts', icon: <User className="w-4 h-4" /> },
  ]

  const currentSection = searchParams.section || 'all'

  return (
    <Container className="py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Text as="h1" className="text-3xl font-head font-bold">Learn</Text>
            <p className="text-muted-foreground mt-2">
              Curated resources to level up your vibecoding skills
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="mb-8 border-b-2 border-black">
        <div className="flex flex-wrap gap-2 -mb-[2px]">
          {sections.map((section) => {
            const isActive = currentSection === section.id
            return (
              <Link
                key={section.id}
                href={buildFilterUrl({ section: section.id === 'all' ? undefined : section.id })}
                className={`
                  px-4 py-3 font-head font-medium text-sm border-b-2 transition-colors
                  ${isActive 
                    ? 'border-primary text-foreground bg-primary/5' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span>{section.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Section-Specific Filters */}
      <div className="mb-6 space-y-3">
        {/* Main Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category - Only show when not in a specific section */}
          {currentSection === 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Category:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <a href={buildFilterUrl({ category: undefined })}>
                  <Badge variant={!searchParams.category ? 'solid' : 'default'} size="sm">
                    All
                  </Badge>
                </a>
                {RESOURCE_CATEGORIES.map((cat) => (
                  <a key={cat.value} href={buildFilterUrl({ category: cat.value })}>
                    <Badge variant={searchParams.category === cat.value ? 'solid' : 'default'} size="sm">
                      {cat.label}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools Filters - Only show in tools section */}
          {currentSection === 'tools' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Type:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <a href={buildFilterUrl({ ai_tool: undefined })}>
                    <Badge variant={!searchParams.ai_tool ? 'solid' : 'default'} size="sm">
                      All
                    </Badge>
                  </a>
                  {AI_TOOL_TYPES.map((type) => (
                    <a key={type.value} href={buildFilterUrl({ ai_tool: type.value })}>
                      <Badge variant={searchParams.ai_tool === type.value ? 'solid' : 'default'} size="sm">
                        {type.label}
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Pricing:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <a href={buildFilterUrl({ pricing: undefined })}>
                    <Badge variant={!searchParams.pricing ? 'solid' : 'default'} size="sm">
                      All
                    </Badge>
                  </a>
                  {RESOURCE_PRICING.map((pricing) => (
                    <a key={pricing.value} href={buildFilterUrl({ pricing: pricing.value })}>
                      <Badge variant={searchParams.pricing === pricing.value ? 'solid' : 'default'} size="sm">
                        {pricing.label}
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Difficulty - Show for guides and tutorials */}
          {(currentSection === 'guides' || currentSection === 'tutorials' || currentSection === 'all') && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Level:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <a href={buildFilterUrl({ difficulty: undefined })}>
                  <Badge variant={!searchParams.difficulty ? 'solid' : 'default'} size="sm">
                    All
                  </Badge>
                </a>
                {RESOURCE_DIFFICULTY.map((diff) => (
                  <a key={diff.value} href={buildFilterUrl({ difficulty: diff.value })}>
                    <Badge variant={searchParams.difficulty === diff.value ? 'solid' : 'default'} size="sm">
                      {diff.label}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Description */}
      {currentSection === 'guides' && (
        <Card className="mb-6 p-4 bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <Text as="h2" className="text-base font-head font-bold mb-1">
                Guides & Articles
              </Text>
              <p className="text-sm text-muted-foreground">
                Comprehensive guides and articles to help you master AI coding tools and development workflows
              </p>
            </div>
          </div>
        </Card>
      )}

      {currentSection === 'tools' && (
        <Card className="mb-6 p-4 bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <Text as="h2" className="text-base font-head font-bold mb-1">
                AI Tools
              </Text>
              <p className="text-sm text-muted-foreground">
                Explore powerful AI coding assistants, image generators, and design tools to supercharge your workflow
              </p>
            </div>
          </div>
        </Card>
      )}

      {currentSection === 'tutorials' && (
        <Card className="mb-6 p-4 bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <Text as="h2" className="text-base font-head font-bold mb-1">
                Tutorials
              </Text>
              <p className="text-sm text-muted-foreground">
                Step-by-step tutorials to learn new skills and build projects
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Resources Grid */}
      {resources.length > 0 ? (
        // For guides section, use full-width cards with voting
        currentSection === 'guides' ? (
          <div className="space-y-4">
            {resources.map((resource) => (
              <GuideArticleCard 
                key={resource.id} 
                resource={resource}
                userId={user?.id || null}
              />
            ))}
          </div>
        ) : (
          // For other sections, use grid layout
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} userId={user?.id || null} />
            ))}
          </div>
        )
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No resources found</p>
          {(searchParams.section || searchParams.category || searchParams.ai_tool || searchParams.pricing || searchParams.difficulty) && (
            <a href="/learn" className="mt-2 inline-block">
              <Button variant="link" size="sm">Clear all filters</Button>
            </a>
          )}
        </Card>
      )}
    </Container>
  )
}
