import type { Metadata } from 'next'
export const siteName = 'هیئت انصار القائم (عج)'
export const siteUrl = new URL(process.env.SITE_URL || 'http://127.0.0.1:3000')
if (
  !['http:', 'https:'].includes(siteUrl.protocol) ||
  siteUrl.username ||
  siteUrl.password ||
  siteUrl.pathname !== '/' ||
  siteUrl.search ||
  siteUrl.hash
)
  throw new Error('SITE_URL must be an HTTP(S) origin')

export function pageMetadata(
  title: string,
  path: string,
  description: string,
  image?: string | null,
): Metadata {
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName,
      title,
      description: description.slice(0, 160),
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: description.slice(0, 160),
    },
  }
}

export function jsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
