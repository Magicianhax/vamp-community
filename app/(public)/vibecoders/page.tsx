import { Container } from '@/components/layout'
import { UserCard } from '@/components/cards'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { createClient } from '@/lib/supabase/server'

async function getVibecoders() {
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
    .order('created_at', { ascending: false })

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

  return usersWithCounts.sort((a, b) => b.projectCount - a.projectCount)
}

export default async function VibecodersPage() {
  const vibecoders = await getVibecoders()

  return (
    <Container className="py-12">
      <div className="mb-8">
        <Text as="h1" className="text-3xl font-head font-bold">Vibecoders</Text>
        <p className="text-muted-foreground mt-2">
          Discover talented builders in the vibecoding community
        </p>
      </div>

      {vibecoders.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vibecoders.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              projectCount={user.projectCount}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No vibecoders yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to submit a project!
          </p>
        </Card>
      )}
    </Container>
  )
}
