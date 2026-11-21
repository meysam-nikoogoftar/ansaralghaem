import FormValidation from '../../components/FormValidation'
import { fieldErrors } from '../../utils/validation'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import FormControl from '../../components/FormControl'
import { useEffect, useRef, useState } from 'react'
import Dialog from '../../components/Dialog'
import ErrorSummary from '../../components/ErrorSummary'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import './admin-overview.css'
import useAuthStore from '../../store/authStore'

const typeMeta = {
  user: { label: 'کاربر عادی', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  admin: { label: 'ادمین', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  superadmin: { label: 'سوپرادمین', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminUsers() {
  const { user: currentUser } = useAuthStore()
  const isSuperAdmin = currentUser?.user_type === 'superadmin'
  const { observeLoad, loadState, retryLoad } = useLoadFeedback()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [serverPage, setServerPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [loadedFor, setLoadedFor] = useState(null)
  const [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const pending = useRef(false)
  const [message, setMessage] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const isLoading = !loadState.started || loadState.pending > 0
  const requestKey = JSON.stringify([query, typeFilter, serverPage, revision])
  const loaded = loadedFor === requestKey
  const size = 12
  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (typeFilter) params.set('user_type', typeFilter)
    if (serverPage > 1) params.set('page', String(serverPage))
    observeLoad(async () => {
      const response = await api.get(`/accounts/admin/users/?${params}`, { signal: controller.signal })
      if (controller.signal.aborted) return
      const data = response.data
      setUsers(Array.isArray(data) ? data : data.results || [])
      setPagination(Array.isArray(data) ? null : { count: data.count, next: data.next, previous: data.previous })
      setLoadedFor(requestKey)
    }, 'admin-users')
    return () => controller.abort()
  }, [query, typeFilter, serverPage, revision, observeLoad, requestKey])

  const resetPages = () => { setPage(1); setServerPage(1) }
  const total = pagination?.count ?? users.length
  const pages = Math.max(1, Math.ceil(users.length / size))
  const visibleUsers = pagination ? users : users.slice((page - 1) * size, page * size)
  const changeRole = async () => {
    if (!selected || pending.current || !isSuperAdmin || selected.user_type === 'superadmin') return
    pending.current = true
    setBusyId(selected.id)
    setMessage(null)
    setValidationErrors({})
    const newType = selected.user_type === 'admin' ? 'user' : 'admin'
    try {
      await api.post(`/accounts/admin/users/${selected.id}/promote/`, { user_type: newType })
      setMessage({ text: `نقش ${selected.first_name || 'کاربر'} به «${typeMeta[newType].label}» تغییر کرد.`, error: false })
      setSelected(null)
      resetPages()
      setRevision(value => value + 1)
    } catch (error) {
      setValidationErrors(fieldErrors(error))
      setMessage({ text: error.response?.data?.error || 'تغییر نقش انجام نشد. دوباره تلاش کنید.', error: true })
    } finally { pending.current = false; setBusyId(null) }
  }
  const resetFilters = () => { setSearch(''); setQuery(''); setTypeFilter(''); resetPages() }
  const actions = user => (<div className="aus-row-actions"><Link to={`/admin/users/${user.id}`} className="aus-detail-btn" aria-label={`جزئیات ${user.first_name || 'کاربر'} ${user.last_name || ''}`}>مشاهده پرونده</Link>{isSuperAdmin && user.user_type !== 'superadmin' && <button type="button" disabled={busyId !== null} onClick={() => { setSelected(user); setMessage(null); setValidationErrors({}) }} className={`aus-role-btn${user.user_type === 'admin' ? ' demote' : ''}`}>تغییر نقش</button>}</div>)
  return <FormValidation errors={validationErrors}><div className="aus-page">
    <header className="admin-page-heading"><div><h1 className="aus-heading">مدیریت کاربران</h1><p>جستجوی اعضا، بررسی اطلاعات و مدیریت نقش‌ها.</p></div><span className="admin-heading-note">تغییر نقش فقط برای سوپرادمین</span></header>
    <LoadFeedback state={loadState} onRetry={retryLoad} />
    {message && !selected && <p className={`aus-message ${message.error ? 'error' : ''}`} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
    <div className="aus-control-panel">
      <form onSubmit={event => { event.preventDefault(); setQuery(search.trim().replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))); resetPages(); setRevision(value => value + 1) }} className="aus-search-form">
        <div className="aus-search-field"><FormControl as="input" label="جستجوی کاربران" name="search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="نام، شماره موبایل یا کد ملی" className="aus-search-input" /></div>
        <button type="submit" className="aus-search-btn">جستجو</button>
      </form>
      <div className="aus-filter-row"><div className="aus-type-tabs" role="group" aria-label="فیلتر نقش کاربران">{[['', 'همه نقش‌ها'], ['user', 'کاربر عادی'], ['admin', 'ادمین'], ['superadmin', 'سوپرادمین']].map(([value, label]) => <button type="button" key={value} aria-pressed={typeFilter === value} onClick={() => { setTypeFilter(value); resetPages() }} className={`aus-type-tab${typeFilter === value ? ' active' : ''}`}>{label}</button>)}</div>{(query || typeFilter) && <button className="aus-reset" type="button" onClick={resetFilters}>پاک‌کردن فیلترها</button>}</div>
    </div>
    <div className="aus-results-heading"><h2>فهرست کاربران <span>{loaded ? `${Number(total).toLocaleString('fa-IR')} نتیجه` : '—'}</span></h2>{query && <p>جستجو: «{query}»</p>}</div>
    {isLoading ? <div className="aus-loading" role="status">در حال دریافت کاربران…</div> : !loaded ? null : !users.length ? <div className="aus-empty"><h3>کاربری با این مشخصات پیدا نشد</h3><p>عبارت جستجو یا فیلتر نقش را تغییر دهید.</p>{(query || typeFilter) && <button type="button" onClick={resetFilters} className="aus-detail-btn">نمایش همه کاربران</button>}</div> : <>
      <div className="aus-table-wrap"><table className="aus-table"><caption className="sr-only">فهرست کاربران و نقش‌های آن‌ها</caption><thead><tr>{['کاربر', 'اطلاعات تماس', 'نقش و وضعیت', 'تاریخ عضویت', 'عملیات'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{visibleUsers.map(user => <tr key={user.id}>
        <td data-label="کاربر"><div className="aus-user-cell"><span className="aus-avatar">{user.profile_image ? <img src={user.profile_image} alt="" /> : user.first_name?.[0] || '؟'}</span><div><strong>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'بدون نام'}</strong><small>شناسه {user.id.toLocaleString('fa-IR')}</small></div></div></td>
        <td data-label="اطلاعات تماس"><div className="aus-contact"><a href={`tel:${user.mobile}`}><bdi>{user.mobile}</bdi></a><small>کد ملی: <bdi>{user.national_code || '—'}</bdi></small></div></td>
        <td data-label="نقش و وضعیت"><span className="aus-role-pill" style={{ color: typeMeta[user.user_type]?.color, background: typeMeta[user.user_type]?.bg }}>{typeMeta[user.user_type]?.label || 'نامشخص'}</span><small className="aus-account-status">{({ active: 'حساب فعال', inactive: 'حساب غیرفعال', deleted: 'حساب حذف‌شده' })[user.status] || 'وضعیت حساب نامشخص'}</small></td>
        <td data-label="تاریخ عضویت"><time dateTime={user.date_joined}>{user.date_joined ? new Date(user.date_joined).toLocaleDateString('fa-IR') : '—'}</time></td>
        <td data-label="عملیات">{actions(user)}</td>
      </tr>)}</tbody></table></div>
      <ul className="aus-member-list" aria-label="فهرست کاربران">{visibleUsers.map(user => <li className="aus-member" key={user.id}>
        <div className="aus-member-top"><span className="aus-avatar">{user.profile_image ? <img src={user.profile_image} alt="" /> : user.first_name?.[0] || '؟'}</span><div><h3>{[user.first_name, user.last_name].filter(Boolean).join(' ') || 'بدون نام'}</h3><span className="aus-role-pill" style={{ color: typeMeta[user.user_type]?.color, background: typeMeta[user.user_type]?.bg }}>{typeMeta[user.user_type]?.label || 'نامشخص'}</span></div></div>
        <dl className="aus-member-details"><div><dt>موبایل</dt><dd><a href={`tel:${user.mobile}`}><bdi>{user.mobile}</bdi></a></dd></div><div><dt>کد ملی</dt><dd><bdi>{user.national_code || '—'}</bdi></dd></div><div><dt>عضویت</dt><dd>{user.date_joined ? new Date(user.date_joined).toLocaleDateString('fa-IR') : '—'}</dd></div><div><dt>وضعیت حساب</dt><dd>{({ active: 'فعال', inactive: 'غیرفعال', deleted: 'حذف‌شده' })[user.status] || 'نامشخص'}</dd></div></dl>
        {actions(user)}
      </li>)}</ul>
      {(pagination ? pagination.next || pagination.previous : pages > 1) && <nav className="aus-pagination" aria-label="صفحه‌بندی کاربران"><button disabled={pagination ? !pagination.previous : page === 1} onClick={() => pagination ? setServerPage(value => value - 1) : setPage(value => value - 1)}>صفحه قبل</button><span>صفحه {(pagination ? serverPage : page).toLocaleString('fa-IR')}{!pagination && ` از ${pages.toLocaleString('fa-IR')}`}</span><button disabled={pagination ? !pagination.next : page >= pages} onClick={() => pagination ? setServerPage(value => value + 1) : setPage(value => value + 1)}>صفحه بعد</button></nav>}
    </>}
    {selected && <Dialog className="admin-dialog-overlay" label="تأیید تغییر نقش کاربر" onClose={() => { if (busyId === null) setSelected(null) }}><div className="admin-role-confirm"><h2>نقش کاربر تغییر کند؟</h2><p><strong>{selected.first_name} {selected.last_name}</strong> · <bdi>{selected.mobile}</bdi></p><div className="aus-role-transition"><span>{typeMeta[selected.user_type]?.label}</span><span aria-hidden="true">←</span><strong>{selected.user_type === 'admin' ? 'کاربر عادی' : 'ادمین'}</strong></div><p>{selected.user_type === 'admin' ? 'دسترسی‌های مدیریتی این حساب حذف می‌شوند.' : 'این حساب به ادمین تبدیل می‌شود. دسترسی‌های بخش‌ها را از پرونده کاربر تنظیم کنید.'}</p><ErrorSummary errors={validationErrors} />{message?.error && <p className="aus-message error" role="alert">{message.text}</p>}<div className="admin-dialog-actions"><button type="button" disabled={busyId !== null} onClick={() => setSelected(null)} className="aus-detail-btn">انصراف</button><button type="button" disabled={busyId !== null} onClick={changeRole} className="aus-search-btn">{busyId !== null ? 'در حال ذخیره…' : 'تأیید تغییر نقش'}</button></div></div></Dialog>}
  </div></FormValidation>
}
export default AdminUsers

