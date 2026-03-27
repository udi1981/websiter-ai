import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Pre-existing type errors in packages/ai (scanner types) — tracked for cleanup
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@ubuilder/ui', '@ubuilder/types', '@ubuilder/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
}

export default nextConfig
