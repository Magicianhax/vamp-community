import Link from 'next/link'
import { Twitter, Github, Globe } from 'lucide-react'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Badge } from '@/components/retroui/Badge'
import type { User } from '@/types'

export interface UserCardProps {
  user: User
  projectCount?: number
  className?: string
}

export function UserCard({ user, projectCount = 0, className }: UserCardProps) {
  return (
    <Link href={`/u/${user.username}`}>
      <Card className={className}>
        <Card.Content className="text-center">
          <TwitterAvatar
            className="mx-auto w-16 h-16"
            src={user.avatar_url}
            alt={user.display_name || user.username}
            twitterHandle={user.twitter_handle}
            userId={user.id}
          />
          <Text as="h3" className="font-head font-semibold mt-4">
            {user.display_name || user.username}
          </Text>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {user.bio}
            </p>
          )}
          <div className="mt-4 flex items-center justify-center gap-4">
            {user.twitter_handle && (
              <a
                href={`https://x.com/${user.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {user.github_handle && (
              <a
                href={`https://github.com/${user.github_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
          {projectCount > 0 && (
            <div className="mt-4">
              <Badge variant="default" size="sm">
                {projectCount} project{projectCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </Card.Content>
      </Card>
    </Link>
  )
}

export function UserCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="text-center">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
        <div className="h-5 w-24 bg-muted mx-auto mt-4" />
        <div className="h-4 w-16 bg-muted mx-auto mt-2" />
      </div>
    </Card>
  )
}
