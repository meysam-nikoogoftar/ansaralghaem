import type { Metadata } from 'next'
import { getNews } from '@/lib/api/public'
import { pageMetadata } from '@/lib/seo'
import PageHeading from '@/components/content/page-heading'
import NewsCard from '@/components/content/news-card'
export const metadata: Metadata = pageMetadata(
  'اخبار و اطلاعیه‌ها',
  '/news',
  'آخرین اخبار و اطلاعیه‌های هیئت دانشجویی انصار القائم (عج)',
)
export default async function NewsPage() {
  const news = await getNews()
  return (
    <div className="nw-page">
      <div className="container">
        <PageHeading className="nw-head" title="اخبار و اطلاعیه‌ها" />
        {news.length ? (
          <div className="nw-grid">
            {news.map((item, index) => (
              <NewsCard key={item.id} item={item} priority={index === 0} />
            ))}
          </div>
        ) : (
          <p className="nw-empty">خبری وجود ندارد</p>
        )}
      </div>
    </div>
  )
}
