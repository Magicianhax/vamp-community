import type { Metadata } from 'next'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { BackgroundAnimation } from '@/components/layout/BackgroundAnimation'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-head',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vamp.community'),
  title: {
    default: 'VAMP - The Vibecoding Community',
    template: '%s | VAMP',
  },
  description: 'Discover the best vibecoded projects, compete for grants, learn from curated resources, and connect with fellow makers.',
  keywords: ['vibecoding', 'vamp', 'projects', 'grants', 'community', 'developers', 'makers'],
  openGraph: {
    title: 'VAMP - The Vibecoding Community',
    description: 'Discover the best vibecoded projects, compete for grants, and connect with fellow makers.',
    type: 'website',
    siteName: 'VAMP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAMP - The Vibecoding Community',
    description: 'Discover the best vibecoded projects, compete for grants, and connect with fellow makers.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
        <AuthProvider>
          <BackgroundAnimation />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
