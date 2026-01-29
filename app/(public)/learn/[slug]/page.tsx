import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/layout'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Markdown } from '@/components/ui/Markdown'
import { ResourceVoteButton } from '@/components/ui/ResourceVoteButton'
import { ResourceComments } from '@/components/resources/ResourceComments'
import { createClient } from '@/lib/supabase/server'

interface LearnArticlePageProps {
  params: { slug: string }
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getArticle(slug: string) {
  const supabase = await createClient()
  
  // Find resource by URL - try both with and without leading slash
  const urlVariants = [`/learn/${slug}`, `learn/${slug}`]
  
  for (const url of urlVariants) {
    const { data } = await supabase
      .from('resources')
      .select('*')
      .eq('url', url)
      .maybeSingle()
    
    if (data) {
      return data
    }
  }
  
  return null
}

async function getArticleVotes(resourceId: string, userId?: string) {
  const supabase = await createClient()
  
  // Get vote counts
  const { data: votes } = await supabase
    .from('resource_votes')
    .select('vote_type')
    .eq('resource_id', resourceId)
  
  const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0
  const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0
  
  // Get user vote if logged in
  let userVote: 'upvote' | 'downvote' | null = null
  if (userId) {
    const { data: userVoteData } = await supabase
      .from('resource_votes')
      .select('vote_type')
      .eq('resource_id', resourceId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (userVoteData) {
      userVote = userVoteData.vote_type as 'upvote' | 'downvote'
    }
  }
  
  return { upvotes, downvotes, userVote }
}

export default async function LearnArticlePage({ params }: LearnArticlePageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  // Get current user and votes
  const user = await getCurrentUser()
  const { upvotes, downvotes, userVote } = await getArticleVotes(article.id, user?.id)

  // Extract content from description (content is stored after --- separator)
  const parts = article.description.split('\n\n---\n\n')
  const shortDescription = parts[0]
  const content = parts[1] || article.description

  return (
    <Container className="py-12">
      <Link href="/learn">
        <Button variant="link" size="sm" className="mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Learn
        </Button>
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Article Body with Vote Buttons */}
        <div className="flex gap-6">
          {/* Vote Buttons - Sticky Left Side */}
          <div className="flex-shrink-0 w-12">
            <div className="sticky top-24 mt-2">
              <ResourceVoteButton
                resourceId={article.id}
                initialUpvotes={upvotes}
                initialDownvotes={downvotes}
                initialUserVote={userVote}
                userId={user?.id || null}
              />
            </div>
          </div>

          {/* Article Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <header className="mb-8">
              <Text as="h1" className="text-3xl md:text-4xl font-head font-bold mb-4">
                {article.title}
              </Text>
              {shortDescription && (
                <p className="text-lg text-muted-foreground mb-6">
                  {shortDescription}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {article.tags && article.tags.length > 0 && (
                  <>
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </>
                )}
                {article.difficulty && (
                  <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                    {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
                  </span>
                )}
              </div>
            </header>

            <Card>
              <Card.Content className="p-8">
                <div className="prose prose-invert max-w-none">
                  <Markdown content={content} />
                </div>
              </Card.Content>
            </Card>

            {/* Comments Section */}
            <ResourceComments
              resourceId={article.id}
              userId={user?.id || null}
            />
          </div>
        </div>
      </article>
    </Container>
  )
}
