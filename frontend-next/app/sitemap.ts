import type { MetadataRoute } from 'next'
import { getArticles, getNews } from '@/lib/api/public'
import { getProducts } from '@/lib/api/commerce'
import { siteUrl } from '@/lib/seo'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, news, products] = await Promise.all([getArticles(), getNews(), getProducts()])
  return [
    ...products.map((product) => ({ url: new URL(`/shop/${product.id}`, siteUrl).href })),
    ...['/', '/shop', '/news', '/articles', '/gallery'].map((path) => ({
      url: new URL(path, siteUrl).href,
    })),
    ...articles.map((article) => ({
      url: new URL(`/articles/${article.id}`, siteUrl).href,
      lastModified: article.created_at,
    })),
    ...news.map((item) => ({
      url: new URL(`/news/${item.id}`, siteUrl).href,
      lastModified: item.published_at || item.created_at,
    })),
  ]
}
