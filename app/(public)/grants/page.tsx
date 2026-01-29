import { Container } from '@/components/layout'
import { GrantRow } from '@/components/cards'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { GrantsTabs } from '@/components/grants/GrantsTabs'
import { createClient } from '@/lib/supabase/server'

async function getGrants() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('grants')
    .select('*, creator:users!grants_created_by_fkey(*)')
    .in('status', ['active', 'closed', 'completed'])
    .order('created_at', { ascending: false })

  return (data || []) as any[]
}

export default async function GrantsPage() {
  const grants = await getGrants()

  const activeGrants = grants.filter((g: any) => g.status === 'active')
  const pastGrants = grants.filter((g: any) => g.status !== 'active')

  return (
    <Container className="py-6 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <Text as="h1" className="text-2xl sm:text-3xl font-head font-bold">Grants</Text>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Submit your vibecoded projects and compete for rewards
        </p>
      </div>

      <GrantsTabs activeGrants={activeGrants} pastGrants={pastGrants} />
    </Container>
  )
}
