'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Reply } from 'lucide-react'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { Text } from '@/components/retroui/Text'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import type { Comment } from '@/types'

export interface ResourceCommentsProps {
  resourceId: string
  userId: string | null
}

interface CommentWithUser extends Comment {
  user?: { id: string; username: string; display_name: string | null; avatar_url: string | null; twitter_handle: string | null }
}

export function ResourceComments({ resourceId, userId }: ResourceCommentsProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*, user:users(id, username, display_name, avatar_url, twitter_handle)')
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: true })

    setComments((data as CommentWithUser[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()
  }, [resourceId])

  const topLevel = comments.filter((c) => !c.parent_id)
  const repliesByParent = comments
    .filter((c) => c.parent_id)
    .reduce<Record<string, CommentWithUser[]>>((acc, c) => {
      if (!c.parent_id) return acc
      acc[c.parent_id] = acc[c.parent_id] || []
      acc[c.parent_id].push(c)
      return acc
    }, {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || !userId) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      resource_id: resourceId,
      grant_id: null,
      project_id: null,
      parent_id: null,
      user_id: userId,
      body: body.trim(),
    })
    if (!error) {
      setBody('')
      await fetchComments()
    }
    setSubmitting(false)
  }

  const handleReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!replyBody.trim() || !userId) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      resource_id: resourceId,
      grant_id: null,
      project_id: null,
      parent_id: parentId,
      user_id: userId,
      body: replyBody.trim(),
    })
    if (!error) {
      setReplyTo(null)
      setReplyBody('')
      await fetchComments()
    }
    setSubmitting(false)
  }

  return (
    <div id="comments" className="mt-10 pt-8 border-t-2 border-black">
      <Text as="h2" className="text-lg font-head font-semibold flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        Comments ({comments.length})
      </Text>

      {userId && (
        <Card className="mb-6">
          <Card.Content>
            <form onSubmit={handleSubmit}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-black rounded shadow-md focus:outline-hidden focus:shadow-xs resize-none"
                disabled={submitting}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  size="sm"
                >
                  {submitting ? 'Posting...' : 'Post comment'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {!userId && (
        <Card className="mb-6">
          <Card.Content>
            <p className="text-sm text-muted-foreground">
              <Link href="/login">
                <Button variant="link" size="sm" className="p-0 h-auto">Sign in</Button>
              </Link>{' '}
              to comment.
            </p>
          </Card.Content>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading comments...</p>
      ) : topLevel.length === 0 ? (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {topLevel.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                replies={repliesByParent[comment.id] || []}
                userId={userId}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyBody={replyBody}
                setReplyBody={setReplyBody}
                onReply={handleReply}
                submitting={submitting}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  replies,
  userId,
  replyTo,
  setReplyTo,
  replyBody,
  setReplyBody,
  onReply,
  submitting,
}: {
  comment: CommentWithUser
  replies: CommentWithUser[]
  userId: string | null
  replyTo: string | null
  setReplyTo: (id: string | null) => void
  replyBody: string
  setReplyBody: (s: string) => void
  onReply: (e: React.FormEvent, parentId: string) => void
  submitting: boolean
}) {
  const isReplying = replyTo === comment.id

  return (
    <Card>
      <Card.Content>
        <div className="flex gap-3">
          <TwitterAvatar
            className="w-10 h-10"
            src={comment.user?.avatar_url ?? undefined}
            alt={comment.user?.display_name || comment.user?.username || 'User'}
            twitterHandle={comment.user?.twitter_handle ?? undefined}
            userId={comment.user?.id}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/u/${comment.user?.username}`}>
                <Text as="span" className="font-head font-medium">
                  {comment.user?.display_name || comment.user?.username || 'User'}
                </Text>
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5 whitespace-pre-wrap">
              {comment.body}
            </p>
            {userId && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setReplyTo(isReplying ? null : comment.id)}
                className="mt-1 p-0 h-auto"
              >
                <Reply className="w-3.5 h-3.5 mr-1" />
                Reply
              </Button>
            )}
            {isReplying && (
              <form
                onSubmit={(e) => onReply(e, comment.id)}
                className="mt-3 flex gap-2"
              >
                <Input
                  type="text"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  disabled={submitting}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={submitting || !replyBody.trim()}
                  size="sm"
                >
                  Reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setReplyTo(null); setReplyBody('') }}
                >
                  Cancel
                </Button>
              </form>
            )}
            {replies.length > 0 && (
              <ul className="mt-3 pl-4 border-l-2 border-black space-y-3">
                {replies.map((r) => (
                  <li key={r.id}>
                    <div className="flex gap-2">
                      <TwitterAvatar
                        className="w-8 h-8"
                        src={r.user?.avatar_url ?? undefined}
                        alt={r.user?.display_name || r.user?.username || 'User'}
                        twitterHandle={r.user?.twitter_handle ?? undefined}
                        userId={r.user?.id}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/u/${r.user?.username}`}>
                            <Text as="span" className="font-head font-medium text-sm">
                              {r.user?.display_name || r.user?.username || 'User'}
                            </Text>
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(r.created_at)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5 whitespace-pre-wrap">
                          {r.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
