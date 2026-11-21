import AppLink from '@/components/navigation/app-link'
import MediaImage from './media-image'
import { Icon } from '@/components/layout/icon'
import { categories } from '@/lib/content'
import type { Article } from '@/types'
export default function ArticleCard({
  article,
  priority = false,
}: {
  article: Article
  priority?: boolean
}) {
  return (
    <AppLink href={`/articles/${article.id}`} className="pa-card">
      {article.main_image ? (
        <MediaImage src={article.main_image} alt={article.title} priority={priority} />
      ) : (
        <div className="pa-card-placeholder">
          <Icon name="book" />
        </div>
      )}
      <div className="pa-card-body">
        <span className="pa-cat">{categories[article.category]}</span>
        <h2>{article.title}</h2>
        <p>{article.content.slice(0, 110)}…</p>
        <div className="pa-card-meta">
          <span>{article.author_name}</span>
          <span>{article.views_count.toLocaleString('fa-IR')} بازدید</span>
        </div>
      </div>
    </AppLink>
  )
}
