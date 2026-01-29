import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Twitter, Github, Globe, Calendar, ArrowLeft, Trophy } from 'lucide-react'
import { Container } from '@/components/layout'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { ProjectCard, GrantRow } from '@/components/cards'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface ProfilePageProps {
  params: { username: string }
}

async function getUser(username: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  return data
}

async function getUserProjects(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('projects')
    .select('*, user:users(*)')
    .eq('user_id', userId)
    .in('status', ['approved', 'featured'])
    .order('upvote_count', { ascending: false })

  return (data || []) as any[]
}

async function getUserGrants(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('grants')
    .select('*, creator:users!grants_created_by_fkey(*)')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  return (data || []) as any[]
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await getUser(params.username)

  if (!profile) {
    notFound()
  }

  const [projects, grants, currentUser] = await Promise.all([
    getUserProjects(profile.id),
    getUserGrants(profile.id),
    getCurrentUser(),
  ])

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <Container className="py-12">
      <Link href="/vibecoders">
        <Button variant="link" size="sm" className="mb-8 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Vibecoders
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            {/* Avatar */}
            <div className="text-center">
              <TwitterAvatar
                className="mx-auto w-24 h-24"
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                twitterHandle={profile.twitter_handle}
                userId={profile.id}
              />
              <Text as="h1" className="mt-4 text-2xl font-head font-bold">
                {profile.display_name || profile.username}
              </Text>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Links */}
            <div className="mt-6 space-y-2">
              {profile.twitter_handle && (
                <a
                  href={`https://x.com/${profile.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm"
                >
                  <Twitter className="w-4 h-4" />
                  @{profile.twitter_handle}
                </a>
              )}
              {profile.github_handle && (
                <a
                  href={`https://github.com/${profile.github_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm"
                >
                  <Github className="w-4 h-4" />
                  {profile.github_handle}
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Meta */}
            <div className="mt-6 pt-6 border-t-2 border-black">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>

            {isOwnProfile && (
              <div className="mt-6">
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full">Edit Profile</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Grants Section */}
          {grants.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <Text as="h2" className="text-xl font-head font-semibold">
                  Grants ({grants.length})
                </Text>
              </div>
              <div className="space-y-2">
                {grants.map((grant: any) => (
                  <GrantRow key={grant.id} grant={grant} />
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          <div>
            <div className="mb-4">
              <Text as="h2" className="text-xl font-head font-semibold">
                Projects ({projects.length})
              </Text>
            </div>

            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project: any) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    userId={currentUser?.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No projects yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
