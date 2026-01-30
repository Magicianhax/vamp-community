import Link from 'next/link'
import { Container } from '@/components/layout'
import { GrantRow, ProjectRow, ResourceList } from '@/components/cards'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { Text } from '@/components/retroui/Text'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Trophy, FolderOpen, BookOpen, Users, Sparkles } from 'lucide-react'

async function getActiveGrants() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('grants')
    .select('*, creator:users!grants_created_by_fkey(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)
  return (data || []) as any[]
}

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, user:users(*)')
    .in('status', ['approved', 'featured'])
    .order('upvote_count', { ascending: false })
    .limit(6)
  return (data || []) as any[]
}

async function getResources() {
  const supabase = await createClient()
  // Get featured resources first, then latest (exclude AI tools)
  const { data } = await supabase
    .from('resources')
    .select('*')
    .is('ai_tool_type', null)
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)
  return (data || []) as any[]
}

async function getAITools() {
  const supabase = await createClient()
  // Get featured AI tools
  const { data } = await supabase
    .from('resources')
    .select('*')
    .not('ai_tool_type', 'is', null)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)
  return (data || []) as any[]
}

async function getResourceVotes(resourceIds: string[]) {
  if (resourceIds.length === 0) return {}

  const supabase = await createClient()
  const { data: votes } = await supabase
    .from('resource_votes')
    .select('resource_id, vote_type')
    .in('resource_id', resourceIds)

  const voteCounts: Record<string, { upvotes: number; downvotes: number }> = {}
  resourceIds.forEach(id => {
    voteCounts[id] = { upvotes: 0, downvotes: 0 }
  })

  votes?.forEach((vote: any) => {
    if (vote.vote_type === 'upvote') {
      voteCounts[vote.resource_id].upvotes++
    } else {
      voteCounts[vote.resource_id].downvotes++
    }
  })

  return voteCounts
}

async function getUserResourceVotes(userId: string, resourceIds: string[]) {
  if (resourceIds.length === 0) return {}

  const supabase = await createClient()
  const { data: votes } = await supabase
    .from('resource_votes')
    .select('resource_id, vote_type')
    .eq('user_id', userId)
    .in('resource_id', resourceIds)

  const userVotes: Record<string, 'upvote' | 'downvote'> = {}
  votes?.forEach((vote: any) => {
    userVotes[vote.resource_id] = vote.vote_type
  })

  return userVotes
}

async function getTopVibecoders() {
  const supabase = await createClient()

  const { data: usersWithProjects } = await supabase
    .from('projects')
    .select('user_id')
    .in('status', ['approved', 'featured'])

  if (!usersWithProjects || usersWithProjects.length === 0) {
    return []
  }

  const userIds = [...new Set(usersWithProjects.map((p: any) => p.user_id))]

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .in('id', userIds)

  const usersWithCounts = await Promise.all(
    (users || []).map(async (user: any) => {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['approved', 'featured'])
      return { ...user, projectCount: count || 0 }
    })
  )

  return usersWithCounts.sort((a, b) => b.projectCount - a.projectCount).slice(0, 10)
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getUpvotedAndDownvotedProjectIds(userId: string) {
  const supabase = await createClient()
  const [up, down] = await Promise.all([
    supabase.from('upvotes').select('project_id').eq('user_id', userId),
    supabase.from('downvotes').select('project_id').eq('user_id', userId),
  ])
  return {
    upvoted: new Set((up.data || []).map((r: any) => r.project_id)),
    downvoted: new Set((down.data || []).map((r: any) => r.project_id)),
  }
}

