import Link from 'next/link'
import { Container } from './Container'
import { Button } from '@/components/retroui/Button'
import { Text } from '@/components/retroui/Text'

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t-2 border-black bg-background">
      <Container>
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Logo + Copyright */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-head font-bold text-sm">V</span>
              </div>
              <Text as="span" className="font-head font-bold text-lg">Vamp</Text>
            </Link>
            <Text as="span" className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()}
            </Text>
          </div>

          {/* Right: Links + CTA */}
          <div className="flex items-center gap-6">
            <Link href="/faq">
              <Button variant="link" size="sm">FAQ</Button>
            </Link>
            <Link href="/terms">
              <Button variant="link" size="sm">Terms</Button>
            </Link>
            <Link href="/privacy">
              <Button variant="link" size="sm">Privacy</Button>
            </Link>
            <a
              href="https://x.com/i/communities/2014384033216553220"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="flex items-center gap-2">
                <XIcon className="w-4 h-4" />
                Join Community
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
