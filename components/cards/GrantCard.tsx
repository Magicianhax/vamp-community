import Link from 'next/link'
import { Calendar, Trophy, Users } from 'lucide-react'
import { cn, formatDate, getDaysUntil } from '@/lib/utils'
import { extractTwitterHandle } from '@/lib/utils/twitter'
import { Badge } from '@/components/retroui/Badge'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { GRANT_STATUS_LABELS } from '@/lib/constants'
import type { Grant } from '@/types'

export interface GrantCardProps {
  grant: Grant
  className?: string
}

export function GrantCard({ grant, className }: GrantCardProps) {
  const daysLeft = getDaysUntil(grant.deadline)
  const isExpired = daysLeft < 0
  const isUrgent = daysLeft <= 7 && daysLeft >= 0

  return (
    <Link href={`/grants/${grant.id}`} className={cn('block', className)}>
      <Card>
        <Card.Content>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {grant.sponsor_logo_url || grant.sponsor_twitter_url ? (
                <TwitterAvatar
                  className="w-12 h-12 border-2 border-black shadow-md"
                  src={grant.sponsor_logo_url}
                  alt={grant.sponsor_name}
                  twitterHandle={extractTwitterHandle(grant.sponsor_twitter_url)}
                />
              ) : (
                <div className="w-12 h-12 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              <div>
                <Text as="h3" className="font-head font-semibold">
                  {grant.title}
                </Text>
                <p className="text-sm text-muted-foreground">{grant.sponsor_name}</p>
              </div>
            </div>

            <Badge variant="default" size="sm">
              {GRANT_STATUS_LABELS[grant.status]}
            </Badge>
          </div>

          {/* Short Description */}
          {grant.short_description && (
            <p className="text-sm text-muted-foreground mt-4">
              {grant.short_description}
            </p>
          )}

          {/* Prize */}
          <Card className="mt-4 p-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-lg font-head font-bold">{grant.prize_amount}</span>
            </div>
          </Card>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-black">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {isExpired ? (
                <span className="text-destructive">Ended {formatDate(grant.deadline)}</span>
              ) : (
                <span className={cn(isUrgent && 'text-destructive', 'text-muted-foreground')}>
                  {daysLeft === 0
                    ? 'Ends today'
                    : daysLeft === 1
                    ? '1 day left'
                    : `${daysLeft} days left`}
                </span>
              )}
            </div>

            {grant.submission_count !== undefined && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{grant.submission_count} submissions</span>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>
    </Link>
  )
}

export function GrantCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted" />
          <div>
            <div className="h-5 w-32 bg-muted" />
            <div className="h-4 w-20 bg-muted mt-1" />
          </div>
        </div>
        <div className="h-5 w-16 bg-muted" />
      </div>
      <div className="h-4 w-full bg-muted mt-4" />
      <div className="h-4 w-3/4 bg-muted mt-2" />
      <div className="h-14 w-full bg-muted mt-4" />
      <div className="flex justify-between mt-4 pt-4 border-t-2 border-black">
        <div className="h-4 w-24 bg-muted" />
        <div className="h-4 w-24 bg-muted" />
      </div>
    </Card>
  )
}
