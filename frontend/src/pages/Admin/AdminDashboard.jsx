import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import './admin-overview.css'

const statusMeta = {
  '': { label: 'بدون وضعیت', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  pending: { label: 'در دست بررسی', color: 'var(--status-warn)', bg: 'var(--status-warn-bg)' },
  approved: { label: 'تایید شده', color: 'var(--status-ok)', bg: 'var(--status-ok-bg)' },
  rejected: { label: 'رد شده', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
  cancelled: { label: 'انصراف داده', color: 'var(--status-neutral)', bg: 'var(--status-neutral-bg)' },
  attended: { label: 'شرکت کرد', color: 'var(--status-info)', bg: 'var(--status-info-bg)' },
  absent: { label: 'شرکت نکرد', color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' },
}

function AdminDashboard() {
  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [stats, setStats] = useState(null)
  const { user } = useAuthStore()
  const isLoading = !loadState.started || loadState.pending > 0

  useEffect(() => {
    observeLoad(() => api.get('/accounts/admin/dashboard-stats/')
      .then(res => setStats(res.data))
      .catch(error => { throw error })
      , "'/accounts/admin/dashboard-stats/'")
  }, [observeLoad])

  if (isLoading && !stats) return <><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="adb-loading">در حال بارگذاری آمار...</div>}</>
  if (!stats) return <><LoadFeedback state={loadState} onRetry={retryLoad} />{null}</>

  const allowed = permission => user?.user_type === 'superadmin' || user?.[permission] === true
  const number = value => Number(value || 0).toLocaleString('fa-IR')
  const statuses = stats.registrations_by_status || {}
  const totalRegistrations = Object.values(statuses).reduce((sum, value) => sum + Number(value || 0), 0)
  const recent = stats.recent_registrations || []
  const metrics = [
    { label: 'کاربران عادی', value: stats.total_users, detail: `${number(stats.total_admins)} حساب مدیریتی`, to: '/admin/users', permission: 'perm_users' },
    { label: 'سفرهای فعال', value: stats.total_trips, detail: 'مدیریت برنامه‌ها و ظرفیت سفر', to: '/admin/trips', permission: 'perm_trips' },
    { label: 'کل ثبت‌نام‌ها', value: totalRegistrations, detail: `${number(statuses.approved)} ثبت‌نام تأییدشده`, to: '/admin/registrations', permission: 'perm_registrations' },
  ]
  const tasks = [
    { label: 'ثبت‌نام در دست بررسی', count: Number(statuses.pending || 0) + Number(statuses[''] || 0), to: '/admin/registrations', permission: 'perm_registrations' },
    { label: 'تصویر گالری در انتظار', count: stats.pending_gallery, to: '/admin/gallery', permission: 'perm_content' },
    { label: 'دلنوشته در انتظار', count: stats.pending_articles, to: '/admin/articles', permission: 'perm_content' },
  ].filter(task => allowed(task.permission))
  const accessibleMetrics = metrics.filter(metric => allowed(metric.permission))
  return <div className="adb-page">
    <header className="admin-page-heading"><div><h1 className="adb-heading">داشبورد مدیریت</h1><p>وضعیت هیئت و کارهایی که نیاز به پیگیری دارند.</p></div></header>
    <LoadFeedback state={loadState} onRetry={retryLoad} />
    {accessibleMetrics.length > 0 && <div className="adb-metrics">{accessibleMetrics.map(metric => <Link to={metric.to} key={metric.label}><span>{metric.label}</span><strong>{number(metric.value)}</strong><small>{metric.detail}</small><span className="adb-metric-action">مشاهده و مدیریت <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m14 6-6 6 6 6" /></svg></span></Link>)}</div>}
    <div className="adb-workspace">
      <div className="adb-main-column">
        <div className="adb-panel adb-tasks"><div className="adb-panel-heading"><h2>نیازمند پیگیری</h2><span>کارهای در انتظار بررسی</span></div>{tasks.length ? <ul>{tasks.map(task => <li key={task.label}><Link to={task.to}><span className={`adb-task-count${Number(task.count) > 0 ? ' has-items' : ''}`}>{number(task.count)}</span><div><strong>{task.label}</strong><small>{Number(task.count) ? 'برای بررسی وارد این بخش شوید' : 'موردی در انتظار نیست'}</small></div><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m14 6-6 6 6 6" /></svg></Link></li>)}</ul> : <p className="adb-empty">بخش‌های قابل پیگیری مطابق دسترسی حساب شما نمایش داده می‌شوند.</p>}{allowed('perm_tickets') && <p className="adb-ticket-note">تیکت‌های در انتظار پاسخ: <strong>{number(stats.pending_tickets)}</strong></p>}</div>
        {allowed('perm_registrations') && <div className="adb-panel adb-recent"><div className="adb-panel-heading"><h2>آخرین ثبت‌نام‌ها</h2><Link to="/admin/registrations">مشاهده همه</Link></div>{recent.length ? <ul>{recent.map(registration => <li key={registration.id} className="adb-registration-row">
          <div className="adb-registration-person"><strong>{registration.user_name?.trim() || registration.user_mobile || 'کاربر بدون نام'}</strong><p>{registration.trip_detail?.title || 'عنوان سفر ثبت نشده'}</p></div>
          <div className="adb-registration-reference"><span>کد پیگیری <bdi>{registration.tracking_code || '—'}</bdi></span>{registration.registered_at && <time dateTime={registration.registered_at}>{new Date(registration.registered_at).toLocaleDateString('fa-IR')}</time>}</div>
          <span className="adb-status-pill" style={{ color: statusMeta[registration.status]?.color, background: statusMeta[registration.status]?.bg }}>{statusMeta[registration.status]?.label || 'نامشخص'}</span>
          {allowed('perm_users') && registration.user && <Link className="adb-registration-link" to={`/admin/users/${registration.user}`}>پرونده کاربر<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m14 6-6 6 6 6" /></svg></Link>}
        </li>)}</ul> : <p className="adb-empty">هنوز ثبت‌نامی انجام نشده است.</p>}</div>}
      </div>
      <div className="adb-side-column">
        {allowed('perm_financial') && <div className="adb-finance"><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 8V5H6a3 3 0 0 0-3 3v11h17V8H6M20 12h-5v4h5"/></svg><h2>موجودی کل کیف پول‌ها</h2><strong>{number(stats.total_wallet_balance)} <span>تومان</span></strong><p>مجموع مانده اعتبار کاربران در کیف پول</p><Link to="/admin/expenses">مدیریت هزینه‌ها</Link></div>}
        {allowed('perm_registrations') && <div className="adb-panel"><div className="adb-panel-heading"><h2>وضعیت ثبت‌نام‌ها</h2></div><p className="adb-chart-caption">از مجموع {number(totalRegistrations)} ثبت‌نام</p><div className="adb-bars">{Object.entries(statuses).map(([key, count]) => <div key={key} className="adb-bar-row"><div><span>{statusMeta[key]?.label || 'نامشخص'}</span><strong>{number(count)}</strong></div><div className="adb-bar-track" aria-hidden="true"><span style={{ width: `${totalRegistrations ? Number(count) / totalRegistrations * 100 : 0}%`, background: statusMeta[key]?.color || 'var(--teal-glow)' }} /></div></div>)}</div>{!totalRegistrations && <p className="adb-empty">با ثبت‌نام کاربران، نمودار تکمیل می‌شود.</p>}</div>}
      </div>
    </div>
  </div>
}
export default AdminDashboard

