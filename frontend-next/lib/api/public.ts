import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import {
  articleSchema,
  newsSchema,
  gallerySchema,
  announcementSchema,
  categorySchema,
  listOf,
} from '@/lib/contracts'
import { ApiError } from './errors'
import { backendHeaders } from '@/lib/server/config'

const apiOrigin = new URL(process.env.API_ORIGIN || 'http://127.0.0.1:8000').origin
const configuredTtl = Number(process.env.CONTENT_REVALIDATE_SECONDS ?? 60)
const contentTtl =
  Number.isInteger(configuredTtl) && configuredTtl >= 0 && configuredTtl <= 3600
    ? configuredTtl
    : 60

async function publicRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  revalidate: number | false = contentTtl,
): Promise<T> {
  const response = await fetch(`${apiOrigin}/api${path}`, {
    headers: backendHeaders(),
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
    ...(revalidate === false || revalidate === 0
      ? { cache: 'no-store' as const }
      : { next: { revalidate } }),
  })
  if (!response.ok) throw new ApiError(response.status)
  return schema.parse(await response.json())
}

export const getNews = cache(() => publicRequest('/content/news/', listOf(newsSchema)))
export const getArticles = cache((category = '') => {
  const selected = categorySchema.safeParse(category)
  return publicRequest(
    `/content/articles/${selected.success ? `?category=${selected.data}` : ''}`,
    listOf(articleSchema),
  )
})
export const getGallery = cache(() => publicRequest('/content/gallery/', listOf(gallerySchema)))
export const getAnnouncements = cache(() =>
  publicRequest('/content/announcements/', listOf(announcementSchema)).catch(() => []),
)

async function detail<T>(kind: 'news' | 'articles', id: string, schema: z.ZodType<T>): Promise<T> {
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound()
  try {
    // These Django GET endpoints increment views. Deduplicate within a render only.
    return await publicRequest(`/content/${kind}/${id}/`, schema, false)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
}
export const getNewsDetail = cache((id: string) => detail('news', id, newsSchema))
export const getArticleDetail = cache((id: string) => detail('articles', id, articleSchema))
