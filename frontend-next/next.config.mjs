import { fileURLToPath } from 'node:url'

function origin(value) {
  const url = new URL(value)
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error('Zone origins must be HTTP(S) origins without paths, queries or fragments')
  }
  return url.origin
}
const legacyOrigin = origin(process.env.LEGACY_ORIGIN || 'http://127.0.0.1:5173')
const apiOrigin = origin(process.env.API_ORIGIN || 'http://127.0.0.1:8000')

export default {
  poweredByHeader: false,
  turbopack: { root: fileURLToPath(new URL('..', import.meta.url)) },
  outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
  // Resolve metadata before streaming so missing content returns an HTTP 404.
  htmlLimitedBots: /.*/,
  images: {
    qualities: [60, 75],
    localPatterns: [
      ...['profiles', 'articles', 'news', 'gallery', 'sliders', 'products', 'timeline', 'contributions'].map(
        directory => ({ pathname: `/media/${directory}/**`, search: '' }),
      ),
      { pathname: '/brand-logo.png', search: '' },
      { pathname: '/home/**', search: '' },
    ],
    minimumCacheTTL: 60,
    maximumRedirects: 0,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
  // Django's API requires trailing slashes; preserve them to avoid redirect loops.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/.well-known/ai-catalog.json', destination: '/.well-known/ard.json' },
        { source: '/media/:path*', destination: `${apiOrigin}/media/:path*` },
      ],
      afterFiles: [],
      fallback: [{ source: '/:path*', destination: `${legacyOrigin}/:path*` }],
    }
  },
}
