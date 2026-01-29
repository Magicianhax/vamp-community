'use client'

import { useState } from 'react'
import { GrantRow } from '@/components/cards'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'

export function GrantsTabs({ activeGrants, pastGrants }: { activeGrants: any[]; pastGrants: any[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active')

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeGrants.length})
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'outline'}
          onClick={() => setActiveTab('past')}
        >
          Past ({pastGrants.length})
        </Button>
      </div>

      {activeTab === 'active' ? (
        activeGrants.length > 0 ? (
          <div className="space-y-2">
            {activeGrants.map((grant: any, index: number) => (
              <GrantRow key={grant.id} grant={grant} rank={index + 1} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No active grants at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new opportunities
            </p>
          </Card>
        )
      ) : (
        pastGrants.length > 0 ? (
          <div className="space-y-2">
            {pastGrants.map((grant: any) => (
              <GrantRow key={grant.id} grant={grant} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No past grants</p>
          </Card>
        )
      )}
    </div>
  )
}
