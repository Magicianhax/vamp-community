import { Container } from '@/components/layout'
import { ProjectRow } from '@/components/cards'
import { Button } from '@/components/retroui/Button'
import { Badge } from '@/components/retroui/Badge'
import { Text } from '@/components/retroui/Text'
import { Card } from '@/components/retroui/Card'
import { createClient } from '@/lib/supabase/server'
import { POPULAR_TAGS } from '@/lib/constants'

interface ProjectsPageProps {
  searchParams: { tag?: string; sort?: string }
}

async function getProjects(tag?: string, sort?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('projects')
    .select('*, user:users(*)')
    .in('status', ['approved', 'featured'])

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('upvote_count', { ascending: false })
  }

  const { data } = await query.limit(50)

  return (data || []) as any[]
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

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { tag, sort } = searchParams
  const [projects, user] = await Promise.all([
    getProjects(tag, sort),
    getCurrentUser(),
  ])

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

  return (
    <Container className="py-12">
      {/* Header */}
      <div className="mb-8">
        <Text as="h1" className="text-3xl font-head font-bold">Top Projects</Text>
        <p className="text-muted-foreground mt-2">
          Discover vibecoded projects from the community
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <div className="flex gap-1">
            <a href="/projects">
              <Button variant={!sort || sort === 'popular' ? 'default' : 'outline'} size="sm">
                Popular
              </Button>
            </a>
            <a href="/projects?sort=newest">
              <Button variant={sort === 'newest' ? 'default' : 'outline'} size="sm">
                Newest
              </Button>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Tags:</span>
          <a href="/projects">
            <Badge variant={!tag ? 'surface' : 'default'} size="sm">
              All
            </Badge>
          </a>
          {POPULAR_TAGS.map((t) => (
            <a key={t} href={`/projects?tag=${t}${sort ? `&sort=${sort}` : ''}`}>
              <Badge variant={tag === t ? 'surface' : 'default'} size="sm">
                {t}
              </Badge>
            </a>
          ))}
        </div>
      </div>

      {/* Projects list */}
      {projectsWithVotes.length > 0 ? (
        <div className="space-y-2">
          {projectsWithVotes.map((project: any, index: number) => (
            <ProjectRow
              key={project.id}
              project={project}
              rank={index + 1}
              userId={user?.id}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No projects found</p>
          {tag && (
            <a href="/projects" className="mt-2 inline-block">
              <Button variant="link" size="sm">Clear filters</Button>
            </a>
          )}
        </Card>
      )}
    </Container>
  )
}
