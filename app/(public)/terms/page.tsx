import { Container } from '@/components/layout'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16">
      <Container size="md">
        <Text as="h1" className="text-4xl font-head font-bold mb-8">Terms of Service</Text>
        
        <p className="text-muted-foreground mb-6">
          Last updated: January 2026
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">1. Acceptance of Terms</Text>
        <p className="text-muted-foreground mb-4">
          By accessing and using Vamp, you accept and agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our service.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">2. Description of Service</Text>
        <p className="text-muted-foreground mb-4">
          Vamp is a community platform for vibecoding enthusiasts to showcase projects, 
          participate in grants, and connect with other developers.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">3. User Accounts</Text>
        <p className="text-muted-foreground mb-4">
          You are responsible for maintaining the confidentiality of your account and for all 
          activities that occur under your account. You agree to notify us immediately of any 
          unauthorized use of your account.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">4. User Content</Text>
        <p className="text-muted-foreground mb-4">
          You retain ownership of any content you submit to Vamp. By submitting content, 
          you grant us a non-exclusive license to display and distribute your content on our platform.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">5. Prohibited Conduct</Text>
        <p className="text-muted-foreground mb-4">
          You agree not to use Vamp for any unlawful purpose or in any way that could damage, 
          disable, or impair the service.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">6. Disclaimer</Text>
        <p className="text-muted-foreground mb-4">
          Vamp is provided "as is" without warranties of any kind. We do not guarantee that 
          the service will be uninterrupted or error-free.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">7. Contact</Text>
        <p className="text-muted-foreground mb-4">
          If you have any questions about these Terms, please contact us.
        </p>

        <div className="mt-12">
          <Link href="/">
            <Button variant="link" size="sm">← Back to Home</Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
