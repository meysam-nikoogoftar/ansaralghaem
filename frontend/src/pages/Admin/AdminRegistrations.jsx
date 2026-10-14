import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const statusMeta = {
  '': { label: 'بدون وضعیت', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  pending: { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  cancelled: { label: 'انصراف داده', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  attended: { label: 'شرکت کرد', color: 'var(--status-info)', bg: 'var(--status-info-bg)' },
  absent: { label: 'شرکت نکرد', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

const paymentMethodLabel = { online: 'آنلاین', cash: 'نقدی', wallet: 'کیف پول' }
const refundStatusLabel = { pending: 'در دست بررسی', approved: 'تایید شده', rejected: 'رد شده' }

const ALL_COLUMNS = [
  { id: 'trip', label: 'سفر', default: true },
  { id: 'user_image', label: 'عکس کاربر', default: true },
  { id: 'first_name', label: 'نام', default: true },
  { id: 'last_name', label: 'نام خانوادگی', default: true },
  { id: 'father_name', label: 'نام پدر', default: false },
  { id: 'national_code', label: 'کد ملی', default: true },
  { id: 'nationality', label: 'ملیت', default: false },
  { id: 'mobile', label: 'موبایل', default: true },
  { id: 'birth_date', label: 'تاریخ تولد', default: false },
  { id: 'registered_at', label: 'تاریخ ثبت‌نام', default: false },
  { id: 'university', label: 'دانشگاه', default: false },
  { id: 'tracking_code', label: 'کد پیگیری', default: true },
  { id: 'payment_method', label: 'نحوه پرداخت', default: false },
  { id: 'card_number', label: 'شماره کارت', default: false },
  { id: 'payment_number', label: 'شماره پرداخت', default: false },
  { id: 'credit', label: 'بستانکاری', default: false },
  { id: 'paid_amount', label: 'مبلغ پرداخت شده', default: true },
  { id: 'group_code', label: 'کد گروه', default: false },
  { id: 'pilgrim_id', label: 'شناسه زائر', default: false },
  { id: 'actions', label: 'عملیات', default: true },
  { id: 'refund_requested', label: 'درخواست عودت وجه', default: false },
  { id: 'refund_status', label: 'وضعیت عودت وجه', default: false },
  { id: 'status', label: 'وضعیت', default: true },
  { id: 'rejection_reason', label: 'دلیل رد', default: false },
  { id: 'participation_status', label: 'وضعیت شرکت', default: false },
  { id: 'admin_note', label: 'توضیحات', default: false },
]

function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [advancedFilters, setAdvancedFilters] = useState({
    status: '', first_name: '', last_name: '', national_code: '', mobile: '',
    gender: '', education_level: '', payment_method: '', refund_status: '',
    trip_id: '', student_status: '', university: '', group_code: '',
    participation_status: '', nationality: '',
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [trips, setTrips] = useState([])

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const init = {}
    ALL_COLUMNS.forEach(c => { init[c.id] = c.default })
    return init
  })
  const [showColumns, setShowColumns] = useState(false)
  const [columnSearch, setColumnSearch] = useState('')

  const [groupCodes, setGroupCodes] = useState({})
  const [savingGroupId, setSavingGroupId] = useState(null)
  const [companionModal, setCompanionModal] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [noteModal, setNoteModal] = useState(null)

  useEffect(() => {
    api.get('/trips/admin/trips/').then(res => setTrips(res.data)).catch(() => {})
  }, [])

  const fetchRegistrations = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (key === 'participation_status') return
      if (value) params.append(key, value)
    })
    api.get(`/trips/admin/registrations/?${params.toString()}`)
      .then(res => {
        setRegistrations(res.data)
        const codes = {}
        res.data.forEach(r => { codes[r.id] = r.group_code || '' })
        setGroupCodes(codes)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFilters])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchRegistrations()
  }

  const handleAdvancedChange = (key, value) => setAdvancedFilters({ ...advancedFilters, [key]: value })
  const clearAdvancedFilters = () => setAdvancedFilters({
    status: '', first_name: '', last_name: '', national_code: '', mobile: '',
    gender: '', education_level: '', payment_method: '', refund_status: '',
    trip_id: '', student_status: '', university: '', group_code: '',
    participation_status: '', nationality: '',
  })
  const activeAdvancedCount = Object.entries(advancedFilters).filter(([k, v]) => k !== 'participation_status' && v).length

  const toggleColumn = (id) => setVisibleColumns({ ...visibleColumns, [id]: !visibleColumns[id] })
  const toggleAllColumns = () => {
    const allOn = ALL_COLUMNS.every(c => visibleColumns[c.id])
    const next = {}
    ALL_COLUMNS.forEach(c => { next[c.id] = !allOn })
    setVisibleColumns(next)
  }
  const filteredColumnList = ALL_COLUMNS.filter(c => c.label.includes(columnSearch))
  const col = (id) => visibleColumns[id]

  // ---------- اکشن‌های ثبت‌نام ----------

  const runAction = async (id, action, extra = {}) => {
    setBusyId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, { action, ...extra })
      setRegistrations(regs => regs.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت عملیات')
    }
    setBusyId(null)
  }

  const handleMenuAction = (id, action) => {
    setOpenMenuId(null)
    if (action === 'reject') {
      const r = registrations.find(x => x.id === id)
      setRejectModal({ id, reason: r?.rejection_reason || '' })
    } else if (action === 'note') {
      const r = registrations.find(x => x.id === id)
      setNoteModal({ id, text: r?.admin_note || '' })
    } else {
      runAction(id, action)
    }
  }

  const submitReject = async () => {
    await runAction(rejectModal.id, 'reject', { rejection_reason: rejectModal.reason })
    setRejectModal(null)
  }

  const submitNote = async () => {
    await runAction(noteModal.id, 'set_note', { admin_note: noteModal.text })
    setNoteModal(null)
  }

  // ---------- کد گروه (اتوبوس) ----------

  const handleGroupCodeChange = (id, value) => setGroupCodes({ ...groupCodes, [id]: value })

  const saveGroupCode = async (id, value) => {
    setSavingGroupId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/group-code/`, { group_code: value })
      setRegistrations(regs => regs.map(r => r.id === id ? res.data : r))

      if (value) {
        const netRes = await api.get(`/trips/admin/registrations/${id}/companions-network/`)
        if (netRes.data.length > 0) {
          const selected = {}
          netRes.data.forEach(r => { selected[r.id] = true })
          setCompanionModal({ regId: id, code: value, list: netRes.data, selected, applying: false })
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت کد گروه')
    }
    setSavingGroupId(null)
  }

  const toggleCompanionSelected = (companionRegId) => {
    setCompanionModal(m => ({ ...m, selected: { ...m.selected, [companionRegId]: !m.selected[companionRegId] } }))
  }

  const applyGroupCodeToCompanions = async () => {
    const selectedIds = Object.entries(companionModal.selected).filter(([, v]) => v).map(([k]) => Number(k))
    if (selectedIds.length === 0) { setCompanionModal(null); return }

    setCompanionModal(m => ({ ...m, applying: true }))
    try {
      await api.post('/trips/admin/registrations/bulk-group-code/', {
        registration_ids: selectedIds,
        group_code: companionModal.code,
      })
      setGroupCodes(gc => {
        const next = { ...gc }
        selectedIds.forEach(id => { next[id] = companionModal.code })
        return next
      })
      setRegistrations(regs => regs.map(r => selectedIds.includes(r.id) ? { ...r, group_code: companionModal.code } : r))
      setCompanionModal(null)
    } catch {
      alert('خطا در اعمال کد گروه')
      setCompanionModal(m => ({ ...m, applying: false }))
    }
  }

  const participationLabel = (r) => {
    if (r.status === 'attended') return 'شرکت کرد'
    if (r.status === 'absent') return 'شرکت نکرد'
    return '—'
  }

  return (
    <div className="art-page">
      <h1 className="art-heading">مدیریت ثبت‌نام‌ها</h1>

      <div className="art-toolbar">
        <form onSubmit={handleSearchSubmit} className="art-search-form">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام، موبایل، کد ملی یا کد پیگیری..."
            className="art-search-input"
          />
          <button type="submit" className="art-search-btn">جستجو</button>
        </form>
      </div>

      <div className="art-toggles-row">
        <div className="art-advanced-wrap">
          <button onClick={() => { setShowAdvanced(!showAdvanced); setShowColumns(false) }} className="art-advanced-toggle">
            فیلتر پیشرفته {activeAdvancedCount > 0 && <span className="art-advanced-count">{activeAdvancedCount}</span>}
            <span className={`art-advanced-arrow${showAdvanced ? ' open' : ''}`}>▾</span>
          </button>

          {showAdvanced && (
            <div className="art-advanced-panel">
              <div className="art-advanced-field">
                <label>وضعیت</label>
                <select value={advancedFilters.status} onChange={(e) => handleAdvancedChange('status', e.target.value)}>
                  <option value="">همه وضعیت‌ها</option>
                  <option value="__blank__">بدون وضعیت</option>
                  <option value="pending">در دست بررسی</option>
                  <option value="approved">تایید</option>
                  <option value="rejected">رد</option>
                  <option value="cancelled">انصراف</option>
                </select>
              </div>
              <div className="art-advanced-field"><label>نام</label><input type="text" value={advancedFilters.first_name} onChange={(e) => handleAdvancedChange('first_name', e.target.value)} /></div>
              <div className="art-advanced-field"><label>نام خانوادگی</label><input type="text" value={advancedFilters.last_name} onChange={(e) => handleAdvancedChange('last_name', e.target.value)} /></div>
              <div className="art-advanced-field"><label>کد ملی</label><input type="text" value={advancedFilters.national_code} onChange={(e) => handleAdvancedChange('national_code', e.target.value)} /></div>
              <div className="art-advanced-field"><label>شماره موبایل</label><input type="text" value={advancedFilters.mobile} onChange={(e) => handleAdvancedChange('mobile', e.target.value)} /></div>
              <div className="art-advanced-field">
                <label>جنسیت</label>
                <select value={advancedFilters.gender} onChange={(e) => handleAdvancedChange('gender', e.target.value)}>
                  <option value="">همه</option><option value="male">برادر</option><option value="female">خواهر</option>
                </select>
              </div>
              <div className="art-advanced-field">
                <label>مقطع تحصیلی</label>
                <select value={advancedFilters.education_level} onChange={(e) => handleAdvancedChange('education_level', e.target.value)}>
                  <option value="">همه</option><option value="diploma">دیپلم</option><option value="associate">فوق دیپلم</option>
                  <option value="bachelor">لیسانس</option><option value="master">فوق لیسانس</option><option value="phd">دکترا</option>
                </select>
              </div>
              <div className="art-advanced-field">
                <label>نحوه پرداخت</label>
                <select value={advancedFilters.payment_method} onChange={(e) => handleAdvancedChange('payment_method', e.target.value)}>
                  <option value="">همه</option><option value="online">آنلاین</option><option value="cash">نقدی</option><option value="wallet">کیف پول</option>
                </select>
              </div>
              <div className="art-advanced-field">
                <label>وضعیت عودت وجه</label>
                <select value={advancedFilters.refund_status} onChange={(e) => handleAdvancedChange('refund_status', e.target.value)}>
                  <option value="">همه</option><option value="__none__">بدون درخواست عودت</option>
                  <option value="pending">در انتظار</option><option value="approved">تایید شده</option><option value="rejected">رد شده</option>
                </select>
              </div>
              <div className="art-advanced-field">
                <label>سفر زیارتی</label>
                <select value={advancedFilters.trip_id} onChange={(e) => handleAdvancedChange('trip_id', e.target.value)}>
                  <option value="">همه</option>
                  {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div className="art-advanced-field">
                <label>وضعیت دانشجویی</label>
                <select value={advancedFilters.student_status} onChange={(e) => handleAdvancedChange('student_status', e.target.value)}>
                  <option value="">همه</option><option value="student">دانشجو</option><option value="graduate">فارغ‌التحصیل</option><option value="professor">استاد</option>
                </select>
              </div>
              <div className="art-advanced-field"><label>نام دانشگاه</label><input type="text" value={advancedFilters.university} onChange={(e) => handleAdvancedChange('university', e.target.value)} /></div>
              <div className="art-advanced-field"><label>کد گروه</label><input type="text" value={advancedFilters.group_code} onChange={(e) => handleAdvancedChange('group_code', e.target.value)} /></div>
              <div className="art-advanced-field">
                <label>وضعیت شرکت <span className="art-advanced-soon">(به‌زودی)</span></label>
                <select value={advancedFilters.participation_status} onChange={(e) => handleAdvancedChange('participation_status', e.target.value)}>
                  <option value="">همه</option><option value="attended">شرکت کرد</option><option value="absent">شرکت نکرد</option>
                </select>
              </div>
              <div className="art-advanced-field"><label>ملیت</label><input type="text" value={advancedFilters.nationality} onChange={(e) => handleAdvancedChange('nationality', e.target.value)} /></div>

              {activeAdvancedCount > 0 && <button onClick={clearAdvancedFilters} className="art-advanced-clear">پاک کردن فیلترها</button>}
            </div>
          )}
        </div>

        <div className="art-columns-wrap">
          <button onClick={() => { setShowColumns(!showColumns); setShowAdvanced(false) }} className="art-advanced-toggle">
            نمایش / عدم نمایش ستون‌ها
            <span className={`art-advanced-arrow${showColumns ? ' open' : ''}`}>▾</span>
          </button>

          {showColumns && (
            <div className="art-columns-panel">
              <input
                type="text"
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                placeholder="جستجوی ستون..."
                className="art-columns-search"
              />
              <label className="art-columns-check art-columns-all">
                <input type="checkbox" checked={ALL_COLUMNS.every(c => visibleColumns[c.id])} onChange={toggleAllColumns} />
                <span>همه موارد</span>
              </label>
              <div className="art-columns-list">
                {filteredColumnList.map(c => (
                  <label key={c.id} className="art-columns-check">
                    <input type="checkbox" checked={!!visibleColumns[c.id]} onChange={() => toggleColumn(c.id)} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="art-loading">در حال بارگذاری...</div>
      ) : registrations.length === 0 ? (
        <div className="art-empty">ثبت‌نامی یافت نشد</div>
      ) : (
        <div className="art-table-wrap">
          <table className="art-table">
            <thead>
              <tr>
                {ALL_COLUMNS.filter(c => col(c.id)).map(c => <th key={c.id}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id}>
                  {col('trip') && <td>{r.trip_detail?.title}</td>}
                  {col('user_image') && (
                    <td>
                      {r.user_image ? <img src={r.user_image} alt="" className="art-user-avatar" /> : <span className="art-dash">—</span>}
                    </td>
                  )}
                  {col('first_name') && <td>{r.user_first_name}</td>}
                  {col('last_name') && <td>{r.user_last_name}</td>}
                  {col('father_name') && <td>{r.user_father_name || <span className="art-dash">—</span>}</td>}
                  {col('national_code') && <td className="art-mono">{r.user_national_code}</td>}
                  {col('nationality') && <td>{r.user_nationality}</td>}
                  {col('mobile') && <td className="art-mono">{r.user_mobile}</td>}
                  {col('birth_date') && <td>{r.user_birth_date || <span className="art-dash">—</span>}</td>}
                  {col('registered_at') && <td>{new Date(r.registered_at).toLocaleDateString('fa-IR')}</td>}
                  {col('university') && <td>{r.user_university || <span className="art-dash">—</span>}</td>}
                  {col('tracking_code') && <td className="art-mono">{r.tracking_code}</td>}
                  {col('payment_method') && <td>{paymentMethodLabel[r.payment_method] || <span className="art-dash">—</span>}</td>}
                  {col('card_number') && <td>{r.card_number || <span className="art-dash">—</span>}</td>}
                  {col('payment_number') && <td><span className="art-dash">—</span></td>}
                  {col('credit') && <td><span className="art-dash">—</span></td>}
                  {col('paid_amount') && <td>{((r.paid_from_wallet || 0) + (r.paid_directly || 0)).toLocaleString('fa-IR')} ت</td>}
                  {col('group_code') && (
                    <td>
                      <input
                        type="text"
                        value={groupCodes[r.id] ?? ''}
                        onChange={(e) => handleGroupCodeChange(r.id, e.target.value)}
                        onBlur={(e) => saveGroupCode(r.id, e.target.value)}
                        placeholder="—"
                        className="art-group-code-input"
                      />
                      {savingGroupId === r.id && <span className="art-group-code-saving">...</span>}
                    </td>
                  )}
                  {col('pilgrim_id') && <td><span className="art-dash">—</span></td>}
                  {col('actions') && (
                    <td className="art-actions-cell">
                      <div className="art-menu-wrap">
                        <button onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)} className="art-menu-btn" disabled={busyId === r.id}>
                          {busyId === r.id ? '...' : 'عملیات'} <span className="art-menu-caret">▾</span>
                        </button>
                        {openMenuId === r.id && (
                          <>
                            <div className="art-menu-backdrop" onClick={() => setOpenMenuId(null)} />
                            <div className="art-menu-dropdown">
                              <Link to={`/admin/users/${r.user}`} className="art-menu-item" onClick={() => setOpenMenuId(null)}>
                                <span className="art-menu-icon info">👁</span> مشاهده جزئیات
                              </Link>
                              <button onClick={() => handleMenuAction(r.id, 'reset')} className="art-menu-item">
                                <span className="art-menu-icon neutral">○</span> بدون وضعیت
                              </button>
                              <button onClick={() => handleMenuAction(r.id, 'mark_pending')} className="art-menu-item">
                                <span className="art-menu-icon warn">✋</span> در دست بررسی
                              </button>
                              <button onClick={() => handleMenuAction(r.id, 'approve')} className="art-menu-item">
                                <span className="art-menu-icon ok">✔</span> تایید
                              </button>
                              <button onClick={() => handleMenuAction(r.id, 'reject')} className="art-menu-item">
                                <span className="art-menu-icon danger">✕</span> رد
                              </button>
                              <button onClick={() => handleMenuAction(r.id, 'note')} className="art-menu-item">
                                <span className="art-menu-icon info">ℹ</span> سایر توضیحات
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                  {col('refund_requested') && <td>{r.refund_requested ? 'بله' : 'خیر'}</td>}
                  {col('refund_status') && <td>{r.refund_status ? (refundStatusLabel[r.refund_status] || r.refund_status) : <span className="art-dash">—</span>}</td>}
                  {col('status') && (
                    <td>
                      <span className="art-badge" style={{ color: statusMeta[r.status]?.color, borderColor: statusMeta[r.status]?.color, background: statusMeta[r.status]?.bg }}>
                        {statusMeta[r.status]?.label || r.status}
                      </span>
                    </td>
                  )}
                  {col('rejection_reason') && <td className="art-wrap-cell">{r.rejection_reason || <span className="art-dash">—</span>}</td>}
                  {col('participation_status') && <td>{participationLabel(r)}</td>}
                  {col('admin_note') && <td className="art-wrap-cell">{r.admin_note || <span className="art-dash">—</span>}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال رد ثبت‌نام */}
      {rejectModal && (
        <div className="art-modal-backdrop" onClick={() => setRejectModal(null)}>
          <div className="art-modal" onClick={(e) => e.stopPropagation()}>
            <h3>دلیل رد ثبت‌نام</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="دلیل رد (اختیاری)..."
              rows={4}
              className="art-modal-textarea"
            />
            <div className="art-modal-actions">
              <button onClick={submitReject} disabled={busyId === rejectModal.id} className="art-reject-confirm">
                {busyId === rejectModal.id ? '...' : 'ثبت رد'}
              </button>
              <button onClick={() => setRejectModal(null)} className="art-reject-cancel">انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال سایر توضیحات */}
      {noteModal && (
        <div className="art-modal-backdrop" onClick={() => setNoteModal(null)}>
          <div className="art-modal" onClick={(e) => e.stopPropagation()}>
            <h3>سایر توضیحات ادمین</h3>
            <textarea
              value={noteModal.text}
              onChange={(e) => setNoteModal({ ...noteModal, text: e.target.value })}
              placeholder="توضیحات داخلی درباره این ثبت‌نام..."
              rows={4}
              className="art-modal-textarea"
            />
            <div className="art-modal-actions">
              <button onClick={submitNote} disabled={busyId === noteModal.id} className="art-reject-confirm ok">
                {busyId === noteModal.id ? '...' : 'ذخیره توضیحات'}
              </button>
              <button onClick={() => setNoteModal(null)} className="art-reject-cancel">انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال اعمال کد گروه به همسفرها */}
      {companionModal && (
        <div className="art-modal-backdrop" onClick={() => setCompanionModal(null)}>
          <div className="art-modal" onClick={(e) => e.stopPropagation()}>
            <h3>اعمال کد گروه «{companionModal.code}» به همسفرها</h3>
            <div className="art-companion-checklist">
              {companionModal.list.map(c => (
                <label key={c.id} className="art-companion-check">
                  <input type="checkbox" checked={!!companionModal.selected[c.id]} onChange={() => toggleCompanionSelected(c.id)} />
                  <span>{c.user_name}</span>
                  {c.group_code && <span className="art-companion-current-code">(فعلی: {c.group_code})</span>}
                </label>
              ))}
            </div>
            <div className="art-modal-actions">
              <button onClick={applyGroupCodeToCompanions} disabled={companionModal.applying} className="art-reject-confirm ok">
                {companionModal.applying ? '...' : 'اعمال به انتخاب‌شده‌ها'}
              </button>
              <button onClick={() => setCompanionModal(null)} className="art-reject-cancel">بی‌خیال</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .art-page { display: flex; flex-direction: column; gap: 16px; }
        .art-heading { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }

        .art-toolbar { display: flex; align-items: center; gap: 12px; }
        .art-search-form { display: flex; gap: 8px; flex: 1; max-width: 420px; }
        .art-search-input { flex: 1; padding: 9px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); color: var(--ink); font-size: 13px; outline: none; }
        .art-search-input:focus { border-color: var(--teal-glow); }
        .art-search-btn { padding: 0 16px; border-radius: var(--radius-sm); border: 1px solid var(--line); background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer; }
        .art-search-btn:hover { border-color: var(--teal-glow); color: var(--teal-glow); }

        .art-toggles-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .art-advanced-wrap, .art-columns-wrap { position: relative; }
        .art-advanced-toggle {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 12.5px; cursor: pointer;
        }
        .art-advanced-toggle:hover { border-color: var(--teal-glow); color: var(--teal-glow); }
        .art-advanced-count { background: var(--teal-glow); color: #06130f; font-size: 10.5px; font-weight: 700; padding: 1px 7px; border-radius: 999px; }
        .art-advanced-arrow { transition: transform .2s ease; font-size: 10px; }
        .art-advanced-arrow.open { transform: rotate(180deg); }

        .art-advanced-panel {
          position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; width: 640px; max-width: 90vw;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px; align-items: end;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-md); padding: 16px 18px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
        }
        .art-advanced-field label { display: block; color: var(--ink-faint); font-size: 11.5px; margin-bottom: 6px; }
        .art-advanced-soon { color: var(--gold-light); font-size: 10px; }
        .art-advanced-field select, .art-advanced-field input {
          width: 100%; padding: 8px 11px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body); font-size: 12.5px; outline: none;
        }
        .art-advanced-field select:focus, .art-advanced-field input:focus { border-color: var(--teal-glow); }
        .art-advanced-field select option { background: var(--surface-2); color: var(--ink); }
        .art-advanced-clear {
          align-self: center; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,107,125,0.4);
          background: transparent; color: #ff9aa8; font-size: 12px; cursor: pointer; white-space: nowrap;
        }
        .art-advanced-clear:hover { background: rgba(122,35,48,0.12); }

        .art-columns-panel {
          position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; width: 260px;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-md); padding: 14px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
          display: flex; flex-direction: column; gap: 10px;
        }
        .art-columns-search {
          width: 100%; padding: 8px 11px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 12.5px; outline: none;
        }
        .art-columns-search:focus { border-color: var(--teal-glow); }
        .art-columns-list { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .art-columns-check { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12.5px; color: var(--ink); padding: 5px 4px; }
        .art-columns-check input { width: 14px; height: 14px; accent-color: var(--teal-glow); }
        .art-columns-all { border-bottom: 1px solid var(--line); padding-bottom: 8px; font-weight: 600; }

        .art-loading, .art-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .art-table-wrap { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); overflow-x: auto; }
        .art-table { width: 100%; border-collapse: collapse; font-size: 12.5px; white-space: nowrap; }
        .art-table th {
          text-align: right; padding: 11px 14px; color: var(--ink-faint); font-size: 11px; font-weight: 500;
          border-bottom: 1px solid var(--line); background: var(--panel-inset-bg); position: sticky; top: 0;
        }
        .art-table td { padding: 10px 14px; color: var(--ink); border-bottom: 1px solid var(--line); }
        .art-table tr:last-child td { border-bottom: none; }
        .art-table tr:hover td { background: rgba(255,255,255,0.02); }
        .art-mono { font-family: monospace; color: var(--ink-dim); }
        .art-dash { color: var(--ink-faint); }
        .art-wrap-cell { white-space: normal; max-width: 220px; }
        .art-user-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1px solid var(--line); }

        .art-badge { font-size: 11px; padding: 4px 11px; border-radius: 999px; border: 1px solid; white-space: nowrap; }

        .art-group-code-input {
          width: 70px; padding: 6px 9px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 12px; outline: none;
        }
        .art-group-code-input:focus { border-color: var(--teal-glow); }
        .art-group-code-saving { color: var(--ink-faint); font-size: 10.5px; margin-right: 4px; }

        .art-actions-cell { position: relative; }
        .art-menu-wrap { position: relative; display: inline-block; }
        .art-menu-btn {
          display: flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: var(--radius-sm);
          border: none; background: linear-gradient(135deg, var(--teal-light), var(--teal)); color: #eefaf5;
          font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font-body);
        }
        .art-menu-btn:hover { filter: brightness(1.08); }
        .art-menu-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .art-menu-caret { font-size: 9px; }

        .art-menu-backdrop { position: fixed; inset: 0; z-index: 40; }
        .art-menu-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; z-index: 41; min-width: 180px;
          background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-md);
          box-shadow: 0 16px 36px -10px rgba(0,0,0,0.5); overflow: hidden;
        }
        .art-menu-item {
          display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px;
          background: none; border: none; color: var(--ink); font-size: 13px; cursor: pointer;
          font-family: var(--font-body); text-align: right; text-decoration: none;
        }
        .art-menu-item:hover { background: rgba(255,255,255,0.05); }
        .art-menu-icon { font-size: 13px; width: 18px; text-align: center; }
        .art-menu-icon.ok { color: var(--status-ok); }
        .art-menu-icon.danger { color: var(--status-danger); }
        .art-menu-icon.warn { color: var(--status-warn); }
        .art-menu-icon.neutral { color: var(--status-neutral); }
        .art-menu-icon.info { color: var(--status-info); }

        .art-modal-backdrop {
          position: fixed; inset: 0; z-index: 200; background: rgba(6,13,11,0.75); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .art-modal {
          width: 100%; max-width: 440px; background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: 22px;
        }
        .art-modal h3 { font-family: var(--font-display); color: var(--teal-glow); font-size: 15px; margin-bottom: 14px; }
        .art-modal-textarea {
          width: 100%; padding: 10px 13px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body); font-size: 13px; outline: none; resize: vertical;
        }
        .art-modal-textarea:focus { border-color: var(--teal-glow); }
        .art-modal-actions { display: flex; gap: 10px; margin-top: 14px; }
        .art-reject-confirm {
          font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer;
          background: rgba(122,35,48,0.25); color: var(--status-danger); border: 1px solid rgba(122,35,48,0.5);
        }
        .art-reject-confirm.ok { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .art-reject-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
        .art-reject-cancel {
          font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer;
          background: transparent; color: var(--ink-dim); border: 1px solid var(--line);
        }

        .art-companion-checklist { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; }
        .art-companion-check { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--ink); }
        .art-companion-check input { width: 15px; height: 15px; accent-color: var(--teal-glow); }
        .art-companion-current-code { color: var(--ink-faint); font-size: 11px; }
      `}</style>
    </div>
  )
}

export default AdminRegistrations