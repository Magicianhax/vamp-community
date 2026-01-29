import { Container } from '@/components/layout'
import { Text } from '@/components/retroui/Text'
import { Button } from '@/components/retroui/Button'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16">
      <Container size="md">
        <Text as="h1" className="text-4xl font-head font-bold mb-8">Privacy Policy</Text>
        
        <p className="text-muted-foreground mb-6">
          Last updated: January 2026
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">1. Information We Collect</Text>
        <p className="text-muted-foreground mb-4">
          When you use Vamp, we may collect the following information:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>Account information from X (Twitter) when you sign in</li>
          <li>Profile information you provide (username, bio, avatar)</li>
          <li>Projects and content you submit</li>
          <li>Usage data and analytics</li>
        </ul>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">2. How We Use Your Information</Text>
        <p className="text-muted-foreground mb-4">
          We use your information to:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>Provide and maintain our service</li>
          <li>Display your profile and projects to other users</li>
          <li>Process grant submissions</li>
          <li>Communicate with you about your account</li>
          <li>Improve our platform</li>
        </ul>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">3. Information Sharing</Text>
        <p className="text-muted-foreground mb-4">
          We do not sell your personal information. We may share your information only:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
        </ul>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">4. Data Security</Text>
        <p className="text-muted-foreground mb-4">
          We implement appropriate security measures to protect your personal information. 
          However, no method of transmission over the Internet is 100% secure.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">5. Third-Party Services</Text>
        <p className="text-muted-foreground mb-4">
          We use third-party services including:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
          <li>X (Twitter) for authentication</li>
          <li>Supabase for data storage</li>
        </ul>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">6. Your Rights</Text>
        <p className="text-muted-foreground mb-4">
          You have the right to access, update, or delete your personal information. 
          You can manage your account settings or contact us for assistance.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">7. Changes to This Policy</Text>
        <p className="text-muted-foreground mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any 
          changes by posting the new policy on this page.
        </p>

        <Text as="h2" className="text-xl font-head font-semibold mt-8 mb-4">8. Contact</Text>
        <p className="text-muted-foreground mb-4">
          If you have any questions about this Privacy Policy, please contact us.
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
