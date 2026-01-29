'use client'

import { useState } from 'react'
import { Container } from '@/components/layout'
import { Accordion } from '@/components/retroui/Accordion'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import { HelpCircle, Coins, Trophy, Users } from 'lucide-react'

const faqSections = [
  {
    icon: HelpCircle,
    title: 'General Questions',
    items: [
      {
        q: 'What is Vamp?',
        a: 'Vamp is a community-driven platform for vibecoding. We provide a space where people can learn to build with AI tools, showcase projects, and earn funding through grants.',
      },
      {
        q: 'What is "Vibecoding"?',
        a: 'Vibecoding is building software using AI tools. It enables 1-2 people to replicate what previously required millions in VC funding—often in just a weekend.',
      },
      {
        q: 'Who is behind this?',
        a: (
          <>
            Started by <a href="https://x.com/KSimback" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Kevin Simback</a> following a viral post about vibecoding. While Kevin Simback didn't create the token, they use assigned trading fees to fund community grants.
          </>
        ),
      },
    ],
  },
  {
    icon: Coins,
    title: '$VAMP Token',
    items: [
      {
        q: 'What is the $VAMP Contract Address?',
        a: (
          <>
            Official CA: <code className="px-2 py-1 bg-muted rounded text-foreground font-mono text-sm border-2 border-black">BFuy9AJYKekZ2hik7b5mPhsunGscegi9vPY2bwzzBAGS</code>
            <br />
            <span className="text-sm text-muted-foreground mt-1 block">Always verify to avoid scams.</span>
          </>
        ),
      },
      {
        q: 'Does Kevin Simback own $VAMP?',
        a: (
          <>
            No. <a href="https://x.com/KSimback" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Kevin Simback</a> did not create the token, does not hold any, and has never held it. They were assigned as fee collector and use those fees for grants.
          </>
        ),
      },
      {
        q: 'What is the utility of $VAMP?',
        a: 'Trading fees fund the grant program. Any future utility would be community-built. Speculate at your own risk.',
      },
    ],
  },
  {
    icon: Trophy,
    title: 'Vamp Grants',
    items: [
      {
        q: 'How are grants funded?',
        a: 'Grants are funded by $VAMP token trading fees. As fees accumulate, more grants are announced.',
      },
      {
        q: 'How do I apply?',
        a: (
          <>
            Watch <a href="https://x.com/KSimback" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Kevin Simback's X</a> for announcement posts. When the window opens (typically 48 hours), reply with: a short pitch, public app link, and GitHub repo link.
          </>
        ),
      },
      {
        q: 'What are the instant disqualification rules?',
        a: (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Missing required submission links</li>
            <li>Including a "Connect Wallet" feature</li>
            <li>(Crypto grants) Launching on Mainnet—Testnets only</li>
          </ul>
        ),
      },
    ],
  },
  {
    icon: Users,
    title: 'Community & Support',
    items: [
      {
        q: 'Is there a Discord or Telegram?',
        a: (
          <>
            Not currently. The project is built "one step at a time" to stay focused. Join the <a href="https://x.com/i/communities/2014384033216553220" target="_blank" rel="noopener noreferrer" className="text-primary font-medium">Vamp Community</a> on X for updates and discussions.
          </>
        ),
      },
      {
        q: 'Can I get feedback on my grant idea?',
        a: (
          <>
            To keep the process fair, <a href="https://x.com/KSimback" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">Kevin Simback</a> does not respond to DMs or pings for input. Build it and submit when the grant post goes live.
          </>
        ),
      },
    ],
  },
]

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`
    setOpenItem((prev) => (prev === key ? null : key))
  }

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Text as="h1" className="text-4xl font-head font-bold mb-4">Frequently Asked Questions</Text>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Vamp, vibecoding, and grants
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {faqSections.map((section, sectionIdx) => {
            const Icon = section.icon
            return (
              <Card key={sectionIdx}>
                <Card.Header>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <Text as="h2" className="text-2xl font-head font-bold">{section.title}</Text>
                  </div>
                </Card.Header>
                <Card.Content>
                  <Accordion type="single" collapsible className="space-y-2">
                    {section.items.map((item, itemIdx) => {
                      const key = `${sectionIdx}-${itemIdx}`
                      return (
                        <Accordion.Item key={itemIdx} value={key}>
                          <Accordion.Header>
                            <Text as="h3" className="text-lg font-head font-semibold pr-4">
                              {item.q}
                            </Text>
                          </Accordion.Header>
                          <Accordion.Content>
                            <div className="text-muted-foreground leading-relaxed">
                              {item.a}
                            </div>
                          </Accordion.Content>
                        </Accordion.Item>
                      )
                    })}
                  </Accordion>
                </Card.Content>
              </Card>
            )
          })}
        </div>

        {/* Footer CTA */}
        <Card className="mt-12">
          <Card.Content className="text-center p-8">
            <Text as="h3" className="text-xl font-head font-bold mb-2">Still have questions?</Text>
            <p className="text-muted-foreground mb-4">
              Join the <a href="https://x.com/i/communities/2014384033216553220" target="_blank" rel="noopener noreferrer" className="text-primary font-medium">Vamp Community</a> on X for support and updates
            </p>
          </Card.Content>
        </Card>
      </div>
    </Container>
  )
}
