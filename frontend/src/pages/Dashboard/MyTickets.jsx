import FormValidation from '../../components/FormValidation'
import { fieldErrors } from '../../utils/validation'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import FormControl from '../../components/FormControl'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import './registration-support.css'

function MyTickets() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [tickets, setTickets] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const replyPending = useRef(false)
  const [formData, setFormData] = useState({ title: '', priority: 'low', first_message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [notice, setNotice] = useState(null)
  const headingRef = useRef(null)
  const newTitleRef = useRef(null)

  useEffect(() => {
    if (isCreating) newTitleRef.current?.focus()
    else headingRef.current?.focus()
  }, [isCreating, selectedTicket?.id])

  const fetchTickets = useCallback(() => {
    observeLoad(() => api.get('/tickets/my/')
      .then(res => setTickets(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(error => { throw error }), "'/tickets/my/'")
  }, [observeLoad])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])



  const handleCreate = async (e) => {
    setValidationErrors({})

    e.preventDefault()
    if (isLoading) return
    setNotice(null)
    if (!formData.title.trim() || !formData.first_message.trim()) {
      setValidationErrors({ ...(!formData.title.trim() ? { title: 'عنوان درخواست را وارد کنید.' } : {}), ...(!formData.first_message.trim() ? { first_message: 'متن پیام را وارد کنید.' } : {}) })
      return
    }
    setIsLoading(true)
    try {
      await api.post('/tickets/create/', formData)
      setIsCreating(false)
      setFormData({ title: '', priority: 'low', first_message: '' })
      setNotice({ text: 'تیکت با موفقیت ثبت شد.', error: false })
      setFilter('all')
      fetchTickets()
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setNotice({ text: err.response?.data?.error || 'ثبت تیکت انجام نشد. متن شما حفظ شده؛ دوباره تلاش کنید.', error: true })
    }
    setIsLoading(false)
  }

  const handleReply = async (ticketId) => {
    setValidationErrors({})

    if (!replyText.trim() || replyPending.current) return
    setNotice(null)
    replyPending.current = true
    setIsReplying(true)
    try {
      const response = await api.post(`/tickets/${ticketId}/reply/`, { text: replyText })
      setSelectedTicket(current => ({ ...current, status: 'pending', messages: [...(current.messages || []), { ...response.data, text: response.data.text || replyText, sender: current.user, created_at: response.data.created_at || new Date().toISOString() }] }))
      setReplyText('')
      fetchTickets()
      setNotice({ text: 'پیام شما ارسال شد.', error: false })
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setNotice({ text: err.response?.data?.error || 'پیام ارسال نشد. دوباره تلاش کنید.', error: true })
    } finally {
      replyPending.current = false
      setIsReplying(false)
    }
  }

  const statusConfig = {
    pending: { label: 'در انتظار پاسخ', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
    answered: { label: 'پاسخ داده شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
    closed: { label: 'بسته شده', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  }

  const priorityConfig = {
    low: { label: 'کم', color: 'var(--status-neutral)' },
    medium: { label: 'متوسط', color: 'var(--status-warn)' },
    high: { label: 'زیاد', color: 'var(--status-danger)' },
  }

  if (selectedTicket) {
    return (
      <FormValidation errors={validationErrors}><><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="tk-page tk-thread">
        <div className="tk-thread-head">
          <button onClick={() => { setSelectedTicket(null); setNotice(null); setValidationErrors({}); setReplyText('') }} className="tk-back-btn">بازگشت به تیکت‌ها</button>
          <h1 ref={headingRef} tabIndex={-1}>{selectedTicket.title}</h1>
          <span className="tk-badge">{statusConfig[selectedTicket.status]?.label}</span>
        </div>

        <div className="tk-card tk-messages">
          {selectedTicket.messages?.map((msg) => (
            <div key={msg.id} className={`tk-msg-row ${msg.sender === selectedTicket.user ? 'mine' : ''}`}>
              <div className="tk-msg-bubble">
                <strong className="tk-sender">{msg.sender === selectedTicket.user ? 'شما' : 'پشتیبانی'}</strong>
                <p>{msg.text}</p>
                <span>{new Date(msg.created_at).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
        {notice && <p className={notice.error ? 'service-error' : 'service-success'} role={notice.error ? 'alert' : 'status'}>{notice.text}</p>}
        {selectedTicket.status === 'closed' && <p className="tk-card service-description">این تیکت بسته شده است. برای موضوع جدید، تیکت تازه ثبت کنید.</p>}

        {selectedTicket.status !== 'closed' && (
          <div className="tk-card">
            <form className="tk-reply-row" onSubmit={event => { event.preventDefault(); handleReply(selectedTicket.id) }}>
              <div className="tk-field"><FormControl as="textarea" label="پاسخ شما" name="text"
                rows={3} disabled={isReplying}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="tk-input"
              /></div>
              <button type="submit" disabled={isReplying || !replyText.trim()} className="tk-send-btn">{isReplying ? 'در حال ارسال…' : 'ارسال پیام'}</button>
            </form>
          </div>
        )}


      </div>}</></FormValidation>
    )
  }

  return (
    <FormValidation errors={validationErrors}><><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="tk-page">
      <div className="tk-head">
        <div className="service-page-heading"><h1 ref={headingRef} tabIndex={-1}>تیکت‌ها</h1><p>پرسش‌ها و درخواست‌های خود را با پشتیبانی مطرح و پیگیری کنید.</p></div>
        {!isCreating && <button onClick={() => { setIsCreating(true); setNotice(null); setValidationErrors({}) }} className="tk-new-btn">تیکت جدید</button>}
      </div>
      {notice && <p className={notice.error ? 'service-error' : 'service-success'} role={notice.error ? 'alert' : 'status'}>{notice.text}</p>}

      {isCreating && (
        <div className="tk-card">
          <h2>ثبت تیکت جدید</h2>
          <form onSubmit={handleCreate} className="tk-form">
            <div className="tk-field">

              <FormControl as="input" label={<>عنوان</>} name="title" ref={newTitleRef}
                placeholder="موضوع درخواست را کوتاه و روشن بنویسید"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="tk-input"
                required
              />
            </div>
            <div className="tk-field">

              <FormControl as="select" label={<>اولویت</>} name="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="tk-input"
              >
                <option value="low">کم</option>
                <option value="medium">متوسط</option>
                <option value="high">زیاد</option>
              </FormControl>
            </div>
            <div className="tk-field">

              <FormControl as="textarea" label={<>پیام</>} name="first_message"
                value={formData.first_message}
                onChange={(e) => setFormData({ ...formData, first_message: e.target.value })}
                rows={4}
                className="tk-input"
                required
              />
            </div>
            <div className="tk-form-actions">
              <button type="submit" disabled={isLoading} className="tk-submit-btn">
                {isLoading ? 'در حال ثبت...' : 'ثبت تیکت'}
              </button>
              <button type="button" disabled={isLoading} onClick={() => { setIsCreating(false); setValidationErrors({}); setNotice(null) }} className="tk-cancel-btn">بستن فرم</button>
            </div>
          </form>
        </div>
      )}
      <div className="tk-filters" role="group" aria-label="فیلتر وضعیت تیکت‌ها">{[['all', 'همه'], ['pending', 'در انتظار پاسخ'], ['answered', 'پاسخ داده شده'], ['closed', 'بسته شده']].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label} <span>{(value === 'all' ? tickets.length : tickets.filter(ticket => ticket.status === value).length).toLocaleString('fa-IR')}</span></button>)}</div>

      {(tickets.length === 0 && (!loadState.started || loadState.pending > 0)) ? (<p className="field-hint" role="status">در حال دریافت اطلاعات…</p>) : (loadState.errors.length > 0 && tickets.length === 0) ? null : tickets.length === 0 ? (
        <div className="tk-empty">
          <h3>تیکتی وجود ندارد</h3>
          <p>برای ارتباط با پشتیبانی تیکت ثبت کنید</p>
        </div>
      ) : (
        <div className="tk-list">
          {tickets.filter(ticket => filter === 'all' || ticket.status === filter).map((ticket) => (
            <button type="button" key={ticket.id} onClick={() => { setSelectedTicket(ticket); setNotice(null); setValidationErrors({}) }} className="tk-row">
              <div>
                <h3>{ticket.title}</h3>
                <span className="tk-ticket-id">تیکت #{ticket.id.toLocaleString('fa-IR')}</span>
                <p style={{ color: priorityConfig[ticket.priority]?.color }}>
                  اولویت: {priorityConfig[ticket.priority]?.label}
                </p>
              </div>
              <span
                className="tk-badge"
                style={{
                  color: statusConfig[ticket.status]?.color,
                  borderColor: statusConfig[ticket.status]?.color,
                  background: statusConfig[ticket.status]?.bg,
                }}
              >
                {statusConfig[ticket.status]?.label}
              </span>
            </button>
          ))}
        </div>
      )}
      {tickets.length > 0 && !tickets.some(ticket => filter === 'all' || ticket.status === filter) && <p className="tk-empty" role="status">تیکتی با این وضعیت وجود ندارد.</p>}


    </div>}</></FormValidation>
  )
}

export default MyTickets
