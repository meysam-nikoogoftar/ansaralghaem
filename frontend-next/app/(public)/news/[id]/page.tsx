import type { Metadata } from 'next'
import { headers } from 'next/headers'
import AppLink from '@/components/navigation/app-link'
import MediaImage from '@/components/content/media-image'
import { getNewsDetail } from '@/lib/api/public'
import { formatDate, safeMediaPath } from '@/lib/urls'
import { jsonLd, pageMetadata, siteUrl, siteName } from '@/lib/seo'
type Props = { params: Promise<{ id: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsDetail((await params).id)
  return pageMetadata(news.title, `/news/${news.id}`, news.content, safeMediaPath(news.image))
}
export default async function NewsDetailPage({ params }: Props) {
  const news = await getNewsDetail((await params).id)
  const nonce = (await headers()).get('x-nonce') || undefined
  return (
    <article className="nd-page">
      <div className="nd-container">
        <AppLink href="/news" className="nd-back">
          ← برگشت به اخبار
        </AppLink>
        <MediaImage src={news.image} alt={news.title} hero className="nd-image" />
        <h1 className="nd-title">{news.title}</h1>
        <div className="nd-meta">
          <time dateTime={news.published_at || news.created_at}>
            {formatDate(news.published_at || news.created_at)}
          </time>
          <span>{news.views_count.toLocaleString('fa-IR')} بازدید</span>
        </div>
        <div className="nd-content">{news.content}</div>
      </div>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: news.title,
            datePublished: news.published_at || news.created_at,
            publisher: { '@type': 'Organization', name: siteName },
            mainEntityOfPage: new URL(`/news/${news.id}`, siteUrl).href,
            ...(safeMediaPath(news.image)
              ? { image: new URL(safeMediaPath(news.image)!, siteUrl).href }
              : {}),
          }),
        }}
      />
    </article>
  )
}
