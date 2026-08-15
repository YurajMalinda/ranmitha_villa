import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  serverExternalPackages: ['mongoose', 'nodemailer', 'puppeteer-core', '@sparticuz/chromium-min', 'puppeteer'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Clickjacking. Without these the admin panel can be framed and an
          // authenticated admin tricked into clicking a destructive control —
          // SameSite=Strict does not help, because the frame is same-site to
          // itself. frame-ancestors is the modern control; X-Frame-Options
          // covers browsers that ignore it.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },

          // Stop the browser guessing a content type, which is how an uploaded
          // file gets treated as script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Password-reset links carry a token in the query string; this keeps
          // the full URL out of the Referer on cross-origin navigations.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // No feature on this site needs these.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

          // 2 years. `preload` is deliberately omitted — submitting to the
          // preload list is painful to undo.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ]
  },
}

export default nextConfig
