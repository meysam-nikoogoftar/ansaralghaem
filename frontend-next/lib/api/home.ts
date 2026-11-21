import 'server-only'
import { z } from 'zod'
import { backendHeaders, backendOrigin } from '@/lib/server/config'
import { newsSchema, gallerySchema } from '@/lib/contracts'
import { safeMediaPath } from '@/lib/urls'
import { safeInternalHref } from '@/lib/navigation'
import type { HomeData } from '@/types/home'
const trip = z.object({
  id: z.number(),
  title: z.string(),
  is_active: z.boolean(),
  registration_open: z.boolean(),
  conditions: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  cost: z.number(),
})
const contribution = z.object({
  id: z.number(),
  is_active: z.boolean(),
  is_public: z.boolean(),
  progress_percent: z.number(),
  total_amount: z.number(),
})
const slide = z.object({
  id: z.number(),
  image: z.string(),
  title: z.string(),
  summary: z.string(),
  link: z.string(),
})
async function load<T>(path: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const response = await fetch(`${backendOrigin}/api${path}`, {
      headers: backendHeaders(),
      next: { revalidate: 60 },
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return null
    return schema.parse(await response.json())
  } catch {
    return null
  }
}
export async function getHomeData(): Promise<HomeData> {
  const [sliders, news, gallery, trips, contributions] = await Promise.all([
    load('/content/sliders/', z.array(slide)),
    load('/content/news/', z.array(newsSchema)),
    load('/content/gallery/', z.array(gallerySchema)),
    load('/trips/', z.array(trip)),
    load('/financial/contributions/', z.array(contribution)),
  ])
  return {
    sliders: (sliders || []).flatMap((s) => {
      const image = safeMediaPath(s.image)
      return image ? [{ ...s, image, link: safeInternalHref(s.link) }] : []
    }),
    news: (news || []).slice(0, 3).map((n) => ({ ...n, image: safeMediaPath(n.image) })),
    gallery: (gallery || []).slice(0, 8).flatMap((g) => {
      const image = safeMediaPath(g.image)
      return image ? [{ ...g, image, category: g.category || 'all', featured: false }] : []
    }),
    trips: (trips || []).filter((t) => t.is_active),
    contributions: (contributions || []).filter((c) => c.is_active && c.is_public).slice(0, 1),
  }
}
