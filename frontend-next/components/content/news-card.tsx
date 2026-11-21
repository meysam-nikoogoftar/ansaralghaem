import AppLink from '@/components/navigation/app-link'
import MediaImage from './media-image'
import { formatDate } from '@/lib/urls'
import type { News } from '@/types'
export default function NewsCard({ item, priority = false }: { item: News; priority?: boolean }) {
  return (
    <AppLink href={`/news/${item.id}`} className="nw-card">
      <MediaImage src={item.image} alt={item.title} priority={priority} />
      <div className="nw-card-body">
        <h2>{item.title}</h2>
        <p>{item.content.slice(0, 130)}…</p>
        <div className="nw-card-meta">
          <time dateTime={item.published_at || item.created_at}>
            {formatDate(item.published_at || item.created_at)}
          </time>
          <span>{item.views_count.toLocaleString('fa-IR')} بازدید</span>
        </div>
      </div>
    </AppLink>
  )
}
