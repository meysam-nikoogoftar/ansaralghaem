'use client'
import type { FormEvent } from 'react'
import { FormControl, FormValidation } from '@/components/ui/forms'
import { LoadFeedback } from '@/components/ui/load-feedback'
import useArticleInteractions from '@/hooks/use-article-interactions'
import CommentHeader from './comment-header'
import type { Reactions } from '@/types'

const reactions: { key: keyof Reactions; icon: string; label: string }[] = [
  { key: 'heart', icon: '❤️', label: 'قلب' },
  { key: 'pray', icon: '🤲', label: 'دعا' },
  { key: 'cry', icon: '😢', label: 'اشک' },
  { key: 'rose', icon: '🌹', label: 'گل' },
]

export default function ArticleInteractions({ articleId }: { articleId: number }) {
  const {
    status,
    commentText,
    setCommentText,
    replyText,
    setReplyText,
    replyingTo,
    setReplyingTo,
    myReaction,
    pending,
    message,
    errors,
    interaction,
    run,
  } = useArticleInteractions(articleId)
  const submitComment = (event: FormEvent) => {
    event.preventDefault()
    void run({ type: 'comment' })
  }
  const disabled = pending || status === 'checking'
  return (
    <FormValidation errors={errors}>
      <div className="ad-reactions" aria-busy={pending}>
        {reactions.map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            aria-pressed={myReaction === key}
            aria-label={`واکنش ${label}`}
            className={`ad-reaction-btn${myReaction === key ? ' active' : ''}`}
            onClick={() => void run({ type: 'reaction', reaction: key })}
          >
            <span aria-hidden="true">{icon}</span>
            <span>{interaction.data?.counts[key] ?? 0}</span>
          </button>
        ))}
      </div>
      <p role="status" className="field-hint">
        {pending ? 'در حال ارسال…' : message}
      </p>
      {interaction.isPending && <LoadFeedback />}
      {interaction.isError && (
        <LoadFeedback
          message="دریافت نظرات و واکنش‌ها انجام نشد."
          onRetry={() => void interaction.refetch()}
        />
      )}
      <section className="ad-comments" aria-label="نظرات">
        <h2>نظرات ({interaction.data?.comments.length ?? 0})</h2>
        <form onSubmit={submitComment} className="ad-comment-form">
          <FormControl
            as="textarea"
            label="نظر خود را بنویسید"
            hiddenLabel
            name="commentText"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={
              status === 'authenticated' ? 'نظر خود را بنویسید…' : 'برای ثبت نظر وارد شوید'
            }
            rows={3}
            maxLength={5000}
            className="ad-comment-input"
          />
          <button disabled={disabled} className="ad-comment-submit">
            ارسال نظر
          </button>
        </form>
        <div className="ad-comment-list">
          {interaction.data?.comments.map((comment) => (
            <div key={comment.id} className="ad-comment">
              <CommentHeader comment={comment} />
              <button
                type="button"
                className="ad-reply-btn"
                aria-expanded={replyingTo === comment.id}
                onClick={() => {
                  setReplyText('')
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }}
              >
                پاسخ
              </button>
              {replyingTo === comment.id && (
                <form
                  className="ad-reply-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void run({ type: 'comment', parent: comment.id })
                  }}
                >
                  <FormControl
                    label="پاسخ خود را بنویسید"
                    hiddenLabel
                    name="replyText"
                    className="ad-reply-input"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    maxLength={5000}
                  />
                  <button disabled={disabled} className="ad-reply-submit">
                    ارسال
                  </button>
                </form>
              )}
              {comment.replies.length > 0 && (
                <div className="ad-replies">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="ad-comment ad-reply">
                      <CommentHeader comment={reply} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {interaction.data?.comments.length === 0 && (
            <p className="ad-no-comments">هنوز نظری ثبت نشده — اولین نفر باشید</p>
          )}
        </div>
      </section>
    </FormValidation>
  )
}
