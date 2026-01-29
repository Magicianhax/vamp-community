'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'
import { Text } from '@/components/retroui/Text'
import { Alert } from '@/components/retroui/Alert'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleXSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container size="sm">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 border-2 border-black shadow-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-head font-bold text-xl">V</span>
              </div>
              <Text as="h1" className="font-head font-bold text-2xl">VAMP</Text>
            </Link>
            <Text as="h2" className="text-2xl font-head font-bold mb-2">Welcome to VAMP</Text>
            <p className="text-muted-foreground">
              Sign in to join the vibecoding community
            </p>
          </div>

          {/* Sign in card */}
          <Card>
            <Card.Content className="p-6 space-y-4">
              {error && (
                <Alert variant="default">
                  {error}
                </Alert>
              )}

              <Button
                type="button"
                onClick={handleXSignIn}
                disabled={isLoading}
                variant="secondary"
                size="lg"
                className="w-full flex items-center justify-center gap-3 h-12"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Continue with X</span>
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </Card.Content>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground underline">
              Back to home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
