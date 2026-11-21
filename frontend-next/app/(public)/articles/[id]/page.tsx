import type { Metadata } from 'next'
import { headers } from 'next/headers'
import AppLink from '@/components/navigation/app-link'
import MediaImage from '@/components/content/media-image'
import ArticleInteractions from '@/components/content/article-interactions'
import { getArticleDetail } from '@/lib/api/public'
import { formatDate, safeAparatLink, safeMediaPath } from '@/lib/urls'
import { jsonLd, pageMetadata, siteUrl } from '@/lib/seo'
import { categories } from '@/lib/content'
type Props = { params: Promise<{ id: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleDetail((await params).id)
  return pageMetadata(
    article.title,
    `/articles/${article.id}`,
    article.content,
    safeMediaPath(article.main_image),
  )
}
export default async function ArticleDetailPage({ params }: Props) {
  const article = await getArticleDetail((await params).id)
  const nonce = (await headers()).get('x-nonce') || undefined
  const aparat = safeAparatLink(article.aparat_link)
  const extraImages = [article.extra_image1, article.extra_image2, article.extra_image3].filter(
    (image): image is string => Boolean(image),
  )
  return (
    <article className="ad-page">
      <div className="ad-container">
        <AppLink href="/articles" className="ad-back">
          ← برگشت به دلنوشته‌ها
        </AppLink>
        <MediaImage src={article.main_image} alt={article.title} hero className="ad-image" />
        <span className="ad-cat">{categories[article.category]}</span>
        <h1 className="ad-title">{article.title}</h1>
        <div className="ad-meta">
          <span>{article.author_name}</span>
          <time dateTime={article.created_at}>{formatDate(article.created_at)}</time>
          <span>{article.views_count.toLocaleString('fa-IR')} بازدید</span>
        </div>
        <div className="ad-content">{article.content}</div>
        {aparat && (
          <a href={aparat} target="_blank" rel="noopener noreferrer" className="ad-aparat">
            مشاهده کلیپ در آپارات
          </a>
        )}
        {extraImages.length > 0 && (
          <div className="ad-extra-images">
            {extraImages.map((image, index) => (
              <MediaImage
                key={image}
                src={image}
                alt={`${article.title}؛ تصویر ${index + 1}`}
                sizes="120px"
              />
            ))}
          </div>
        )}
        <ArticleInteractions articleId={article.id} />
      </div>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            datePublished: article.created_at,
            author: { '@type': 'Person', name: article.author_name },
            mainEntityOfPage: new URL(`/articles/${article.id}`, siteUrl).href,
          }),
        }}
      />
    </article>
  )
}
