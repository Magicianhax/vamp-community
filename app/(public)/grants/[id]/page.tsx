import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Trophy } from 'lucide-react'
import { Container } from '@/components/layout'
import { Button } from '@/components/retroui/Button'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { ProjectCard } from '@/components/cards'
import { GrantImageSlideshow, GrantComments } from '@/components/grants'
import { Markdown } from '@/components/ui/Markdown'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { TweetEmbed } from '@/components/ui/TweetEmbed'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getDaysUntil } from '@/lib/utils'
import { extractTwitterHandle } from '@/lib/utils/twitter'
import { GRANT_STATUS_LABELS } from '@/lib/constants'
import type { Grant } from '@/types'

interface GrantPageProps {
  params: { id: string }
}

async function getGrant(id: string): Promise<Grant | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('grants')
    .select('*, creator:users!grants_created_by_fkey(*)')
    .eq('id', id)
    .single()

  return data as Grant | null
}

async function getGrantSubmissions(grantId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('grant_submissions')
    .select('*, project:projects(*, user:users(*))')
    .eq('grant_id', grantId)
    .eq('status', 'winner')

  return (data || []) as any[]
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function GrantPage({ params }: GrantPageProps) {
  const grant = await getGrant(params.id)

  if (!grant) {
    notFound()
  }

  const [winningSubmissions, user] = await Promise.all([
    getGrantSubmissions(grant.id),
    getCurrentUser(),
  ])

  const daysLeft = getDaysUntil(grant.deadline)
  const isExpired = daysLeft < 0
  const isActive = grant.status === 'active' && !isExpired

  const imageUrls = (grant as any).image_urls ?? []

  return (
    <Container className="py-12">
      <Link href="/grants">
        <Button variant="link" size="sm" className="mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Grants
        </Button>
      </Link>

      {/* Image slideshow */}
      {imageUrls.length > 0 && (
        <GrantImageSlideshow
          imageUrls={imageUrls}
          alt={grant.title}
          className="mb-8"
        />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            {grant.sponsor_logo_url ? (
              <TwitterAvatar
                className="w-20 h-20 border-2 border-black shadow-md"
                src={grant.sponsor_logo_url}
                alt={grant.sponsor_name}
                twitterHandle={extractTwitterHandle(grant.sponsor_twitter_url)}
              />
            ) : grant.creator ? (
              <Link href={`/u/${grant.creator.username}`}>
                <TwitterAvatar
                  className="w-20 h-20 border-2 border-black shadow-md hover:opacity-80 transition-opacity"
                  src={grant.creator.avatar_url}
                  alt={grant.creator.display_name || grant.creator.username}
                  twitterHandle={grant.creator.twitter_handle}
                  userId={grant.creator.id}
                />
              </Link>
            ) : grant.sponsor_twitter_url ? (
              <TwitterAvatar
                className="w-20 h-20 border-2 border-black shadow-md"
                src={null}
                alt={grant.sponsor_name}
                twitterHandle={extractTwitterHandle(grant.sponsor_twitter_url)}
              />
            ) : (
              <div className="w-20 h-20 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text as="h1" className="text-xl md:text-2xl font-head font-bold mb-2">
                    {grant.title}
                  </Text>
                  {grant.creator ? (
                    <Link href={`/u/${grant.creator.username}`} className="text-base text-muted-foreground mb-3 hover:text-foreground transition-colors">
                      by {grant.creator.display_name || grant.creator.username}
                    </Link>
                  ) : (
                    <p className="text-base text-muted-foreground mb-3">by {grant.sponsor_name}</p>
                  )}
                  {grant.short_description && (
                    <p className="text-base text-foreground mt-3 leading-relaxed">{grant.short_description}</p>
                  )}
                </div>
                <Badge variant="default" size="lg">
                  {GRANT_STATUS_LABELS[grant.status]}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="mb-6">
            <Card.Header>
              <Text as="h2" className="text-base font-head font-semibold">About</Text>
            </Card.Header>
            <Card.Content>
              <div className="prose prose-invert max-w-none text-base leading-relaxed">
                <Markdown content={grant.description} />
              </div>
            </Card.Content>
          </Card>

          {/* Requirements */}
          <Card className="mb-6">
            <Card.Header>
              <Text as="h2" className="text-base font-head font-semibold">Requirements</Text>
            </Card.Header>
            <Card.Content>
              <div className="prose prose-invert max-w-none text-base leading-relaxed">
                <Markdown content={grant.requirements} />
              </div>
            </Card.Content>
          </Card>

          {/* Tweet Embed */}
          {grant.tweet_url && (
            <Card className="mb-6">
              <Card.Header>
                <Text as="h2" className="text-base font-head font-semibold">Announcement</Text>
              </Card.Header>
              <Card.Content>
                <TweetEmbed tweetUrl={grant.tweet_url} />
              </Card.Content>
            </Card>
          )}

          {/* Winners */}
          {winningSubmissions.length > 0 && (
            <div className="mt-8">
              <Text as="h2" className="text-lg font-head font-semibold mb-4">Winners</Text>
              <div className="space-y-4">
                {winningSubmissions.map((submission: any) => (
                  <ProjectCard
                    key={submission.id}
                    project={submission.project}
                    userId={user?.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <GrantComments grantId={grant.id} userId={user?.id ?? null} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply CTA */}
          {isActive && (
            <Card>
              <Card.Header>
                <Text as="h3" className="font-head font-semibold">Ready to submit?</Text>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit your vibecoded project to compete for the grant
                </p>
                {user ? (
                  <Link href={`/dashboard/projects/new?grant=${grant.id}`}>
                    <Button className="w-full">Submit Project</Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="w-full">Sign In to Submit</Button>
                  </Link>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Deadline and Prize Pool - Side by Side */}
          <div className="flex gap-4">
            {/* Deadline */}
            <Card className="flex-1">
              <Card.Header className="pb-2">
                <Text as="h3" className="text-xs font-head font-medium">Deadline</Text>
              </Card.Header>
              <Card.Content className="pt-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-head font-medium truncate">
                      {formatDate(grant.deadline)}
                    </p>
                    {isExpired ? (
                      <p className="text-xs text-destructive">Grant ended</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {daysLeft === 0
                          ? 'Ends today'
                          : daysLeft === 1
                          ? '1 day left'
                          : `${daysLeft} days left`}
                      </p>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Prize Pool */}
            <Card className="flex-1">
              <Card.Header className="pb-2">
                <Text as="h3" className="text-xs font-head font-medium">Prize Pool</Text>
              </Card.Header>
              <Card.Content className="pt-0">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm font-head font-medium truncate">{grant.prize_amount}</p>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
}
