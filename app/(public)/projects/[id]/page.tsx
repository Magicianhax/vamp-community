import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Github, Calendar, ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout'
import { Button } from '@/components/retroui/Button'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { ProjectVoteButtons } from '@/components/ui'
import { Markdown } from '@/components/ui/Markdown'
import { ProjectComments } from '@/components/grants'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/types'

interface ProjectPageProps {
  params: { id: string }
}

async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('*, user:users(*)')
    .eq('id', id)
    .in('status', ['approved', 'featured'])
    .single()

  return data as Project | null
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getUserVote(userId: string, projectId: string): Promise<'upvote' | 'downvote' | null> {
  const supabase = await createClient()

  const [upvote, downvote] = await Promise.all([
    supabase.from('upvotes').select('id').eq('user_id', userId).eq('project_id', projectId).single(),
    supabase.from('downvotes').select('id').eq('user_id', userId).eq('project_id', projectId).single(),
  ])

  if (upvote.data) return 'upvote'
  if (downvote.data) return 'downvote'
  return null
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const user = await getCurrentUser()
  const userVote = user ? await getUserVote(user.id, project.id) : null

  return (
    <Container className="py-6 sm:py-12">
      <Link href="/projects">
        <Button variant="link" size="sm" className="mb-4 sm:mb-8 flex items-center gap-2 text-xs sm:text-sm">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          Back to Projects
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            {project.thumbnail_url ? (
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-black shadow-md overflow-hidden">
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                <span className="text-4xl font-head font-bold text-primary-foreground">{project.title[0]}</span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Text as="h1" className="text-2xl md:text-3xl font-head font-bold">
                      {project.title}
                    </Text>
                    {project.status === 'featured' && (
                      <Badge variant="surface" size="lg">Featured</Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground mt-1">{project.tagline}</p>
                </div>

                <ProjectVoteButtons
                  projectId={project.id}
                  initialUpvoteCount={project.upvote_count}
                  initialDownvoteCount={project.downvote_count || 0}
                  initialUserVote={userVote}
                  userId={user?.id}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.map((tag) => (
                  <Link key={tag} href={`/projects?tag=${tag}`}>
                    <Badge variant="default" size="sm">{tag}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-8">
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Demo
              </Button>
            </a>
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <Github className="w-4 h-4 mr-2" />
                View Source
              </Button>
            </a>
          </div>

          {/* Description */}
          <Card className="mb-8">
            <Card.Header>
              <Text as="h2" className="text-lg font-head font-semibold">About</Text>
            </Card.Header>
            <Card.Content>
              <div className="prose prose-invert max-w-none">
                <Markdown content={project.description} />
              </div>
            </Card.Content>
          </Card>

          {/* Comments */}
          <ProjectComments projectId={project.id} userId={user?.id ?? null} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Card */}
          {project.user && (
            <Card>
              <Card.Header>
                <Text as="h3" className="text-sm font-head font-medium">Created by</Text>
              </Card.Header>
              <Card.Content>
                <Link
                  href={`/u/${project.user.username}`}
                  className="flex items-center gap-3"
                >
                  <TwitterAvatar
                    className="w-12 h-12"
                    src={project.user.avatar_url}
                    alt={project.user.display_name || project.user.username}
                    twitterHandle={project.user.twitter_handle}
                    userId={project.user.id}
                  />
                  <div>
                    <p className="font-head font-medium">
                      {project.user.display_name || project.user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">@{project.user.username}</p>
                  </div>
                </Link>

                {project.user.bio && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
                    {project.user.bio}
                  </p>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Meta */}
          <Card>
            <Card.Header>
              <Text as="h3" className="text-sm font-head font-medium">Details</Text>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Published {formatDate(project.created_at)}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </Container>
  )
}
