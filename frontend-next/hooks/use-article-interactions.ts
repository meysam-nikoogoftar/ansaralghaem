'use client'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/components/auth/session-provider'
import { browserRequest, requireLogin } from '@/lib/api/browser'
import { ApiError, fieldErrors } from '@/lib/api/errors'
import { commentSchema, listOf, reactionsSchema } from '@/lib/contracts'
import type { FieldErrors, Reactions } from '@/types'

type Action = { type: 'reaction'; reaction: keyof Reactions } | { type: 'comment'; parent?: number }
export default function useArticleInteractions(articleId: number) {
  const { status, retry, user } = useSession()
  const [commentText, setCommentText] = useState(''),
    [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [myReaction, setMyReaction] = useState<keyof Reactions | null>(null)
  const [pending, setPending] = useState(false),
    [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const locked = useRef(false)
  const draftKey = `article-comment-draft:${articleId}`
  useEffect(() => {
    setMyReaction(null)
  }, [user?.id])
  const interaction = useQuery({
    queryKey: ['article-interactions', articleId],
    queryFn: async ({ signal }) => {
      const [counts, comments] = await Promise.all([
        browserRequest(`/interactive/reactions/article/${articleId}/`, reactionsSchema.parse, {
          signal,
        }),
        browserRequest(
          `/interactive/comments/?content_type=article&content_id=${articleId}`,
          listOf(commentSchema).parse,
          { signal },
        ),
      ])
      return { counts, comments }
    },
    staleTime: 15_000,
  })
  useEffect(() => {
    try {
      const draft: unknown = JSON.parse(sessionStorage.getItem(draftKey) || 'null')
      if (
        draft &&
        typeof draft === 'object' &&
        'text' in draft &&
        typeof draft.text === 'string' &&
        'savedAt' in draft &&
        typeof draft.savedAt === 'number' &&
        Date.now() - draft.savedAt < 3_600_000
      )
        setCommentText(draft.text.slice(0, 5000))
      sessionStorage.removeItem(draftKey)
    } catch {
      /* A missing or malformed draft does not block reading. */
    }
  }, [draftKey])

  async function run(action: Action) {
    if (locked.current || status === 'checking') return
    if (status === 'error') {
      await retry()
      return
    }
    if (status !== 'authenticated') {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify({ text: commentText, savedAt: Date.now() }))
      } catch {
        /* Login remains available without storage. */
      }
      requireLogin()
      return
    }
    const text = (action.type === 'comment' && action.parent ? replyText : commentText).trim()
    if (action.type === 'comment' && !text) {
      setErrors({ [action.parent ? 'replyText' : 'commentText']: 'متن را وارد کنید.' })
      return
    }
    locked.current = true
    setPending(true)
    setErrors({})
    setMessage('')
    try {
      if (action.type === 'reaction') {
        await browserRequest('/interactive/react/', () => undefined, {
          method: 'POST',
          authenticated: true,
          body: { content_type: 'article', content_id: articleId, reaction_type: action.reaction },
        })
        setMyReaction((previous) => (previous === action.reaction ? null : action.reaction))
      } else {
        await browserRequest('/interactive/comments/create/', () => undefined, {
          method: 'POST',
          authenticated: true,
          body: {
            content_type: 'article',
            content_id: articleId,
            text,
            ...(action.parent ? { parent: action.parent } : {}),
          },
        })
        if (action.parent) {
          setReplyText('')
          setReplyingTo(null)
        } else setCommentText('')
        setMessage('نظر شما برای بررسی ارسال شد.')
      }
      await interaction.refetch()
    } catch (error) {
      const fields = fieldErrors(error)
      setErrors({
        ...fields,
        ...(fields.text
          ? {
              [action.type === 'comment' && action.parent ? 'replyText' : 'commentText']:
                fields.text,
            }
          : {}),
        ...(!Object.keys(fields).length
          ? {
              request:
                error instanceof ApiError ? error.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.',
            }
          : {}),
      })
    } finally {
      locked.current = false
      setPending(false)
    }
  }

  return {
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
  }
}
