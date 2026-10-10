import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

const categoryLabel = {
  article: 'دلنوشته', memory: 'خاطره', munajat: 'مناجات', madahi: 'کلیپ مداحی', mouludi: 'کلیپ مولودی',
}

const reactionIcons = { heart: '❤️', pray: '🤲', cry: '😢', rose: '🌹' }

function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [article, setArticle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reactions, setReactions] = useState({})
  const [myReaction, setMyReaction] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    api.get(`/content/articles/${id}/`)
      .then(res => setArticle(res.data))
      .catch(() => navigate('/articles'))
      .finally(() => setIsLoading(false))

    api.get(`/interactive/reactions/article/${id}/`)
      .then(res => setReactions(res.data))
      .catch(() => {})

    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchComments = () => {
    api.get(`/interactive/comments/?content_type=article&content_id=${id}`)
      .then(res => setComments(res.data))
      .catch(() => {})
  }

  const handleReact = async (reactionType) => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      await api.post('/interactive/react/', { content_type: 'article', content_id: id, reaction_type: reactionType })
      const res = await api.get(`/interactive/reactions/article/${id}/`)
      setReactions(res.data)
      setMyReaction(myReaction === reactionType ? null : reactionType)
    } catch {
      alert('خطا در ثبت ریکشن')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    if (!commentText.trim()) return
    try {
      await api.post('/interactive/comments/create/', { content_type: 'article', content_id: id, text: commentText })
      setCommentText('')
      fetchComments()
    } catch {
      alert('خطا در ثبت نظر')
    }
  }

  const handleAddReply = async (parentId) => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!replyText.trim()) return
    try {
      await api.post('/interactive/comments/create/', { content_type: 'article', content_id: id, text: replyText, parent: parentId })
      setReplyText('')
      setReplyingTo(null)
      fetchComments()
    } catch {
      alert('خطا در ثبت پاسخ')
    }
  }

  if (isLoading) return <div className="ad-loading">در حال بارگذاری...</div>
  if (!article) return null

  const extraImages = [article.extra_image1, article.extra_image2, article.extra_image3].filter(Boolean)

  return (
    <div className="ad-page" dir="rtl">
      <div className="ad-container">
        <button onClick={() => navigate('/articles')} className="ad-back">← برگشت به دلنوشته‌ها</button>

        {article.main_image && <img src={article.main_image} alt={article.title} className="ad-image" />}

        <span className="ad-cat">{categoryLabel[article.category] || article.category}</span>
        <h1 className="ad-title">{article.title}</h1>

        <div className="ad-meta">
          <span>✍️ {article.author_name}</span>
          <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
          <span>👁 {article.views_count} بازدید</span>
        </div>

        <div className="ad-content">{article.content}</div>

        {article.aparat_link && (
          <a href={article.aparat_link} target="_blank" rel="noreferrer" className="ad-aparat">
            🎬 مشاهده کلیپ در آپارات
          </a>
        )}

        {extraImages.length > 0 && (
          <div className="ad-extra-images">
            {extraImages.map((img, i) => <img key={i} src={img} alt="" />)}
          </div>
        )}

        {/* ریکشن‌ها */}
        <div className="ad-reactions">
          {Object.entries(reactionIcons).map(([key, icon]) => (
            <button
              key={key}
              onClick={() => handleReact(key)}
              className={`ad-reaction-btn${myReaction === key ? ' active' : ''}`}
            >
              <span>{icon}</span>
              <span>{reactions[key] || 0}</span>
            </button>
          ))}
        </div>

        {/* کامنت‌ها */}
        <div className="ad-comments">
          <h2>نظرات ({comments.length})</h2>

          <form onSubmit={handleAddComment} className="ad-comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isAuthenticated ? 'نظر خود را بنویسید...' : 'برای ثبت نظر وارد شوید'}
              rows={3}
              className="ad-comment-input"
            />
            <button type="submit" className="ad-comment-submit">ارسال نظر</button>
          </form>

          <div className="ad-comment-list">
            {comments.map(comment => (
              <div key={comment.id} className="ad-comment">
                <div className="ad-comment-head">
                  {comment.user_image ? (
                    <img src={comment.user_image} alt="" className="ad-comment-avatar" />
                  ) : (
                    <div className="ad-comment-avatar-fallback">{comment.user_name?.[0] || '؟'}</div>
                  )}
                  <div>
                    <p className="ad-comment-name">{comment.user_name}</p>
                    <p className="ad-comment-date">{new Date(comment.created_at).toLocaleDateString('fa-IR')}</p>
                  </div>
                </div>
                <p className="ad-comment-text">{comment.text}</p>
                <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="ad-reply-btn">
                  پاسخ
                </button>

                {replyingTo === comment.id && (
                  <div className="ad-reply-form">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      className="ad-reply-input"
                    />
                    <button onClick={() => handleAddReply(comment.id)} className="ad-reply-submit">ارسال</button>
                  </div>
                )}

                {comment.replies?.length > 0 && (
                  <div className="ad-replies">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="ad-comment ad-reply">
                        <div className="ad-comment-head">
                          {reply.user_image ? (
                            <img src={reply.user_image} alt="" className="ad-comment-avatar" />
                          ) : (
                            <div className="ad-comment-avatar-fallback">{reply.user_name?.[0] || '؟'}</div>
                          )}
                          <div>
                            <p className="ad-comment-name">{reply.user_name}</p>
                            <p className="ad-comment-date">{new Date(reply.created_at).toLocaleDateString('fa-IR')}</p>
                          </div>
                        </div>
                        <p className="ad-comment-text">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {comments.length === 0 && <p className="ad-no-comments">هنوز نظری ثبت نشده — اولین نفر باشید</p>}
          </div>
        </div>
      </div>

      <style>{`
        .ad-loading { min-height: 50vh; display: flex; align-items: center; justify-content: center; color: var(--ink-dim); }
        .ad-page { padding: 48px 0 80px; }
        .ad-container { max-width: 760px; margin: 0 auto; padding: 0 24px; }

        .ad-back { background: none; border: none; cursor: pointer; color: var(--ink-dim); font-size: 13px; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .ad-back:hover { color: var(--teal-glow); }

        .ad-image { width: 100%; height: 320px; object-fit: cover; border-radius: var(--radius-lg); border: 1px solid var(--line); margin-bottom: 20px; }

        .ad-cat { display: inline-block; color: var(--teal-glow); font-size: 11.5px; font-weight: 600; letter-spacing: 1px; margin-bottom: 10px; }
        .ad-title { font-family: var(--font-display); color: var(--teal-glow); font-size: 26px; line-height: 1.5; margin-bottom: 16px; }

        .ad-meta { display: flex; align-items: center; gap: 18px; color: var(--ink-faint); font-size: 12px; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }

        .ad-content { color: var(--ink-dim); font-size: 15px; line-height: 2.1; white-space: pre-wrap; margin-bottom: 24px; }

        .ad-aparat { display: inline-block; margin-bottom: 24px; color: var(--teal-glow); font-size: 13.5px; }
        .ad-aparat:hover { color: var(--teal-light); }

        .ad-extra-images { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .ad-extra-images img { width: 120px; height: 120px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--line); }

        .ad-reactions { display: flex; gap: 10px; padding: 18px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 28px; }
        .ad-reaction-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
          font-size: 13px; transition: all .25s ease;
        }
        .ad-reaction-btn:hover { border-color: var(--teal-glow); }
        .ad-reaction-btn.active { border-color: var(--teal-glow); background: rgba(15,111,92,0.1); color: var(--teal-glow); }

        .ad-comments h2 { font-family: var(--font-display); color: var(--teal-glow); font-size: 17px; margin-bottom: 16px; }
        .ad-comment-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .ad-comment-input {
          width: 100%; padding: 12px 14px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body); font-size: 13px; outline: none; resize: vertical;
        }
        .ad-comment-input:focus { border-color: var(--teal-glow); }
        .ad-comment-submit {
          align-self: flex-start; padding: 10px 22px; border-radius: 999px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
        }

        .ad-comment-list { display: flex; flex-direction: column; gap: 16px; }
        .ad-no-comments { color: var(--ink-faint); font-size: 13px; text-align: center; padding: 20px 0; }

        .ad-comment { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 14px 16px; }
        .ad-reply { background: var(--panel-inset-bg); margin-top: 10px; }
        .ad-replies { margin-right: 24px; }

        .ad-comment-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .ad-comment-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .ad-comment-avatar-fallback {
          width: 32px; height: 32px; border-radius: 50%; background: var(--teal); color: var(--gold-light);
          display: grid; place-items: center; font-size: 13px; font-weight: 700;
        }
        .ad-comment-name { color: var(--ink); font-size: 13px; font-weight: 600; }
        .ad-comment-date { color: var(--ink-faint); font-size: 10.5px; }
        .ad-comment-text { color: var(--ink-dim); font-size: 13px; line-height: 1.8; }

        .ad-reply-btn { background: none; border: none; color: var(--teal-glow); font-size: 11.5px; cursor: pointer; margin-top: 8px; padding: 0; }
        .ad-reply-btn:hover { color: var(--teal-light); }

        .ad-reply-form { display: flex; gap: 8px; margin-top: 10px; }
        .ad-reply-input {
          flex: 1; padding: 8px 12px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 12.5px; outline: none;
        }
        .ad-reply-submit {
          padding: 0 16px; border-radius: var(--radius-sm); border: none; cursor: pointer;
          font-size: 12px; font-weight: 700; color: #eefaf5; background: var(--teal);
        }
      `}</style>
    </div>
  )
}

export default ArticleDetail