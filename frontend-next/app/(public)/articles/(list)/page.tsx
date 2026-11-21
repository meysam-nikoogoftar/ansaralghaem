import type { Metadata } from 'next'
import AppLink from '@/components/navigation/app-link'
import PageHeading from '@/components/content/page-heading'
import ArticleCard from '@/components/content/article-card'
import { categorySchema } from '@/lib/contracts'
import { getArticles } from '@/lib/api/public'
import { pageMetadata } from '@/lib/seo'
import { categories } from '@/lib/content'
type Props = { searchParams: Promise<{ category?: string | string[] }> }
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const selected = categorySchema.safeParse((await searchParams).category)
  return {
    ...pageMetadata(
      'دلنوشته‌ها و خاطرات',
      '/articles',
      'دلنوشته، خاطره، مناجات و کلیپ‌های مداحی و مولودی ارسالی زائرین و اعضای هیئت',
    ),
    ...(selected.success ? { robots: { index: false, follow: true } } : {}),
  }
}
export default async function ArticlesPage({ searchParams }: Props) {
  const selected = categorySchema.safeParse((await searchParams).category)
  const category = selected.success ? selected.data : ''
  const articles = await getArticles(category)
  return (
    <div className="pa-page">
      <div className="container">
        <PageHeading
          className="pa-head"
          title="دلنوشته‌ها و خاطرات"
          description="دلنوشته، خاطره، مناجات و کلیپ‌های مداحی و مولودی ارسالی زائرین و اعضای هیئت"
        />
        <nav className="pa-tabs" aria-label="دسته‌بندی دلنوشته‌ها">
          {Object.entries({ '': 'همه', ...categories }).map(([value, label]) => (
            <AppLink
              key={value}
              href={value ? `/articles?category=${value}` : '/articles'}
              className={`pa-tab${category === value ? ' active' : ''}`}
              aria-current={category === value ? 'page' : undefined}
            >
              {label}
            </AppLink>
          ))}
        </nav>
        {articles.length ? (
          <div className="pa-grid">
            {articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} priority={index === 0} />
            ))}
          </div>
        ) : (
          <p className="pa-empty">دلنوشته‌ای یافت نشد</p>
        )}
      </div>
    </div>
  )
}
