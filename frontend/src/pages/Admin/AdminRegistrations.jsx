import { useEffect, useState } from 'react'
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

const paymentMeta = {
  unpaid: { label: 'پرداخت نشده', color: 'var(--status-danger)' },
  partial: { label: 'نیمه‌کامل', color: 'var(--status-warn)' },
  paid: { label: 'کامل', color: 'var(--status-ok)' },
}

const emptyAdvancedFilters = {
  status: '',
  first_name: '', last_name: '', national_code: '', mobile: '',
  gender: '', education_level: '', payment_method: '', refund_status: '',
  trip_id: '', student_status: '', university: '', group_code: '',
  participation_status: '', // فعلاً فقط UI، به بک‌اند وصل نیست
  nationality: '',
}

function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [trips, setTrips] = useState([])

  const [groupCodes, setGroupCodes] = useState({})
  const [savingGroupId, setSavingGroupId] = useState(null)
  const [companionPanels, setCompanionPanels] = useState({})

  useEffect(() => {
    api.get('/trips/admin/trips/').then(res => setTrips(res.data)).catch(() => {})
  }, [])

  const fetchRegistrations = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (key === 'participation_status') return // هنوز وصل نشده
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

  const handleAdvancedChange = (key, value) => {
    setAdvancedFilters({ ...advancedFilters, [key]: value })
  }

  const clearAdvancedFilters = () => {
    setAdvancedFilters(emptyAdvancedFilters)
  }

  const activeAdvancedCount = Object.entries(advancedFilters)
    .filter(([key, value]) => key !== 'participation_status' && value).length

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, { action: 'approve' })
      setRegistrations(registrations.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در تایید ثبت‌نام')
    }
    setBusyId(null)
  }
  const handleMarkPending = async (id) => {
    setBusyId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, { action: 'mark_pending' })
      setRegistrations(registrations.map(r => r.id === id ? res.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در تغییر وضعیت')
    }
    setBusyId(null)
  }
  const openReject = (id) => {
    setRejectingId(id)
    setRejectReason('')
  }

  const submitReject = async (id) => {
    setBusyId(id)
    try {
      const res = await api.post(`/trips/admin/registrations/${id}/action/`, {
        action: 'reject',
        rejection_reason: rejectReason,
      })
      setRegistrations(registrations.map(r => r.id === id ? res.data : r))
      setRejectingId(null)
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در رد ثبت‌نام')
    }
    setBusyId(null)
  }

  // ---------- کد گروه (اتوبوس) ----------

  const handleGroupCodeChange = (id, value) => {
    setGroupCodes({ ...groupCodes, [id]: value })
  }

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
          setCompanionPanels(p => ({ ...p, [id]: { list: netRes.data, selected, applying: false } }))
        }
      } else {
        setCompanionPanels(p => {
          const next = { ...p }
          delete next[id]
          return next
        })
      }
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت کد گروه')
    }
    setSavingGroupId(null)
  }

  const toggleCompanionSelected = (regId, companionRegId) => {
    setCompanionPanels(p => ({
      ...p,
      [regId]: {
        ...p[regId],
        selected: { ...p[regId].selected, [companionRegId]: !p[regId].selected[companionRegId] },
      },
    }))
  }

  const applyGroupCodeToCompanions = async (regId) => {
    const panel = companionPanels[regId]
    const selectedIds = Object.entries(panel.selected).filter(([, v]) => v).map(([k]) => Number(k))
    if (selectedIds.length === 0) return

    setCompanionPanels(p => ({ ...p, [regId]: { ...p[regId], applying: true } }))
    try {
      await api.post('/trips/admin/registrations/bulk-group-code/', {
        registration_ids: selectedIds,
        group_code: groupCodes[regId],
      })
      setGroupCodes(gc => {
        const next = { ...gc }
        selectedIds.forEach(id => { next[id] = groupCodes[regId] })
        return next
      })
      setRegistrations(regs => regs.map(r =>
        selectedIds.includes(r.id) ? { ...r, group_code: groupCodes[regId] } : r
      ))
      setCompanionPanels(p => {
        const next = { ...p }
        delete next[regId]
        return next
      })
    } catch {
      alert('خطا در اعمال کد گروه')
      setCompanionPanels(p => ({ ...p, [regId]: { ...p[regId], applying: false } }))
    }
  }

  const closeCompanionPanel = (regId) => {
    setCompanionPanels(p => {
      const next = { ...p }
      delete next[regId]
      return next
    })
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

      <div className="art-advanced-wrap">
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="art-advanced-toggle">
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
            <div className="art-advanced-field">
              <label>نام</label>
              <input type="text" value={advancedFilters.first_name} onChange={(e) => handleAdvancedChange('first_name', e.target.value)} />
            </div>
            <div className="art-advanced-field">
              <label>نام خانوادگی</label>
              <input type="text" value={advancedFilters.last_name} onChange={(e) => handleAdvancedChange('last_name', e.target.value)} />
            </div>
            <div className="art-advanced-field">
              <label>کد ملی</label>
              <input type="text" value={advancedFilters.national_code} onChange={(e) => handleAdvancedChange('national_code', e.target.value)} />
            </div>
            <div className="art-advanced-field">
              <label>شماره موبایل</label>
              <input type="text" value={advancedFilters.mobile} onChange={(e) => handleAdvancedChange('mobile', e.target.value)} />
            </div>
            <div className="art-advanced-field">
              <label>جنسیت</label>
              <select value={advancedFilters.gender} onChange={(e) => handleAdvancedChange('gender', e.target.value)}>
                <option value="">همه</option>
                <option value="male">برادر</option>
                <option value="female">خواهر</option>
              </select>
            </div>
            <div className="art-advanced-field">
              <label>مقطع تحصیلی</label>
              <select value={advancedFilters.education_level} onChange={(e) => handleAdvancedChange('education_level', e.target.value)}>
                <option value="">همه</option>
                <option value="diploma">دیپلم</option>
                <option value="associate">فوق دیپلم</option>
                <option value="bachelor">لیسانس</option>
                <option value="master">فوق لیسانس</option>
                <option value="phd">دکترا</option>
              </select>
            </div>
            <div className="art-advanced-field">
              <label>نحوه پرداخت</label>
              <select value={advancedFilters.payment_method} onChange={(e) => handleAdvancedChange('payment_method', e.target.value)}>
                <option value="">همه</option>
                <option value="online">آنلاین</option>
                <option value="cash">نقدی</option>
                <option value="wallet">کیف پول</option>
              </select>
            </div>
            <div className="art-advanced-field">
              <label>وضعیت عودت وجه</label>
              <select value={advancedFilters.refund_status} onChange={(e) => handleAdvancedChange('refund_status', e.target.value)}>
                <option value="">همه</option>
                <option value="__none__">بدون درخواست عودت</option>
                <option value="pending">در انتظار</option>
                <option value="approved">تایید شده</option>
                <option value="rejected">رد شده</option>
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
                <option value="">همه</option>
                <option value="student">دانشجو</option>
                <option value="graduate">فارغ‌التحصیل</option>
                <option value="professor">استاد</option>
              </select>
            </div>
            <div className="art-advanced-field">
              <label>نام دانشگاه</label>
              <input type="text" value={advancedFilters.university} onChange={(e) => handleAdvancedChange('university', e.target.value)} placeholder="مثلاً: تهران" />
            </div>
            <div className="art-advanced-field">
              <label>کد گروه</label>
              <input type="text" value={advancedFilters.group_code} onChange={(e) => handleAdvancedChange('group_code', e.target.value)} placeholder="مثلاً: 1" />
            </div>
            <div className="art-advanced-field">
              <label>وضعیت شرکت <span className="art-advanced-soon">(به‌زودی)</span></label>
              <select value={advancedFilters.participation_status} onChange={(e) => handleAdvancedChange('participation_status', e.target.value)}>
                <option value="">همه</option>
                <option value="attended">شرکت کرد</option>
                <option value="absent">شرکت نکرد</option>
              </select>
            </div>
            <div className="art-advanced-field">
              <label>ملیت</label>
              <input type="text" value={advancedFilters.nationality} onChange={(e) => handleAdvancedChange('nationality', e.target.value)} placeholder="مثلاً: ایران" />
            </div>

            {activeAdvancedCount > 0 && (
              <button onClick={clearAdvancedFilters} className="art-advanced-clear">پاک کردن فیلترها</button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="art-loading">در حال بارگذاری...</div>
      ) : registrations.length === 0 ? (
        <div className="art-empty">ثبت‌نامی یافت نشد</div>
      ) : (
        <div className="art-list">
          {registrations.map(r => {
            const panel = companionPanels[r.id]
            return (
              <div key={r.id} className="art-card">
                <div className="art-card-top">
                  <div>
                    <h3>{r.user_name}</h3>
                    <p>{r.trip_detail?.title} · کد پیگیری: <span className="art-mono">{r.tracking_code}</span></p>
                  </div>
                  <span
                    className="art-badge"
                    style={{ color: statusMeta[r.status]?.color, borderColor: statusMeta[r.status]?.color, background: statusMeta[r.status]?.bg }}
                  >
                    {statusMeta[r.status]?.label || r.status}
                  </span>
                </div>

                <div className="art-card-meta">
                  <span>هزینه کل: <strong>{r.total_cost?.toLocaleString('fa-IR')} ت</strong></span>
                  <span>باقیمانده: <strong>{r.remaining_amount?.toLocaleString('fa-IR')} ت</strong></span>
                  <span style={{ color: paymentMeta[r.payment_status]?.color }}>
                    پرداخت: {paymentMeta[r.payment_status]?.label}
                  </span>
                  <span>تاریخ: {new Date(r.registered_at).toLocaleDateString('fa-IR')}</span>
                </div>

                <div className="art-group-code-row">
                  <label>کد گروه (اتوبوس):</label>
                  <input
                    type="text"
                    value={groupCodes[r.id] ?? ''}
                    onChange={(e) => handleGroupCodeChange(r.id, e.target.value)}
                    onBlur={(e) => saveGroupCode(r.id, e.target.value)}
                    placeholder="مثلاً: 1"
                    className="art-group-code-input"
                  />
                  {savingGroupId === r.id && <span className="art-group-code-saving">در حال ذخیره...</span>}
                </div>

                {panel && (
                  <div className="art-companion-panel">
                    <p className="art-companion-panel-title">
                      اعمال کد گروه «{groupCodes[r.id]}» به همسفرهای {r.user_name}:
                    </p>
                    <div className="art-companion-checklist">
                      {panel.list.map(c => (
                        <label key={c.id} className="art-companion-check">
                          <input
                            type="checkbox"
                            checked={!!panel.selected[c.id]}
                            onChange={() => toggleCompanionSelected(r.id, c.id)}
                          />
                          <span>{c.user_name}</span>
                          {c.group_code && <span className="art-companion-current-code">(فعلی: {c.group_code})</span>}
                        </label>
                      ))}
                    </div>
                    <div className="art-companion-actions">
                      <button
                        onClick={() => applyGroupCodeToCompanions(r.id)}
                        disabled={panel.applying}
                        className="art-companion-apply"
                      >
                        {panel.applying ? '...' : 'اعمال به انتخاب‌شده‌ها'}
                      </button>
                      <button onClick={() => closeCompanionPanel(r.id)} className="art-companion-skip">
                        بی‌خیال
                      </button>
                    </div>
                  </div>
                )}

                {(r.status === 'pending' || r.status === '') && (
                  <div className="art-actions">
                     {r.status === '' && (
                      <button onClick={() => handleMarkPending(r.id)} disabled={busyId === r.id} className="art-pending-btn">
                        {busyId === r.id ? '...' : 'علامت‌گذاری در دست بررسی'}
                      </button>
                    )}
                    <button onClick={() => handleApprove(r.id)} disabled={busyId === r.id} className="art-approve-btn">
                      {busyId === r.id ? '...' : 'تایید ثبت‌نام'}
                    </button>
                    
                    <button onClick={() => openReject(r.id)} disabled={busyId === r.id} className="art-reject-btn">
                      رد کردن
                    </button>
                  </div>
                )}

                {rejectingId === r.id && (
                  <div className="art-reject-box">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="دلیل رد ثبت‌نام (اختیاری)..."
                      rows={2}
                      className="art-reject-input"
                    />
                    <div className="art-reject-actions">
                      <button onClick={() => submitReject(r.id)} disabled={busyId === r.id} className="art-reject-confirm">
                        {busyId === r.id ? '...' : 'تایید رد ثبت‌نام'}
                      </button>
                      <button onClick={() => setRejectingId(null)} className="art-reject-cancel">انصراف</button>
                    </div>
                  </div>
                )}

                {r.status === 'rejected' && r.rejection_reason && (
                  <p className="art-rejection-note">دلیل رد: {r.rejection_reason}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .art-page { display: flex; flex-direction: column; gap: 18px; }
        .art-heading { font-family: var(--font-display); color: var(--teal-glow); font-size: 21px; }

        .art-toolbar { display: flex; align-items: center; gap: 12px; }
        .art-search-form { display: flex; gap: 8px; flex: 1; max-width: 420px; }
        .art-search-input {
          flex: 1; padding: 9px 14px; background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 13px; outline: none;
        }
        .art-search-input:focus { border-color: var(--teal-glow); }
        .art-search-btn {
          padding: 0 16px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }
        .art-search-btn:hover { border-color: var(--teal-glow); color: var(--teal-glow); }

        .art-advanced-wrap { display: flex; flex-direction: column; gap: 10px; }
        .art-advanced-toggle {
          align-self: flex-start; display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 12.5px; cursor: pointer;
        }
        .art-advanced-toggle:hover { border-color: var(--teal-glow); color: var(--teal-glow); }
        .art-advanced-count {
          background: var(--teal-glow); color: #06130f; font-size: 10.5px; font-weight: 700;
          padding: 1px 7px; border-radius: 999px;
        }
        .art-advanced-arrow { transition: transform .2s ease; font-size: 10px; }
        .art-advanced-arrow.open { transform: rotate(180deg); }

        .art-advanced-panel {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px; align-items: end;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-md); padding: 16px 18px;
        }
        .art-advanced-field label { display: block; color: var(--ink-faint); font-size: 11.5px; margin-bottom: 6px; }
        .art-advanced-soon { color: var(--gold-light); font-size: 10px; }
        .art-advanced-field select, .art-advanced-field input {
          width: 100%; padding: 8px 11px;
          background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body);
          font-size: 12.5px; outline: none;
        }
        .art-advanced-field select:focus, .art-advanced-field input:focus { border-color: var(--teal-glow); }
        .art-advanced-field select option { background: var(--surface-2); color: var(--ink); }
        .art-advanced-clear {
          align-self: center; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,107,125,0.4);
          background: transparent; color: #ff9aa8; font-size: 12px; cursor: pointer; white-space: nowrap;
        }
        .art-advanced-clear:hover { background: rgba(122,35,48,0.12); }

        .art-loading, .art-empty { text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px; }

        .art-list { display: flex; flex-direction: column; gap: 14px; }
        .art-card {
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: 18px 20px;
        }
        .art-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .art-card-top h3 { color: var(--ink); font-size: 14.5px; font-weight: 700; }
        .art-card-top p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .art-mono { font-family: monospace; }
        .art-badge { font-size: 11.5px; padding: 4px 12px; border-radius: 999px; border: 1px solid; white-space: nowrap; flex-shrink: 0; }

        .art-card-meta {
          display: flex; flex-wrap: wrap; gap: 16px;
          color: var(--ink-dim); font-size: 12px;
          padding: 10px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
          margin-bottom: 12px;
        }
        .art-card-meta strong { color: var(--ink); }

        .art-group-code-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .art-group-code-row label { color: var(--ink-dim); font-size: 12.5px; white-space: nowrap; }
        .art-group-code-input {
          width: 100px; padding: 7px 11px;
          background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 12.5px; outline: none;
        }
        .art-group-code-input:focus { border-color: var(--teal-glow); }
        .art-group-code-saving { color: var(--ink-faint); font-size: 11px; }

        .art-companion-panel {
          background: var(--panel-inset-bg); border: 1px dashed var(--line);
          border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 12px;
        }
        .art-companion-panel-title { color: var(--teal-glow); font-size: 12.5px; font-weight: 600; margin-bottom: 10px; }
        .art-companion-checklist { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .art-companion-check { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--ink); }
        .art-companion-check input { width: 15px; height: 15px; accent-color: var(--teal-glow); }
        .art-companion-current-code { color: var(--ink-faint); font-size: 11px; }
        .art-companion-actions { display: flex; gap: 10px; }
        .art-companion-apply {
          font-size: 12px; padding: 7px 16px; border-radius: 999px; cursor: pointer;
          background: var(--status-ok-bg); color: var(--status-ok); border: 1px solid var(--status-ok);
        }
        .art-companion-apply:disabled { opacity: 0.6; cursor: not-allowed; }
        .art-companion-skip {
          font-size: 12px; padding: 7px 16px; border-radius: 999px; cursor: pointer;
          background: transparent; color: var(--ink-faint); border: 1px solid var(--line);
        }

        .art-actions { display: flex; gap: 10px; }
        .art-approve-btn, .art-reject-btn {
          font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer; border: 1px solid;
        }
        .art-approve-btn { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .art-approve-btn:hover { background: rgba(75,214,172,0.22); }
        .art-reject-btn { background: transparent; color: var(--status-danger); border-color: var(--status-danger); }
        .art-reject-btn:hover { background: rgba(122,35,48,0.12); }
        .art-approve-btn:disabled, .art-reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .art-pending-btn {
          font-size: 12.5px; padding: 8px 18px; border-radius: 999px; cursor: pointer; border: 1px solid;
          background: var(--status-warn-bg); color: var(--status-warn); border-color: var(--status-warn);
        }
        .art-pending-btn:hover { background: rgba(216,181,104,0.22); }
        .art-pending-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .art-reject-box { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--line); }
        .art-reject-input {
          width: 100%; padding: 9px 12px; background: var(--input-bg);
          border: 1px solid var(--line); border-radius: var(--radius-sm);
          color: var(--ink); font-family: var(--font-body); font-size: 12.5px; outline: none; resize: vertical;
        }
        .art-reject-input:focus { border-color: var(--teal-glow); }
        .art-reject-actions { display: flex; gap: 8px; margin-top: 8px; }
        .art-reject-confirm {
          font-size: 12px; padding: 7px 16px; border-radius: 999px; cursor: pointer;
          background: rgba(122,35,48,0.25); color: var(--status-danger); border: 1px solid rgba(122,35,48,0.5);
        }
        .art-reject-cancel {
          font-size: 12px; padding: 7px 16px; border-radius: 999px; cursor: pointer;
          background: transparent; color: var(--ink-dim); border: 1px solid var(--line);
        }

        .art-rejection-note { margin-top: 10px; color: var(--status-danger); font-size: 12px; }
      `}</style>
    </div>
  )
}

export default AdminRegistrations