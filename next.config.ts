import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    // A type error is a broken build. Never ship past one.
    ignoreBuildErrors: false,
  },
  // Next 16 no longer runs ESLint during `next build`. Linting is a separate
  // step, wired into `npm run check` and into CI in Phase 5.

  images: {
    // AVIF first, WebP as the fallback. Phase 2 adds the EU object storage host.
    formats: ['image/avif', 'image/webp'],
    // Matches the breakpoints in src/styles/tokens.css. A midrange Android on 4G
    // is the target device, so the small end of this list is the one that matters.
    deviceSizes: [390, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
