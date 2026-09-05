import { useEffect, useState } from 'react'
import api from '../../services/api'

function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [formData, setFormData] = useState({ title: '', priority: 'low', first_message: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = () => {
    api.get('/tickets/my/')
      .then(res => setTickets(res.data))
      .catch(() => {})
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/tickets/create/', formData)
      setIsCreating(false)
      setFormData({ title: '', priority: 'low', first_message: '' })
      fetchTickets()
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت تیکت')
    }
    setIsLoading(false)
  }

  const handleReply = async (ticketId) => {
    if (!replyText.trim()) return
    try {
      await api.post(`/tickets/${ticketId}/reply/`, { text: replyText })
      setReplyText('')
      const res = await api.get(`/tickets/${ticketId}/`)
      setSelectedTicket(res.data)
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ارسال پیام')
    }
  }

  const statusConfig = {
    pending: { label: 'در انتظار پاسخ', color: '#d8b568' },
    answered: { label: 'پاسخ داده شده', color: '#4bd6ac' },
    closed: { label: 'بسته شده', color: '#af9f88' },
  }

  const priorityConfig = {
    low: { label: 'کم', color: '#af9f88' },
    medium: { label: 'متوسط', color: '#d8b568' },
    high: { label: 'زیاد', color: '#ff6b7d' },
  }

  if (selectedTicket) {
    return (
      <div className="tk-page tk-thread">
        <div className="tk-thread-head">
          <button onClick={() => setSelectedTicket(null)} className="tk-back-btn">← برگشت</button>
          <h1>{selectedTicket.title}</h1>
        </div>

        <div className="tk-card tk-messages">
          {selectedTicket.messages?.map((msg) => (
            <div key={msg.id} className={`tk-msg-row ${msg.sender === selectedTicket.user ? 'mine' : ''}`}>
              <div className="tk-msg-bubble">
                <p>{msg.text}</p>
                <span>{new Date(msg.created_at).toLocaleDateString('fa-IR')}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedTicket.status !== 'closed' && (
          <div className="tk-card">
            <div className="tk-reply-row">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="tk-input"
              />
              <button onClick={() => handleReply(selectedTicket.id)} className="tk-send-btn">ارسال</button>
            </div>
          </div>
        )}

        <style>{ticketStyles}</style>
      </div>
    )
  }

  return (
    <div className="tk-page">
      <div className="tk-head">
        <h1>تیکت‌ها</h1>
        <button onClick={() => setIsCreating(true)} className="tk-new-btn">تیکت جدید</button>
      </div>

      {isCreating && (
        <div className="tk-card">
          <h2>ثبت تیکت جدید</h2>
          <form onSubmit={handleCreate} className="tk-form">
            <div className="tk-field">
              <label>عنوان</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="tk-input"
                required
              />
            </div>
            <div className="tk-field">
              <label>اولویت</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="tk-input"
              >
                <option value="low">کم</option>
                <option value="medium">متوسط</option>
                <option value="high">زیاد</option>
              </select>
            </div>
            <div className="tk-field">
              <label>پیام</label>
              <textarea
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
              <button type="button" onClick={() => setIsCreating(false)} className="tk-cancel-btn">انصراف</button>
            </div>
          </form>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="tk-empty">
          <div className="tk-empty-icon">🎫</div>
          <h3>تیکتی وجود ندارد</h3>
          <p>برای ارتباط با پشتیبانی تیکت ثبت کنید</p>
        </div>
      ) : (
        <div className="tk-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="tk-row">
              <div>
                <h3>{ticket.title}</h3>
                <p style={{ color: priorityConfig[ticket.priority]?.color }}>
                  اولویت: {priorityConfig[ticket.priority]?.label}
                </p>
              </div>
              <span
                className="tk-badge"
                style={{
                  color: statusConfig[ticket.status]?.color,
                  borderColor: statusConfig[ticket.status]?.color,
                  background: `${statusConfig[ticket.status]?.color}1a`,
                }}
              >
                {statusConfig[ticket.status]?.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{ticketStyles}</style>
    </div>
  )
}

const ticketStyles = `
  .tk-page { display: flex; flex-direction: column; gap: 20px; max-width: 680px; }
  .tk-head { display: flex; align-items: center; justify-content: space-between; }
  .tk-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 22px; }

  .tk-new-btn {
    padding: 10px 20px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-size: 13px; font-weight: 700;
    color: #1a1206;
    background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
    box-shadow: 0 6px 18px -6px rgba(216,181,104,0.45);
  }

  .tk-card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 20px 22px;
  }
  .tk-card h2 {
    font-family: var(--font-display);
    color: var(--gold-light);
    font-size: 15px;
    margin-bottom: 14px;
  }

  .tk-form { display: flex; flex-direction: column; gap: 14px; }
  .tk-field label { display: block; color: var(--ink-dim); font-size: 13px; margin-bottom: 6px; }
  .tk-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(10,21,18,0.6);
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 13px;
    outline: none;
  }
  .tk-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }
  select.tk-input option { background: var(--surface-2); color: var(--ink); }

  .tk-form-actions { display: flex; gap: 10px; }
  .tk-submit-btn {
    padding: 11px 22px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-size: 13px; font-weight: 700;
    color: #1a1206;
    background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
  }
  .tk-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .tk-cancel-btn {
    padding: 11px 22px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink-dim);
    font-size: 13px;
    cursor: pointer;
  }
  .tk-cancel-btn:hover { border-color: var(--gold); color: var(--gold-light); }

  .tk-empty {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-lg);
    padding: 48px 24px;
    text-align: center;
  }
  .tk-empty-icon { font-size: 40px; margin-bottom: 14px; }
  .tk-empty h3 { color: var(--ink); font-size: 16px; margin-bottom: 8px; }
  .tk-empty p { color: var(--ink-dim); font-size: 13px; }

  .tk-list { display: flex; flex-direction: column; gap: 12px; }
  .tk-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    cursor: pointer;
    transition: all .25s ease;
  }
  .tk-row:hover { border-color: var(--gold); }
  .tk-row h3 { color: var(--ink); font-size: 14px; font-weight: 600; }
  .tk-row p { font-size: 12px; margin-top: 4px; }
  .tk-badge {
    font-size: 12px; padding: 5px 12px; border-radius: 999px;
    border: 1px solid; white-space: nowrap;
  }

  .tk-thread-head { display: flex; align-items: center; gap: 16px; }
  .tk-back-btn { background: none; border: none; color: var(--ink-dim); font-size: 13px; cursor: pointer; }
  .tk-back-btn:hover { color: var(--gold-light); }
  .tk-thread-head h1 { font-family: var(--font-display); color: var(--gold-light); font-size: 19px; }

  .tk-messages { display: flex; flex-direction: column; gap: 12px; }
  .tk-msg-row { display: flex; justify-content: flex-start; }
  .tk-msg-row.mine { justify-content: flex-end; }
  .tk-msg-bubble {
    max-width: 75%;
    border-radius: var(--radius-md);
    padding: 12px 16px;
    background: rgba(10,21,18,0.6);
    border: 1px solid var(--line);
  }
  .tk-msg-row.mine .tk-msg-bubble {
    background: linear-gradient(135deg, var(--teal), var(--teal-light));
    border-color: transparent;
  }
  .tk-msg-bubble p { color: var(--ink); font-size: 13px; line-height: 1.7; }
  .tk-msg-row.mine .tk-msg-bubble p { color: #eefaf5; }
  .tk-msg-bubble span { display: block; color: var(--ink-faint); font-size: 10px; margin-top: 6px; }
  .tk-msg-row.mine .tk-msg-bubble span { color: rgba(238,250,245,0.65); }

  .tk-reply-row { display: flex; gap: 10px; }
  .tk-send-btn {
    padding: 0 22px;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    font-size: 13px; font-weight: 700;
    color: #1a1206;
    background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
    white-space: nowrap;
  }
`

export default MyTickets