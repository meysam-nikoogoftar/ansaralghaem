'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { errorMessage, fieldErrors } from '@/lib/api/errors'
import Dialog from '@/components/ui/dialog'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useEffect, useState } from 'react'
import Link from '@/components/navigation/app-link'
import api from '@/lib/admin/api'
import { safeMediaPath } from '@/lib/urls'

const statusMeta = {
  '': { label: 'بدون وضعیت', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  pending: { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  cancelled: {
    label: 'انصراف داده',
    color: 'var(--status-neutral)',
    bg: 'var(--status-neutral-bg)',
  },
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

const emptyAdvancedFilters = {
  status: '',
  first_name: '',
  last_name: '',
  national_code: '',
  mobile: '',
  gender: '',
  education_level: '',
  payment_method: '',
  refund_status: '',
  trip_id: '',
  student_status: '',
  university: '',
  group_code: '',
  participation_status: '',
  nationality: '',
}

function AdminRegistrations() {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [registrations, setRegistrations] = useState([])
  const isLoading = !loadState.started || loadState.pending > 0
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')

  const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [trips, setTrips] = useState([])

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const init = {}
    ALL_COLUMNS.forEach((c) => {
      init[c.id] = c.default
    })
    return init
  })
  const [showColumns, setShowColumns] = useState(false)
  const [columnSearch, setColumnSearch] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const [groupCodes, setGroupCodes] = useState({})
  const [savingGroupId, setSavingGroupId] = useState(null)
  const [companionModal, setCompanionModal] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [noteModal, setNoteModal] = useState(null)
  const [participationModal, setParticipationModal] = useState(null)

  useEffect(() => {
    observeLoad(
      () => api.get('/trips/admin/trip-options/').then(setTrips),
      "'/trips/admin/trip-options/'",
    )
  }, [observeLoad])

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const res = await api.get(`/trips/admin/registrations/export/?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(res)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ثبت‌نام‌ها-${new Date().toLocaleDateString('fa-IR')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در دریافت خروجی اکسل')
    }
    setIsExporting(false)
  }
  function fetchRegistrations() {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    observeLoad(
      () =>
        api.get(`/trips/admin/registrations/?${params.toString()}`).then((res) => {
          setRegistrations(res)
          const codes = {}
          res.forEach((r) => {
            codes[r.id] = r.group_code || ''
          })
          setGroupCodes(codes)
        }),
      '`/trips/admin/registrations/?${params.toString()}`',
    )
  }

  useEffect(() => {
    fetchRegistrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFilters])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchRegistrations()
  }

  const handleAdvancedChange = (key, value) =>
    setAdvancedFilters({ ...advancedFilters, [key]: value })
  const clearAdvancedFilters = () => setAdvancedFilters(emptyAdvancedFilters)
  const activeAdvancedCount = Object.values(advancedFilters).filter(Boolean).length

  const toggleColumn = (id) => setVisibleColumns({ ...visibleColumns, [id]: !visibleColumns[id] })
  const toggleAllColumns = () => {
    const allOn = ALL_COLUMNS.every((c) => visibleColumns[c.id])
    const next = {}
    ALL_COLUMNS.forEach((c) => {
      next[c.id] = !allOn
    })
    setVisibleColumns(next)
  }
  const filteredColumnList = ALL_COLUMNS.filter((c) => c.label.includes(columnSearch))
  const col = (id) => visibleColumns[id]

  // ---------- اکشن‌های ثبت‌نام ----------

  const runAction = async (id, action, extra = {}) => {
    setValidationErrors({})

    setBusyId(id)
    setActionError('')
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, { action, ...extra })
      setRegistrations((regs) => regs.map((r) => (r.id === id ? res : r)))
      return true
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      setActionError(errorMessage(err, 'ذخیره انجام نشد. دوباره تلاش کنید؛ متن شما حفظ شده است.'))
      return false
    } finally {
      setBusyId(null)
    }
  }

  const handleMenuAction = (id, action) => {
    setOpenMenuId(null)
    if (action === 'reject') {
      const r = registrations.find((x) => x.id === id)
      setRejectModal({ id, reason: r?.rejection_reason || '' })
    } else if (action === 'note') {
      const r = registrations.find((x) => x.id === id)
      setNoteModal({ id, text: r?.admin_note || '' })
    } else if (action === 'mark_attended' || action === 'mark_absent') {
      setParticipationModal({ id, action })
    } else {
      runAction(id, action)
    }
  }

  const submitReject = async () => {
    if (await runAction(rejectModal.id, 'reject', { rejection_reason: rejectModal.reason }))
      setRejectModal(null)
  }

  const submitNote = async () => {
    if (await runAction(noteModal.id, 'set_note', { admin_note: noteModal.text }))
      setNoteModal(null)
  }

  const confirmParticipation = async () => {
    if (await runAction(participationModal.id, participationModal.action))
      setParticipationModal(null)
  }

  // ---------- کد گروه (اتوبوس) ----------

  const handleGroupCodeChange = (id, value) => setGroupCodes({ ...groupCodes, [id]: value })

  const saveGroupCode = async (id, value) => {
    setValidationErrors({})

    setSavingGroupId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/group-code/`, {
        group_code: value,
      })
      setRegistrations((regs) => regs.map((r) => (r.id === id ? res : r)))

      if (value) {
        const netRes = await api.get(`/trips/admin/registrations/${id}/companions-network/`)
        if (netRes.length > 0) {
          const selected = {}
          netRes.forEach((r) => {
            selected[r.id] = true
          })
          setCompanionModal({ regId: id, code: value, list: netRes, selected, applying: false })
        }
      }
    } catch (err) {
      setValidationErrors({ [`group_code-${id}`]: errorMessage(err) })

      alert(errorMessage(err, 'خطا در ثبت کد گروه'))
    }
    setSavingGroupId(null)
  }

  const toggleCompanionSelected = (companionRegId) => {
    setCompanionModal((m) => ({
      ...m,
      selected: { ...m.selected, [companionRegId]: !m.selected[companionRegId] },
    }))
  }

  const applyGroupCodeToCompanions = async () => {
    setValidationErrors({})

    const selectedIds = Object.entries(companionModal.selected)
      .filter(([, v]) => v)
      .map(([k]) => Number(k))
    if (selectedIds.length === 0) {
      setCompanionModal(null)
      return
    }

    setCompanionModal((m) => ({ ...m, applying: true }))
    try {
      await api.post('/trips/admin/registrations/bulk-group-code/', {
        registration_ids: selectedIds,
        group_code: companionModal.code,
      })
      setGroupCodes((gc) => {
        const next = { ...gc }
        selectedIds.forEach((id) => {
          next[id] = companionModal.code
        })
        return next
      })
      setRegistrations((regs) =>
        regs.map((r) =>
          selectedIds.includes(r.id) ? { ...r, group_code: companionModal.code } : r,
        ),
      )
      setCompanionModal(null)
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      alert('خطا در اعمال کد گروه')
      setCompanionModal((m) => ({ ...m, applying: false }))
    }
  }

  const participationLabel = (r) => {
    if (r.status === 'attended') return 'شرکت کرد'
    if (r.status === 'absent') return 'شرکت نکرد'
    return '—'
  }

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="art-page">
            <h1 className="art-heading">مدیریت ثبت‌نام‌ها</h1>

            <div className="art-toolbar">
              <form onSubmit={handleSearchSubmit} className="art-search-form">
                <FormControl
                  as="input"
                  hiddenLabel
                  label="جستجو بر اساس نام، موبایل، کد ملی یا کد پیگیری..."
                  name="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو بر اساس نام، موبایل، کد ملی یا کد پیگیری..."
                  className="art-search-input"
                />
                <button type="submit" className="art-search-btn">
                  جستجو
                </button>
              </form>
            </div>

            <div className="art-toggles-row">
              <button
                aria-expanded={showAdvanced}
                aria-controls="registration-advanced-filters"
                onClick={() => {
                  setShowAdvanced(!showAdvanced)
                  setShowColumns(false)
                }}
                className="art-advanced-toggle"
              >
                فیلتر پیشرفته{' '}
                {activeAdvancedCount > 0 && (
                  <span className="art-advanced-count">{activeAdvancedCount}</span>
                )}
                <span className={`art-advanced-arrow${showAdvanced ? ' open' : ''}`}>▾</span>
              </button>

              <button
                aria-expanded={showColumns}
                aria-controls="registration-columns"
                onClick={() => {
                  setShowColumns(!showColumns)
                  setShowAdvanced(false)
                }}
                className="art-advanced-toggle"
              >
                نمایش / عدم نمایش ستون‌ها
                <span className={`art-advanced-arrow${showColumns ? ' open' : ''}`}>▾</span>
              </button>

              <button onClick={handleExportExcel} disabled={isExporting} className="art-export-btn">
                {isExporting ? 'در حال آماده‌سازی...' : '📥 خروجی اکسل'}
              </button>
            </div>

            {showAdvanced && (
              <div id="registration-advanced-filters" className="art-advanced-panel">
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>وضعیت</>}
                    value={advancedFilters.status}
                    onChange={(e) => handleAdvancedChange('status', e.target.value)}
                  >
                    <option value="">همه وضعیت‌ها</option>
                    <option value="__blank__">بدون وضعیت</option>
                    <option value="pending">در دست بررسی</option>
                    <option value="approved">تایید</option>
                    <option value="rejected">رد</option>
                    <option value="cancelled">انصراف</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>نام</>}
                    type="text"
                    value={advancedFilters.first_name}
                    onChange={(e) => handleAdvancedChange('first_name', e.target.value)}
                  />
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>نام خانوادگی</>}
                    type="text"
                    value={advancedFilters.last_name}
                    onChange={(e) => handleAdvancedChange('last_name', e.target.value)}
                  />
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>کد ملی</>}
                    type="text"
                    value={advancedFilters.national_code}
                    onChange={(e) => handleAdvancedChange('national_code', e.target.value)}
                  />
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>شماره موبایل</>}
                    type="text"
                    value={advancedFilters.mobile}
                    onChange={(e) => handleAdvancedChange('mobile', e.target.value)}
                  />
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>جنسیت</>}
                    value={advancedFilters.gender}
                    onChange={(e) => handleAdvancedChange('gender', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="male">برادر</option>
                    <option value="female">خواهر</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>مقطع تحصیلی</>}
                    value={advancedFilters.education_level}
                    onChange={(e) => handleAdvancedChange('education_level', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="diploma">دیپلم</option>
                    <option value="associate">فوق دیپلم</option>
                    <option value="bachelor">لیسانس</option>
                    <option value="master">فوق لیسانس</option>
                    <option value="phd">دکترا</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>نحوه پرداخت</>}
                    value={advancedFilters.payment_method}
                    onChange={(e) => handleAdvancedChange('payment_method', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="online">آنلاین</option>
                    <option value="cash">نقدی</option>
                    <option value="wallet">کیف پول</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>وضعیت عودت وجه</>}
                    value={advancedFilters.refund_status}
                    onChange={(e) => handleAdvancedChange('refund_status', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="__none__">بدون درخواست عودت</option>
                    <option value="pending">در انتظار</option>
                    <option value="approved">تایید شده</option>
                    <option value="rejected">رد شده</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>سفر زیارتی</>}
                    value={advancedFilters.trip_id}
                    onChange={(e) => handleAdvancedChange('trip_id', e.target.value)}
                  >
                    <option value="">همه</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>وضعیت دانشجویی</>}
                    value={advancedFilters.student_status}
                    onChange={(e) => handleAdvancedChange('student_status', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="student">دانشجو</option>
                    <option value="graduate">فارغ‌التحصیل</option>
                    <option value="professor">استاد</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>نام دانشگاه</>}
                    type="text"
                    value={advancedFilters.university}
                    onChange={(e) => handleAdvancedChange('university', e.target.value)}
                    placeholder="مثلاً: تهران"
                  />
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>کد گروه</>}
                    type="text"
                    value={advancedFilters.group_code}
                    onChange={(e) => handleAdvancedChange('group_code', e.target.value)}
                    placeholder="مثلاً: 1"
                  />
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="select"
                    label={<>وضعیت شرکت</>}
                    value={advancedFilters.participation_status}
                    onChange={(e) => handleAdvancedChange('participation_status', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="attended">شرکت کرد</option>
                    <option value="absent">شرکت نکرد</option>
                  </FormControl>
                </div>
                <div className="art-advanced-field">
                  <FormControl
                    as="input"
                    label={<>ملیت</>}
                    type="text"
                    value={advancedFilters.nationality}
                    onChange={(e) => handleAdvancedChange('nationality', e.target.value)}
                    placeholder="مثلاً: ایران"
                  />
                </div>

                {activeAdvancedCount > 0 && (
                  <button onClick={clearAdvancedFilters} className="art-advanced-clear">
                    پاک کردن فیلترها
                  </button>
                )}
              </div>
            )}

            {showColumns && (
              <div id="registration-columns" className="art-columns-panel">
                <FormControl
                  as="input"
                  hiddenLabel
                  label="جستجوی ستون..."
                  name="columnSearch"
                  type="text"
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  placeholder="جستجوی ستون..."
                  className="art-columns-search"
                />
                <label className="art-columns-check art-columns-all">
                  <FormControl
                    as="input"
                    type="checkbox"
                    checked={ALL_COLUMNS.every((c) => visibleColumns[c.id])}
                    onChange={toggleAllColumns}
                  />
                  <span>همه موارد</span>
                </label>
                <div className="art-columns-list">
                  {filteredColumnList.map((c) => (
                    <label key={c.id} className="art-columns-check">
                      <FormControl
                        as="input"
                        type="checkbox"
                        checked={!!visibleColumns[c.id]}
                        onChange={() => toggleColumn(c.id)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="art-loading">در حال بارگذاری...</div>
            ) : registrations.length === 0 && (!loadState.started || loadState.pending > 0) ? (
              <p className="field-hint" role="status">
                در حال دریافت اطلاعات…
              </p>
            ) : loadState.errors.length > 0 &&
              registrations.length === 0 ? null : registrations.length === 0 ? (
              <div className="art-empty">ثبت‌نامی یافت نشد</div>
            ) : (
              <div className="art-table-wrap">
                <table className="art-table">
                  <thead>
                    <tr>
                      {ALL_COLUMNS.filter((c) => col(c.id)).map((c) => (
                        <th key={c.id}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        {col('trip') && <td>{r.trip_detail?.title}</td>}
                        {col('user_image') && (
                          <td>
                            {r.user_image ? (
                              <img
                                src={safeMediaPath(r.user_image) ?? undefined}
                                alt=""
                                className="art-user-avatar"
                              />
                            ) : (
                              <span className="art-dash">—</span>
                            )}
                          </td>
                        )}
                        {col('first_name') && <td>{r.user_first_name}</td>}
                        {col('last_name') && <td>{r.user_last_name}</td>}
                        {col('father_name') && (
                          <td>{r.user_father_name || <span className="art-dash">—</span>}</td>
                        )}
                        {col('national_code') && (
                          <td className="art-mono">{r.user_national_code}</td>
                        )}
                        {col('nationality') && <td>{r.user_nationality}</td>}
                        {col('mobile') && <td className="art-mono">{r.user_mobile}</td>}
                        {col('birth_date') && (
                          <td>{r.user_birth_date || <span className="art-dash">—</span>}</td>
                        )}
                        {col('registered_at') && (
                          <td>{new Date(r.registered_at).toLocaleDateString('fa-IR')}</td>
                        )}
                        {col('university') && (
                          <td>{r.user_university || <span className="art-dash">—</span>}</td>
                        )}
                        {col('tracking_code') && <td className="art-mono">{r.tracking_code}</td>}
                        {col('payment_method') && (
                          <td>
                            {paymentMethodLabel[r.payment_method] || (
                              <span className="art-dash">—</span>
                            )}
                          </td>
                        )}
                        {col('card_number') && (
                          <td>{r.card_number || <span className="art-dash">—</span>}</td>
                        )}
                        {col('payment_number') && (
                          <td>
                            {r.payment_number ?? (
                              <span className="art-dash" title="اطلاعاتی ثبت نشده است">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        {col('credit') && (
                          <td>
                            {r.credit ?? (
                              <span className="art-dash" title="اطلاعاتی ثبت نشده است">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        {col('paid_amount') && (
                          <td>
                            {(
                              Number(r.paid_from_wallet || 0) + Number(r.paid_directly || 0)
                            ).toLocaleString('fa-IR')}{' '}
                            ت
                          </td>
                        )}
                        {col('group_code') && (
                          <td>
                            <FormControl
                              as="input"
                              hiddenLabel
                              label={`کد گروه ${r.user_name || r.tracking_code}`}
                              type="text"
                              value={groupCodes[r.id] ?? ''}
                              onChange={(e) => handleGroupCodeChange(r.id, e.target.value)}
                              onBlur={(e) => saveGroupCode(r.id, e.target.value)}
                              placeholder="—"
                              id={`group-code-${r.id}`}
                              name={`group_code-${r.id}`}
                              className="art-group-code-input"
                            />
                            {savingGroupId === r.id && (
                              <span className="art-group-code-saving">...</span>
                            )}
                          </td>
                        )}
                        {col('pilgrim_id') && (
                          <td>
                            {r.pilgrim_id ?? (
                              <span className="art-dash" title="اطلاعاتی ثبت نشده است">
                                —
                              </span>
                            )}
                          </td>
                        )}
                        {col('actions') && (
                          <td className="art-actions-cell">
                            <div
                              className="art-menu-wrap"
                              onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                  setOpenMenuId(null)
                                  event.currentTarget.querySelector('button')?.focus()
                                }
                              }}
                            >
                              <button
                                id={`registration-action-trigger-${r.id}`}
                                aria-expanded={openMenuId === r.id}
                                aria-controls={`registration-actions-${r.id}`}
                                onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                                className="art-menu-btn"
                                disabled={busyId === r.id}
                              >
                                {busyId === r.id ? '...' : 'عملیات'}{' '}
                                <span className="art-menu-caret">▾</span>
                              </button>
                              {openMenuId === r.id && (
                                <>
                                  <div
                                    className="art-menu-backdrop"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div
                                    id={`registration-actions-${r.id}`}
                                    className="art-menu-dropdown"
                                  >
                                    <Link
                                      href={`/admin/users/${r.user}`}
                                      className="art-menu-item"
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      <span className="art-menu-icon info">👁</span> مشاهده جزئیات
                                    </Link>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'reset')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon neutral">○</span> بدون وضعیت
                                    </button>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'mark_pending')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon warn">✋</span> در دست بررسی
                                    </button>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'approve')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon ok">✔</span> تایید
                                    </button>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'reject')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon danger">✕</span> رد
                                    </button>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'mark_attended')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon ok">✔</span> شرکت کرد
                                    </button>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'mark_absent')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon danger">⊘</span> شرکت نکرد
                                    </button>
                                    <button
                                      onClick={() => handleMenuAction(r.id, 'note')}
                                      className="art-menu-item"
                                    >
                                      <span className="art-menu-icon info">ℹ</span> سایر توضیحات
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                        {col('refund_requested') && <td>{r.refund_requested ? 'بله' : 'خیر'}</td>}
                        {col('refund_status') && (
                          <td>
                            {r.refund_status ? (
                              refundStatusLabel[r.refund_status] || r.refund_status
                            ) : (
                              <span className="art-dash">—</span>
                            )}
                          </td>
                        )}
                        {col('status') && (
                          <td>
                            <span
                              className="art-badge"
                              style={{
                                color: statusMeta[r.status]?.color,
                                borderColor: statusMeta[r.status]?.color,
                                background: statusMeta[r.status]?.bg,
                              }}
                            >
                              {statusMeta[r.status]?.label || r.status}
                            </span>
                          </td>
                        )}
                        {col('rejection_reason') && (
                          <td className="art-wrap-cell">
                            {r.rejection_reason || <span className="art-dash">—</span>}
                          </td>
                        )}
                        {col('participation_status') && <td>{participationLabel(r)}</td>}
                        {col('admin_note') && (
                          <td className="art-wrap-cell">
                            {r.admin_note || <span className="art-dash">—</span>}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* مودال رد ثبت‌نام */}
            {rejectModal && (
              <Dialog
                label="جزئیات ثبت‌نام"
                returnFocus={`#registration-action-trigger-${rejectModal.id}`}
                className="art-modal-backdrop"
                onClose={() => setRejectModal(null)}
              >
                <div className="art-modal" onClick={(e) => e.stopPropagation()}>
                  {actionError && (
                    <p role="alert" className="field-error">
                      {actionError}
                    </p>
                  )}
                  <h3>دلیل رد ثبت‌نام</h3>
                  <FormControl
                    as="textarea"
                    hiddenLabel
                    label="دلیل رد (اختیاری)..."
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    placeholder="دلیل رد (اختیاری)..."
                    rows={4}
                    className="art-modal-textarea"
                  />
                  <div className="art-modal-actions">
                    <button
                      onClick={submitReject}
                      disabled={busyId === rejectModal.id}
                      className="art-reject-confirm"
                    >
                      {busyId === rejectModal.id ? '...' : 'ثبت رد'}
                    </button>
                    <button onClick={() => setRejectModal(null)} className="art-reject-cancel">
                      انصراف
                    </button>
                  </div>
                </div>
              </Dialog>
            )}

            {/* مودال سایر توضیحات */}
            {noteModal && (
              <Dialog
                label="جزئیات ثبت‌نام"
                returnFocus={`#registration-action-trigger-${noteModal.id}`}
                className="art-modal-backdrop"
                onClose={() => setNoteModal(null)}
              >
                <div className="art-modal" onClick={(e) => e.stopPropagation()}>
                  {actionError && (
                    <p role="alert" className="field-error">
                      {actionError}
                    </p>
                  )}
                  <h3>سایر توضیحات ادمین</h3>
                  <FormControl
                    as="textarea"
                    hiddenLabel
                    label="توضیحات داخلی درباره این ثبت‌نام..."
                    value={noteModal.text}
                    onChange={(e) => setNoteModal({ ...noteModal, text: e.target.value })}
                    placeholder="توضیحات داخلی درباره این ثبت‌نام..."
                    rows={4}
                    className="art-modal-textarea"
                  />
                  <div className="art-modal-actions">
                    <button
                      onClick={submitNote}
                      disabled={busyId === noteModal.id}
                      className="art-reject-confirm ok"
                    >
                      {busyId === noteModal.id ? '...' : 'ذخیره توضیحات'}
                    </button>
                    <button onClick={() => setNoteModal(null)} className="art-reject-cancel">
                      انصراف
                    </button>
                  </div>
                </div>
              </Dialog>
            )}

            {/* مودال تایید شرکت/عدم شرکت */}
            {participationModal && (
              <Dialog
                label="جزئیات ثبت‌نام"
                returnFocus={`#registration-action-trigger-${participationModal.id}`}
                className="art-modal-backdrop"
                onClose={() => setParticipationModal(null)}
              >
                <div className="art-modal art-confirm-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="art-confirm-icon">!</div>
                  <h3>
                    {participationModal.action === 'mark_attended'
                      ? 'تایید / عدم تایید شرکت در برنامه'
                      : 'رد / عدم رد شرکت در برنامه'}
                  </h3>
                  <p className="art-confirm-text">
                    {participationModal.action === 'mark_attended'
                      ? 'آیا مایل به تایید شرکت در برنامه می‌باشید؟'
                      : 'آیا مایل به رد شرکت در برنامه می‌باشید؟'}
                  </p>
                  <div className="art-modal-actions art-confirm-actions">
                    <button
                      onClick={confirmParticipation}
                      disabled={busyId === participationModal.id}
                      className="art-confirm-ok"
                    >
                      {busyId === participationModal.id ? '...' : 'OK'}
                    </button>
                    <button
                      onClick={() => setParticipationModal(null)}
                      className="art-reject-cancel"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </Dialog>
            )}

            {/* مودال اعمال کد گروه به همسفرها */}
            {companionModal && (
              <Dialog
                label="جزئیات ثبت‌نام"
                returnFocus={`#group-code-${companionModal.regId}`}
                className="art-modal-backdrop"
                onClose={() => setCompanionModal(null)}
              >
                <div className="art-modal" onClick={(e) => e.stopPropagation()}>
                  {actionError && (
                    <p role="alert" className="field-error">
                      {actionError}
                    </p>
                  )}
                  <h3>اعمال کد گروه «{companionModal.code}» به همسفرها</h3>
                  <div className="art-companion-checklist">
                    {companionModal.list.map((c) => (
                      <label key={c.id} className="art-companion-check">
                        <FormControl
                          as="input"
                          type="checkbox"
                          checked={!!companionModal.selected[c.id]}
                          onChange={() => toggleCompanionSelected(c.id)}
                        />
                        <span>{c.user_name}</span>
                        {c.group_code && (
                          <span className="art-companion-current-code">(فعلی: {c.group_code})</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <div className="art-modal-actions">
                    <button
                      onClick={applyGroupCodeToCompanions}
                      disabled={companionModal.applying}
                      className="art-reject-confirm ok"
                    >
                      {companionModal.applying ? '...' : 'اعمال به انتخاب‌شده‌ها'}
                    </button>
                    <button onClick={() => setCompanionModal(null)} className="art-reject-cancel">
                      بی‌خیال
                    </button>
                  </div>
                </div>
              </Dialog>
            )}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminRegistrations
