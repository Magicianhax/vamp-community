import Link from 'next/link'
import { Trophy, Calendar, Coins } from 'lucide-react'
import { Card } from '@/components/retroui/Card'
import { formatTimeLeft, cn } from '@/lib/utils'
import { extractTwitterHandle } from '@/lib/utils/twitter'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import type { Grant } from '@/types'

export interface GrantRowProps {
  grant: Grant
  rank?: number
}

export function GrantRow({ grant, rank }: GrantRowProps) {
  const timeLeft = formatTimeLeft(grant.deadline)

  return (
    <Link href={`/grants/${grant.id}`} className="block w-full">
      <Card className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 w-full box-border overflow-hidden">
        {rank != null && (
          <span className="w-5 sm:w-8 flex-shrink-0 text-sm sm:text-lg font-head font-bold tabular-nums text-muted-foreground sm:text-foreground">
            {rank}.
          </span>
        )}

        <div className="flex-shrink-0">
          {grant.sponsor_logo_url ? (
            <TwitterAvatar
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md flex-shrink-0"
              src={grant.sponsor_logo_url}
              alt={grant.sponsor_name}
              twitterHandle={extractTwitterHandle(grant.sponsor_twitter_url)}
            />
          ) : grant.creator ? (
            <TwitterAvatar
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md flex-shrink-0"
              src={grant.creator.avatar_url}
              alt={grant.creator.display_name || grant.creator.username}
              twitterHandle={grant.creator.twitter_handle}
              userId={grant.creator.id}
            />
          ) : grant.sponsor_twitter_url ? (
            <TwitterAvatar
              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md flex-shrink-0"
              src={null}
              alt={grant.sponsor_name}
              twitterHandle={extractTwitterHandle(grant.sponsor_twitter_url)}
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md bg-primary flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-head font-semibold text-sm sm:text-base line-clamp-1 truncate">
            {grant.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {grant.short_description || grant.sponsor_name}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-nowrap min-w-0">
          {grant.prize_amount && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-black rounded shadow-md bg-card box-border flex-shrink-0 whitespace-nowrap">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-head font-semibold whitespace-nowrap">{grant.prize_amount}</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded shadow-md bg-card box-border flex-shrink-0 whitespace-nowrap">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className={cn(
              'text-xs whitespace-nowrap',
              timeLeft.isExpired && 'text-destructive',
              timeLeft.isUrgent && !timeLeft.isExpired && 'text-orange-600 font-semibold'
            )}>
              {timeLeft.text}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
