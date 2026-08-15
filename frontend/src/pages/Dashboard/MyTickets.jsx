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
    pending: { label: 'در انتظار پاسخ', color: 'bg-amber-100 text-amber-700' },
    answered: { label: 'پاسخ داده شده', color: 'bg-green-100 text-green-700' },
    closed: { label: 'بسته شده', color: 'bg-gray-100 text-gray-700' },
  }

  const priorityConfig = {
    low: { label: 'کم', color: 'text-gray-600' },
    medium: { label: 'متوسط', color: 'text-amber-600' },
    high: { label: 'زیاد', color: 'text-red-600' },
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            ← برگشت
          </button>
          <h1 className="text-xl font-bold text-gray-800">{selectedTicket.title}</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {selectedTicket.messages?.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === selectedTicket.user ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl p-4 ${
                msg.sender === selectedTicket.user
                  ? 'bg-green-800 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-2 ${msg.sender === selectedTicket.user ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedTicket.status !== 'closed' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => handleReply(selectedTicket.id)}
                className="bg-green-800 text-white px-6 py-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                ارسال
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">تیکت‌ها</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          تیکت جدید
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">ثبت تیکت جدید</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اولویت</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">کم</option>
                <option value="medium">متوسط</option>
                <option value="high">زیاد</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">پیام</label>
              <textarea
                value={formData.first_message}
                onChange={(e) => setFormData({ ...formData, first_message: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-800 text-white px-6 py-3 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'در حال ثبت...' : 'ثبت تیکت'}
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">تیکتی وجود ندارد</h3>
          <p className="text-gray-500 text-sm">برای ارتباط با پشتیبانی تیکت ثبت کنید</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{ticket.title}</h3>
                  <p className={`text-xs mt-1 ${priorityConfig[ticket.priority]?.color}`}>
                    اولویت: {priorityConfig[ticket.priority]?.label}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[ticket.status]?.color}`}>
                  {statusConfig[ticket.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTickets