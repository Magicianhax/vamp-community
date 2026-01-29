'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Badge } from '@/components/retroui/Badge'
import { Coins, TrendingUp, Wallet, RefreshCw } from 'lucide-react'
import { Button } from '@/components/retroui/Button'

interface FeeData {
  lifetimeFees: number
  totalClaimed: number
  unclaimed: number
  claimStats: Array<{
    wallet: string
    username?: string
    provider?: string
    pfp?: string
    isCreator: boolean
    royaltyBps: number
    totalClaimed: number
  }>
}

export function FeeTracker() {
  const [feeData, setFeeData] = useState<FeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchFees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/bags/fees')
      const result = await response.json()
      
      if (result.success && result.data) {
        setFeeData(result.data)
        setLastUpdated(new Date())
      } else {
        setError(result.error || 'Failed to fetch fee data')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fee data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchFees, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !feeData) {
    return (
      <Card>
        <Card.Header>
          <Text as="h2" className="text-lg font-head font-semibold">Fee Tracking</Text>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading fee data...</span>
          </div>
        </Card.Content>
      </Card>
    )
  }

  if (error && !feeData) {
    return (
      <Card>
        <Card.Header>
          <Text as="h2" className="text-lg font-head font-semibold">Fee Tracking</Text>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={fetchFees} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card.Content>
      </Card>
    )
  }

  if (!feeData) return null

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Text as="h2" className="text-lg font-head font-semibold">Fee Tracking</Text>
          <Button
            onClick={fetchFees}
            size="sm"
            variant="ghost"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </Card.Header>
      <Card.Content className="space-y-4">
        {/* Fee Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-black rounded shadow-md bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-primary" />
              <Text as="h3" className="text-xs font-head font-medium text-muted-foreground">
                All-Time Fees
              </Text>
            </div>
            <Text as="p" className="text-xl font-head font-bold">
              {feeData.lifetimeFees.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{' '}
              <span className="text-sm text-muted-foreground">SOL</span>
            </Text>
          </div>

          <div className="p-4 border-2 border-black rounded shadow-md bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <Text as="h3" className="text-xs font-head font-medium text-muted-foreground">
                Claimed
              </Text>
            </div>
            <Text as="p" className="text-xl font-head font-bold">
              {feeData.totalClaimed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{' '}
              <span className="text-sm text-muted-foreground">SOL</span>
            </Text>
          </div>

          <div className="p-4 border-2 border-black rounded shadow-md bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-orange-600" />
              <Text as="h3" className="text-xs font-head font-medium text-muted-foreground">
                Unclaimed
              </Text>
            </div>
            <Text as="p" className="text-xl font-head font-bold">
              {feeData.unclaimed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{' '}
              <span className="text-sm text-muted-foreground">SOL</span>
            </Text>
          </div>
        </div>

        {/* Claim Progress */}
        {feeData.lifetimeFees > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Text as="h3" className="text-sm font-head font-medium">Claim Progress</Text>
              <span className="text-xs text-muted-foreground">
                {((feeData.totalClaimed / feeData.lifetimeFees) * 100).toFixed(1)}% claimed
              </span>
            </div>
            <div className="w-full h-3 bg-muted border-2 border-black rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.min((feeData.totalClaimed / feeData.lifetimeFees) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Claim Stats by User */}
        {feeData.claimStats.length > 0 && (
          <div>
            <Text as="h3" className="text-sm font-head font-medium mb-3">Claims by User</Text>
            <div className="space-y-2">
              {feeData.claimStats
                .sort((a, b) => b.totalClaimed - a.totalClaimed)
                .slice(0, 5)
                .map((stat, index) => (
                  <div
                    key={stat.wallet}
                    className="flex items-center justify-between p-2 border-2 border-black rounded shadow-sm bg-card"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-head font-medium text-muted-foreground w-4">
                        {index + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <Text as="p" className="text-sm font-head font-medium truncate">
                          {stat.username || stat.wallet.slice(0, 8) + '...'}
                        </Text>
                        {stat.isCreator && (
                          <Badge variant="surface" size="sm" className="mt-0.5">
                            Creator
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Text as="p" className="text-sm font-head font-semibold ml-2">
                      {stat.totalClaimed.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}{' '}
                      SOL
                    </Text>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
