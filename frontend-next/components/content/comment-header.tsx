import MediaImage from './media-image'
import { formatDate } from '@/lib/urls'
import type { ArticleComment } from '@/types'
export default function CommentHeader({
  comment,
}: {
  comment: ArticleComment | ArticleComment['replies'][number]
}) {
  return (
    <>
      <div className="ad-comment-head">
        {comment.user_image ? (
          <MediaImage src={comment.user_image} alt="" className="ad-comment-avatar" sizes="32px" />
        ) : (
          <div className="ad-comment-avatar-fallback">{comment.user_name[0] || '؟'}</div>
        )}
        <div>
          <p className="ad-comment-name">{comment.user_name}</p>
          <time className="ad-comment-date" dateTime={comment.created_at}>
            {formatDate(comment.created_at)}
          </time>
        </div>
      </div>
      <p className="ad-comment-text">{comment.text}</p>
    </>
  )
}
