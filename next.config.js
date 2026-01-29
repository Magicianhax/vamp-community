/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: '**.google.com',
      },
      {
        protocol: 'https',
        hostname: 'favicon.vemetric.com',
      },
    ],
  },
  // Mark native modules as external for server-side rendering
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  // Ensure middleware runs on edge runtime for better cookie handling
  // This helps with Vercel serverless functions
}

module.exports = nextConfig