export default async function HomePage() {
  const [grants, projects, resources, aiTools, topVibecoders, user] = await Promise.all([
    getActiveGrants(),
    getProjects(),
    getResources(),
    getAITools(),
    getTopVibecoders(),
    getCurrentUser(),
  ])

  // Get project votes
  let upvoted = new Set<string>()
  let downvoted = new Set<string>()
  if (user?.id) {
    const ids = await getUpvotedAndDownvotedProjectIds(user.id)
    upvoted = ids.upvoted
    downvoted = ids.downvoted
  }
  const projectsWithVotes = projects.map((p: any) => ({
    ...p,
    has_upvoted: upvoted.has(p.id),
    has_downvoted: downvoted.has(p.id),
    downvote_count: p.downvote_count ?? 0,
    comment_count: p.comment_count ?? 0,
  }))

  // Get resource votes
  const allResourceIds = [...resources, ...aiTools].map((r: any) => r.id)
  const resourceVoteCounts = await getResourceVotes(allResourceIds)
  const userResourceVotes = user?.id ? await getUserResourceVotes(user.id, allResourceIds) : {}

  const resourcesWithVotes = resources.map((r: any) => ({
    ...r,
    upvote_count: resourceVoteCounts[r.id]?.upvotes || 0,
    downvote_count: resourceVoteCounts[r.id]?.downvotes || 0,
    user_vote: userResourceVotes[r.id] || null,
  })).sort((a: any, b: any) => {
    // Featured first, then by upvotes
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return b.upvote_count - a.upvote_count
  })

  const aiToolsWithVotes = aiTools.map((r: any) => ({
    ...r,
    upvote_count: resourceVoteCounts[r.id]?.upvotes || 0,
    downvote_count: resourceVoteCounts[r.id]?.downvotes || 0,
    user_vote: userResourceVotes[r.id] || null,
  })).sort((a: any, b: any) => {
    // Featured first, then by upvotes
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return b.upvote_count - a.upvote_count
  })

  return (
    <div className="min-h-screen">
      <Container className="py-6 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8 lg:max-w-[calc(100%-20rem)]">
            {/* Grants Section */}
            <section>
              <SectionHeader
                title="Active Grants"
                href="/grants"
                icon={<Trophy />}
              />
              {grants.length > 0 ? (
                <div className="space-y-2 w-full">
                  {grants.map((grant: any, i: number) => (
                    <GrantRow key={grant.id} grant={grant} rank={i + 1} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No active grants at the moment" icon={<Trophy className="w-10 h-10 text-muted-foreground" />} />
              )}
            </section>

            {/* Projects Section */}
            <section>
              <SectionHeader
                title="Top Projects"
                href="/projects"
                icon={<FolderOpen />}
              />
              {projectsWithVotes.length > 0 ? (
                <div className="space-y-2 w-full">
                  {projectsWithVotes.map((project: any, i: number) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      rank={i + 1}
                      userId={user?.id}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No projects yet" icon={<FolderOpen className="w-10 h-10 text-muted-foreground" />} />
              )}
            </section>

            {/* AI Tools Section */}
            {aiToolsWithVotes.length > 0 && (
              <section>
                <SectionHeader
                  title="AI Tools"
                  href="/learn?section=tools"
                  icon={<Sparkles />}
                />
                <ResourceList
                  resources={aiToolsWithVotes.slice(0, 6)}
                  userId={user?.id}
                />
              </section>
            )}

            {/* Learn Section */}
            <section>
              <SectionHeader
                title="Learn"
                href="/learn"
                icon={<BookOpen />}
              />
              {resourcesWithVotes.length > 0 ? (
                <ResourceList
                  resources={resourcesWithVotes}
                  userId={user?.id}
                />
              ) : (
                <EmptyState message="No resources available yet" icon={<BookOpen className="w-10 h-10 text-muted-foreground" />} />
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 w-full">
              <section className="space-y-8">
                <div>
                  <div className="mb-6">
                    <Text as="h2" className="text-base font-head font-semibold flex items-center gap-2">
                    <span className="text-muted-foreground text-base leading-none inline-flex items-center [&>svg]:w-[0.875em] [&>svg]:h-[0.875em]">
                      <Users />
                    </span>
                    Vibecoders
                  </Text>
                  </div>
                  <Card className="w-full">
                <Card.Content className="p-4">
                  {topVibecoders.length > 0 ? (
                    <div className="space-y-1">
                      {topVibecoders.map((vibecoder: any, index: number) => (
                        <Link
                          key={vibecoder.id}
                          href={`/u/${vibecoder.username}`}
                          className="flex items-center gap-3 p-2"
                        >
                          <span className={`w-6 text-sm font-head font-medium tabular-nums ${
                            index === 0 ? 'text-primary' :
                            index === 1 ? 'text-muted-foreground' :
                            index === 2 ? 'text-accent' :
                            'text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                          <TwitterAvatar
                            className="w-8 h-8"
                            src={vibecoder.avatar_url}
                            alt={vibecoder.display_name || vibecoder.username}
                            twitterHandle={vibecoder.twitter_handle}
                            userId={vibecoder.id}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-head font-medium truncate">
                              {vibecoder.display_name || vibecoder.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {vibecoder.projectCount} project{vibecoder.projectCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No vibecoders yet
                    </p>
                  )}
                </Card.Content>
                </Card>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  )
}

function SectionHeader({
  title,
  href,
  icon,
}: {
  title: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Text as="h2" className="text-lg font-head font-semibold flex items-center gap-2">
        <span className="text-muted-foreground text-lg leading-none inline-flex items-center [&>svg]:w-[1em] [&>svg]:h-[1em]">{icon}</span>
        {title}
      </Text>
      <Link href={href}>
        <Button variant="link" size="sm" className="flex items-center gap-1 text-xs">
          View all
          <ArrowRight className="w-3 h-3" />
        </Button>
      </Link>
    </div>
  )
}

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-10 text-center w-full box-border">
      {icon && <div className="flex justify-center mb-3">{icon}</div>}
      <p className="text-muted-foreground">{message}</p>
    </Card>
  )
}
