'use client'

import { useState } from 'react'
import { Container } from '@/components/layout'
import { TokenChart } from '@/components/token/TokenChart'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import { ExternalLink, Copy, CheckCircle2, Coins, Users, DollarSign } from 'lucide-react'
import { FeeTracker } from '@/components/token/FeeTracker'

const CONTRACT_ADDRESS = 'BFuy9AJYKekZ2hik7b5mPhsunGscegi9vPY2bwzzBAGS'

export default function VampTokenPage() {
  return (
    <Container className="py-6 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black shadow-md bg-primary flex items-center justify-center">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <Text as="h1" className="text-2xl sm:text-3xl font-head font-bold">$VAMP Token</Text>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">The Vibecoding Community Token</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fee Tracking */}
            <FeeTracker />

            {/* Chart */}
            <Card>
              <Card.Header>
                <Text as="h2" className="text-lg font-head font-semibold">Price Chart</Text>
              </Card.Header>
              <Card.Content>
                <TokenChart />
              </Card.Content>
            </Card>

            {/* Token Details */}
            <Card>
              <Card.Header>
                <Text as="h2" className="text-lg font-head font-semibold">Token Information</Text>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div>
                  <Text as="h3" className="text-sm font-head font-medium text-muted-foreground mb-2">Contract Address</Text>
                  <ContractAddress address={CONTRACT_ADDRESS} />
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t-2 border-black">
                  <div>
                    <Text as="h3" className="text-sm font-head font-medium text-muted-foreground mb-1">Network</Text>
                    <Badge variant="default" size="md">Solana</Badge>
                  </div>
                  <div>
                    <Text as="h3" className="text-sm font-head font-medium text-muted-foreground mb-1">Standard</Text>
                    <Badge variant="default" size="md">SPL Token</Badge>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Utility */}
            <Card>
              <Card.Header>
                <Text as="h2" className="text-lg font-head font-semibold">Token Utility</Text>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <Text as="h3" className="font-head font-medium mb-1">Grant Funding</Text>
                      <p className="text-sm text-muted-foreground">
                        Trading fees from $VAMP transactions are collected and used to fund community grants for vibecoded projects.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <Text as="h3" className="font-head font-medium mb-1">Community-Driven</Text>
                      <p className="text-sm text-muted-foreground">
                        The token supports the vibecoding community by providing a sustainable funding mechanism for builders and creators.
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Important Notice */}
            <Card>
              <Card.Header>
                <Text as="h2" className="text-lg font-head font-semibold">Important Notice</Text>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">
                      <a href="https://x.com/KSimback" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Kevin Simback</a> does not own $VAMP.
                    </strong> They did not create the token, do not hold any tokens, and have never held any tokens. Kevin Simback was assigned as the fee collector and uses those fees exclusively for community grants.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Always verify the contract address before trading to avoid scams. The official contract address is displayed above.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Trading cryptocurrencies involves risk. Please do your own research and only invest what you can afford to lose.
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <Card.Header>
                <Text as="h3" className="text-sm font-head font-medium">Quick Links</Text>
              </Card.Header>
              <Card.Content className="space-y-2">
                <a
                  href={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on DexScreener
                  </Button>
                </a>
                <a
                  href={`https://solscan.io/token/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Solscan
                  </Button>
                </a>
                <a
                  href={`https://www.birdeye.so/token/${CONTRACT_ADDRESS}?chain=solana`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Birdeye
                  </Button>
                </a>
              </Card.Content>
            </Card>

            {/* FAQ Link */}
            <Card>
              <Card.Content className="p-4">
                <Text as="h3" className="text-sm font-head font-medium mb-2">Have Questions?</Text>
                <p className="text-sm text-muted-foreground mb-3">
                  Check out our FAQ for more information about $VAMP and the grant program.
                </p>
                <a href="/faq">
                  <Button variant="default" className="w-full" size="sm">
                    View FAQ
                  </Button>
                </a>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  )
}

function ContractAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 border-2 border-black rounded shadow-md bg-card">
      <code className="flex-1 font-mono text-sm break-all">{address}</code>
      <button
        onClick={copyToClipboard}
        className="flex-shrink-0 p-2 border-2 border-black rounded shadow-md bg-card hover:bg-muted"
        title="Copy address"
      >
        {copied ? (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
