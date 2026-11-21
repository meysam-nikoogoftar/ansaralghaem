import Link from '@/components/navigation/app-link'
import { safeMediaPath } from '@/lib/urls'
import type { User } from '@/types'
import type { DashboardRegistration, DashboardWallet } from '@/lib/dashboard/contracts'
import { TripTimeline } from './trip-timeline'
const icons = {
  plane: (
    <>
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <path d="M4 11h16M8 18v3m8-3v3M8 7h8M8 15h.01M16 15h.01" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6" />
      <path d="M2 15a3 3 0 000 6h20a3 3 0 000-6" />
      <path d="M2 9h20v6H2z" />
    </>
  ),
  book: (
    <>
      <path d="M4 3v18h17M8 16v-4M13 16V7M18 16v-6" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
}

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  )
}

export default function DashboardOverview({
  user,
  wallet,
  registrations,
}: {
  user: User
  wallet: DashboardWallet | null
  registrations: DashboardRegistration[] | null
}) {
  const avatar = safeMediaPath(user.profile_image)
  const trips = registrations ?? []
  const tripsLoaded = registrations !== null
  const statusConfig: Record<string, [string, string]> = {
    '': ['در دست بررسی', 'pending'],
    pending: ['در دست بررسی', 'pending'],
    approved: ['تأیید شده', 'approved'],
    rejected: ['رد شده', 'rejected'],
    cancelled: ['انصراف داده', 'cancelled'],
    attended: ['شرکت کرده', 'approved'],
    absent: ['شرکت نکرده', 'cancelled'],
  }
  const sortedTrips = [...trips].sort(
    (a, b) => Date.parse(b.registered_at) - Date.parse(a.registered_at),
  )
  const active = sortedTrips.filter((trip) => ['', 'pending', 'approved'].includes(trip.status))
  const featured = active[0] || sortedTrips[0]
  const pendingCount = trips.filter((trip) => ['', 'pending'].includes(trip.status)).length
  const approvedCount = trips.filter((trip) => trip.status === 'approved').length
  const money = (value: number) => Number(value || 0).toLocaleString('fa-IR')
  const services = [
    {
      to: '/dashboard/tickets',
      title: 'پشتیبانی و تیکت‌ها',
      description: 'طرح پرسش و پیگیری پاسخ‌ها',
      icon: 'ticket',
    },
    {
      to: '/dashboard/financial-report',
      title: 'گزارش مالی من',
      description: 'جزئیات پرداخت‌ها و دریافت‌ها',
      icon: 'book',
    },
    {
      to: '/dashboard/articles',
      title: 'دلنوشته‌های من',
      description: 'ثبت و مدیریت نوشته‌ها',
      icon: 'edit',
    },
  ] as const
  const badge = (trip: DashboardRegistration) => {
    const [label, style] = statusConfig[trip.status] || ['وضعیت نامشخص', 'cancelled']
    return <span className={`db-status db-status-${style}`}>{label}</span>
  }
  return (
    <div className="db-page">
      <header className="db-intro">
        <div className="db-person">
          <span className="db-person-avatar">
            {avatar ? <img src={avatar} alt="" /> : <Icon name="user" />}
          </span>
          <div>
            <h1>
              {user?.first_name ? `${user.first_name} عزیز، خوش آمدید` : 'به داشبورد خود خوش آمدید'}
            </h1>
            <p>از اینجا سفرها، پرداخت‌ها و درخواست‌های خود را پیگیری کنید.</p>
          </div>
        </div>
        <Link className="db-profile-link" href="/dashboard/profile">
          <Icon name="user" />
          ویرایش پروفایل
        </Link>
      </header>
      {(!tripsLoaded || !wallet) && (
        <p className="request-feedback" role="status">
          بخشی از اطلاعات در دسترس نیست. <a href="/dashboard">تلاش مجدد</a>
        </p>
      )}
      <div className="db-account-summary" aria-label="خلاصه ثبت‌نام‌ها">
        {(
          [
            ['ثبت‌نام‌های شما', trips.length],
            ['تأیید شده', approvedCount],
            ['در دست بررسی', pendingCount],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <strong>{tripsLoaded ? value.toLocaleString('fa-IR') : '—'}</strong>
            <span>{label}</span>
          </div>
        ))}
        <Link href="/dashboard/trips/register" className="db-primary-link">
          <Icon name="plane" />
          ثبت‌نام سفر جدید
        </Link>
      </div>
      <div className="db-workspace">
        <div className="db-main-column">
          <div className="db-section-heading">
            <h2>{active.length ? 'پیگیری سفر شما' : 'وضعیت سفرهای شما'}</h2>
            <Link href="/dashboard/trips">همه سفرها</Link>
          </div>
          {featured ? (
            <article className="db-focus">
              <div className="db-focus-banner">
                <div>
                  <span className="db-focus-icon">
                    <Icon name="plane" />
                  </span>
                  <h3>{featured.trip_detail?.title || 'ثبت‌نام سفر'}</h3>
                  <p>
                    کد پیگیری <bdi>{featured.tracking_code || '—'}</bdi>
                  </p>
                  {badge(featured)}
                </div>
              </div>
              <div className="db-focus-content">
                <div className="db-trip-dates">
                  <div>
                    <span>آغاز سفر</span>
                    <strong>
                      {featured.trip_detail?.start_date
                        ? new Date(featured.trip_detail.start_date).toLocaleDateString('fa-IR', {
                            day: 'numeric',
                            month: 'long',
                          })
                        : 'اعلام نشده'}
                    </strong>
                  </div>
                  <div>
                    <span>پایان سفر</span>
                    <strong>
                      {featured.trip_detail?.end_date
                        ? new Date(featured.trip_detail.end_date).toLocaleDateString('fa-IR', {
                            day: 'numeric',
                            month: 'long',
                          })
                        : 'اعلام نشده'}
                    </strong>
                  </div>
                </div>
                <TripTimeline
                  start={featured.trip_detail?.start_date}
                  end={featured.trip_detail?.end_date}
                />
                <div className="db-next-action">
                  <div>
                    <h4>
                      {['pending', ''].includes(featured.status)
                        ? 'ثبت‌نام شما در حال بررسی است'
                        : featured.status === 'approved'
                          ? 'ثبت‌نام شما تأیید شده است'
                          : 'جزئیات ثبت‌نام را بررسی کنید'}
                    </h4>
                    <p>
                      {active.includes(featured) && Number(featured.remaining_amount) > 0
                        ? `مانده هزینه سفر: ${money(featured.remaining_amount ?? 0)} تومان`
                        : 'وضعیت پرداخت و همسفران در جزئیات سفر قابل مشاهده است.'}
                    </p>
                  </div>
                  <Link href="/dashboard/trips">جزئیات و پرداخت</Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="db-empty">
              <Icon name="plane" />
              <h3>
                {tripsLoaded
                  ? 'اولین سفر شما از اینجا شروع می‌شود'
                  : 'اطلاعات سفر هنوز در دسترس نیست'}
              </h3>
              <p>
                {tripsLoaded
                  ? 'سفرهای قابل ثبت‌نام را ببینید و شرایط سفر موردنظر را بررسی کنید.'
                  : 'برای دریافت اطلاعات، از گزینه تلاش مجدد استفاده کنید.'}
              </p>
              {tripsLoaded && (
                <Link href="/dashboard/trips/register" className="db-primary-link">
                  مشاهده سفرهای قابل ثبت‌نام
                </Link>
              )}
            </div>
          )}
          <div className="db-recent">
            <div className="db-section-heading">
              <h2>آخرین ثبت‌نام‌ها</h2>
              <Link href="/dashboard/trips">مشاهده همه سفرها</Link>
            </div>
            {sortedTrips.length ? (
              <ul className="db-registration-list">
                {sortedTrips.slice(0, 3).map((trip) => (
                  <li key={trip.id} className="db-registration">
                    <div className="db-registration-heading">
                      <span className="db-registration-symbol">
                        <Icon name="plane" />
                      </span>
                      <h3>{trip.trip_detail?.title || 'ثبت‌نام سفر'}</h3>
                      {badge(trip)}
                    </div>
                    <dl className="db-registration-meta">
                      <div>
                        <dt>کد پیگیری</dt>
                        <dd>
                          <bdi>{trip.tracking_code || '—'}</bdi>
                        </dd>
                      </div>
                      <div>
                        <dt>تاریخ ثبت‌نام</dt>
                        <dd>
                          {trip.registered_at
                            ? new Date(trip.registered_at).toLocaleDateString('fa-IR')
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt>مانده پرداخت</dt>
                        <dd>
                          {trip.remaining_amount != null
                            ? `${money(trip.remaining_amount)} تومان`
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                    <div className="db-registration-footer">
                      <span>
                        {trip.payment_status === 'paid'
                          ? 'پرداخت کامل شده'
                          : trip.payment_status === 'partial'
                            ? 'بخشی از هزینه پرداخت شده'
                            : trip.payment_status === 'unpaid'
                              ? 'پرداختی ثبت نشده'
                              : 'جزئیات پرداخت را بررسی کنید'}
                      </span>
                      <Link
                        href={`/dashboard/trips#registration-${trip.id}`}
                        aria-label={`پیگیری ثبت‌نام ${trip.trip_detail?.title || 'سفر'} با کد ${trip.tracking_code || trip.id}`}
                      >
                        پیگیری ثبت‌نام
                        <svg
                          aria-hidden="true"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="m14 6-6 6 6 6" />
                        </svg>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="db-muted">
                {tripsLoaded
                  ? 'هنوز ثبت‌نامی ندارید.'
                  : 'پس از دریافت اطلاعات، ثبت‌نام‌ها اینجا نمایش داده می‌شوند.'}
              </p>
            )}
          </div>
        </div>
        <aside className="db-side-column" aria-label="کیف پول و خدمات">
          <div className="db-wallet">
            <div className="db-wallet-heading">
              <Icon name="wallet" />
              <h2>کیف پول شما</h2>
            </div>
            <p className="db-wallet-value">
              {wallet ? money(wallet.balance) : '—'} <span>تومان</span>
            </p>
            <p className="db-wallet-note">موجودی قابل استفاده برای پرداخت هزینه سفر</p>
            <Link href="/dashboard/wallet">افزایش اعتبار کیف پول</Link>
          </div>
          <div className="db-services">
            <h2>خدمات حساب شما</h2>
            {services.map((service) => (
              <Link href={service.to} key={service.to}>
                <span className="db-service-icon">
                  <Icon name={service.icon} />
                </span>
                <span>
                  <strong>{service.title}</strong>
                  <small>{service.description}</small>
                </span>
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="m14 6-6 6 6 6" />
                </svg>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
