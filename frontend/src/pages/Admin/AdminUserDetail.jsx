import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import FinancialReportView from '../../components/FinancialReportView'
import useAuthStore from '../../store/authStore'

const genderLabel = { male: 'برادر', female: 'خواهر' }
const maritalLabel = { single: 'مجرد', married: 'متاهل' }
const educationLabel = { diploma: 'دیپلم', associate: 'فوق دیپلم', bachelor: 'لیسانس', master: 'فوق لیسانس', phd: 'دکترا' }
const studentStatusLabel = { student: 'دانشجو', graduate: 'فارغ‌التحصیل', professor: 'استاد' }
const militaryLabel = { exempt: 'معاف', done: 'کارت پایان خدمت', student: 'معافیت تحصیلی', other: 'سایر' }
const roleLabel = { user: 'کاربر عادی', admin: 'ادمین', superadmin: 'سوپرادمین' }
const permissionFields = [
  { key: 'perm_users', label: 'مدیریت کاربران' },
  { key: 'perm_trips', label: 'مدیریت سفرها' },
  { key: 'perm_registrations', label: 'مدیریت ثبت‌نام‌ها' },
  { key: 'perm_attendance', label: 'مدیریت حضور و غیاب' },
  { key: 'perm_financial', label: 'مدیریت مالی' },
  { key: 'perm_shop', label: 'مدیریت فروشگاه' },
  { key: 'perm_content', label: 'مدیریت محتوا' },
  { key: 'perm_tickets', label: 'مدیریت تیکت‌ها' },
  { key: 'perm_announcements', label: 'مدیریت اعلانات' },
  { key: 'perm_sms', label: 'ارسال پیامک' },
]

const rolePresets = {
  financial: ['perm_financial'],
  registration: ['perm_registrations', 'perm_trips', 'perm_attendance'],
  content: ['perm_content'],
  full: permissionFields.map(f => f.key),
}

function PermissionsPanel({ userId }) {
  const [perms, setPerms] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/accounts/admin/users/${userId}/permissions/`)
      .then(res => setPerms(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [userId])

  const applyPreset = (roleKey) => {
    const active = rolePresets[roleKey] || []
    const next = { ...perms, admin_role: roleKey }
    permissionFields.forEach(f => { next[f.key] = active.includes(f.key) })
    setPerms(next)
  }

  const toggleField = (key) => {
    setPerms({ ...perms, [key]: !perms[key], admin_role: 'custom' })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      const res = await api.put(`/accounts/admin/users/${userId}/permissions/`, perms)
      setPerms(res.data)
      setMessage('دسترسی‌ها ذخیره شد')
    } catch {
      setMessage('خطا در ذخیره دسترسی‌ها')
    }
    setIsSaving(false)
  }

  if (isLoading) return <div className="aud-loading">در حال بارگذاری...</div>
  if (!perms) return null

  return (
    <div className="aud-perm-panel">
      <div className="aud-perm-presets">
        <span>نقش از پیش‌تعریف‌شده:</span>
        <button onClick={() => applyPreset('financial')} className="aud-perm-preset-btn">مسئول مالی</button>
        <button onClick={() => applyPreset('registration')} className="aud-perm-preset-btn">مسئول ثبت‌نام</button>
        <button onClick={() => applyPreset('content')} className="aud-perm-preset-btn">مسئول محتوا</button>
        <button onClick={() => applyPreset('full')} className="aud-perm-preset-btn full">فعال‌سازی کامل</button>
      </div>

      <div className="aud-perm-grid">
        {permissionFields.map(f => (
          <label key={f.key} className="aud-perm-check">
            <input type="checkbox" checked={!!perms[f.key]} onChange={() => toggleField(f.key)} />
            <span>{f.label}</span>
          </label>
        ))}
      </div>

      {message && <div className="aud-perm-message">{message}</div>}

      <button onClick={handleSave} disabled={isSaving} className="aud-perm-save">
        {isSaving ? 'در حال ذخیره...' : 'ذخیره دسترسی‌ها'}
      </button>
    </div>
  )
}


function InfoRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="aud-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function AdminUserDetail() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  const [user, setUser] = useState(null)
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReportLoading, setIsReportLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    api.get(`/accounts/admin/users/${id}/`)
      .then(res => setUser(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))

    api.get(`/financial/admin/report/${id}/`)
      .then(res => setReport(res.data))
      .catch(() => {})
      .finally(() => setIsReportLoading(false))
  }, [id])

  if (isLoading) return <div className="aud-loading">در حال بارگذاری...</div>
  if (!user) return <div className="aud-loading">کاربر یافت نشد</div>

  return (
    <div className="aud-page">
      <Link to="/admin/users" className="aud-back">← برگشت به لیست کاربران</Link>

      <div className="aud-header">
        <div className="aud-avatar">
          {user.profile_image ? <img src={user.profile_image} alt="" /> : (user.first_name?.[0] || '؟')}
        </div>
        <div>
          <h1>{user.first_name} {user.last_name}</h1>
          <p>{user.mobile} · عضو از {new Date(user.date_joined).toLocaleDateString('fa-IR')}</p>
        </div>
        <span className={`aud-role-badge${user.user_type !== 'user' ? ' admin' : ''}`}>
          {roleLabel[user.user_type]}
        </span>
      </div>

      <div className="aud-tabs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`aud-tab${activeTab === 'profile' ? ' active' : ''}`}
        >
          اطلاعات کاربر
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`aud-tab${activeTab === 'financial' ? ' active' : ''}`}
        >
          گزارش مالی کاربر
        </button>
         {currentUser?.user_type === 'superadmin' && user.user_type === 'admin' && (
          <button
            onClick={() => setActiveTab('permissions')}
            className={`aud-tab${activeTab === 'permissions' ? ' active' : ''}`}
          >
            دسترسی‌های ادمین
          </button>
        )}
      </div>

      {activeTab === 'profile' &&  (
        <div className="aud-sections">
          <div className="aud-section">
            <h2>اطلاعات هویتی</h2>
            <InfoRow label="نام" value={user.first_name} />
            <InfoRow label="نام خانوادگی" value={user.last_name} />
            <InfoRow label="نام پدر" value={user.father_name} />
            <InfoRow label="کد ملی" value={user.national_code} />
            <InfoRow label="تاریخ تولد" value={user.birth_date} />
            <InfoRow label="جنسیت" value={genderLabel[user.gender]} />
            <InfoRow label="وضعیت تاهل" value={maritalLabel[user.marital_status]} />
            <InfoRow label="تابعیت" value={user.nationality} />
          </div>

          <div className="aud-section">
            <h2>اطلاعات تماس</h2>
            <InfoRow label="شماره منزل" value={user.phone} />
            <InfoRow label="آدرس" value={user.address} />
            <InfoRow label="نام نزدیکان" value={user.emergency_name} />
            <InfoRow label="شماره نزدیکان" value={user.emergency_phone} />
            <InfoRow label="نسبت" value={user.emergency_relation} />
          </div>

          <div className="aud-section">
            <h2>اطلاعات دانشگاهی</h2>
            <InfoRow label="نام دانشگاه" value={user.university} />
            <InfoRow label="مقطع تحصیلی" value={educationLabel[user.education_level]} />
            <InfoRow label="وضعیت دانشجویی" value={studentStatusLabel[user.student_status]} />
          </div>

          <div className="aud-section">
            <h2>اطلاعات گذرنامه</h2>
            <InfoRow label="شماره گذرنامه" value={user.passport_number} />
            <InfoRow label="تاریخ انقضا" value={user.passport_expiry} />
          </div>

          <div className="aud-section">
            <h2>اطلاعات بهداشتی</h2>
            <InfoRow label="سابقه بیماری زمینه‌ای" value={user.has_disease ? 'بله' : 'خیر'} />
            {user.has_disease && <InfoRow label="توضیح بیماری" value={user.disease_description} />}
            <InfoRow label="سابقه بیماری آسم/ریوی" value={user.has_asthma ? 'بله' : 'خیر'} />
            <InfoRow label="حساسیت دارویی/غذایی" value={user.has_allergy ? 'بله' : 'خیر'} />
            {user.has_allergy && <InfoRow label="توضیح حساسیت" value={user.allergy_description} />}
          </div>

          {user.gender === 'male' && (
            <div className="aud-section">
              <h2>اطلاعات نظامی</h2>
              <InfoRow label="وضعیت نظام وظیفه" value={militaryLabel[user.military_status]} />
            </div>
          )}

          <div className="aud-section">
            <h2>سرپرست</h2>
            <InfoRow label="کد ملی سرپرست" value={user.guardian_national_code} />
          </div>

          <div className="aud-section">
            <h2>تصاویر و مدارک</h2>
            <div className="aud-images">
              {[
                { label: 'عکس پرسنلی', src: user.profile_image },
                { label: 'کارت ملی', src: user.national_card_image },
                { label: 'کارت دانشجویی', src: user.student_card_image },
                { label: 'گذرنامه', src: user.passport_image },
              ].filter(img => img.src).map((img, i) => (
                <a key={i} href={img.src} target="_blank" rel="noreferrer" className="aud-image-item">
                  <img src={img.src} alt={img.label} />
                  <span>{img.label}</span>
                </a>
              ))}
              {user.commitment_form && (
                <a href={user.commitment_form} target="_blank" rel="noreferrer" className="aud-file-item">
                  📄 تعهدنامه/رضایت‌نامه
                </a>
              )}
              {!user.profile_image && !user.national_card_image && !user.student_card_image && !user.passport_image && !user.commitment_form && (
                <p className="fr-empty">مدرکی آپلود نشده</p>
              )}
            </div>
          </div>
        </div>
       )}
      {activeTab === 'financial' && (
        <FinancialReportView data={report} isLoading={isReportLoading} />
      )}
      {activeTab === 'permissions' && <PermissionsPanel userId={id} />}

      <style>{`
        .aud-loading { text-align: center; padding: 60px 0; color: var(--ink-dim); font-size: 13px; }
        .aud-page { display: flex; flex-direction: column; gap: 20px; }

        .aud-back { align-self: flex-start; background: none; border: none; color: var(--ink-dim); font-size: 13px; text-decoration: none; }
        .aud-back:hover { color: var(--teal-glow); }

        .aud-header {
          display: flex; align-items: center; gap: 16px;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: 20px 22px;
        }
        .aud-avatar {
          width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          background: var(--teal); color: var(--gold-light);
          display: grid; place-items: center; font-size: 20px; font-weight: 700;
        }
        .aud-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .aud-header h1 { font-family: var(--font-display); color: var(--teal-glow); font-size: 18px; }
        .aud-header p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .aud-role-badge {
          margin-right: auto; font-size: 11.5px; padding: 5px 13px; border-radius: 999px;
          background: var(--status-neutral-bg); color: var(--status-neutral); border: 1px solid var(--status-neutral);
          white-space: nowrap;
        }
        .aud-role-badge.admin { background: var(--status-warn-bg); color: var(--status-warn); border-color: var(--status-warn); }

        .aud-tabs { display: flex; gap: 8px; }
        .aud-tab {
          padding: 10px 22px; border-radius: 999px; font-size: 13px; font-weight: 600;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
        }
        .aud-tab:hover { color: var(--teal-glow); border-color: var(--teal-glow); }
        .aud-tab.active {
          background: linear-gradient(135deg, var(--teal-light), var(--teal));
          color: #eefaf5; border-color: transparent;
        }

        .aud-sections { display: flex; flex-direction: column; gap: 16px; }
        .aud-section { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 18px 22px; }
        .aud-section h2 { font-family: var(--font-display); color: var(--teal-glow); font-size: 14.5px; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--line); }

        .aud-info-row { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; font-size: 13px; }
        .aud-info-row span { color: var(--ink-faint); }
        .aud-info-row strong { color: var(--ink); font-weight: 500; text-align: left; }

        .aud-images { display: flex; gap: 14px; flex-wrap: wrap; }
        .aud-image-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .aud-image-item img { width: 90px; height: 90px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--line); }
        .aud-image-item span { color: var(--ink-faint); font-size: 11px; }
        .aud-file-item { color: var(--teal-glow); font-size: 13px; align-self: center; }
        .aud-perm-panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }
        .aud-perm-presets { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .aud-perm-presets span { color: var(--ink-faint); font-size: 12.5px; }
        .aud-perm-preset-btn { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--ink-dim); font-size: 12px; cursor: pointer; }
        .aud-perm-preset-btn:hover { border-color: var(--teal-glow); color: var(--teal-glow); }
        .aud-perm-preset-btn.full { border-color: rgba(216,181,104,0.4); color: var(--gold-light); }
        .aud-perm-preset-btn.full:hover { background: rgba(216,181,104,0.1); }
        .aud-perm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .aud-perm-check { display: flex; align-items: center; gap: 9px; cursor: pointer; font-size: 13px; color: var(--ink); background: var(--panel-inset-bg); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 10px 14px; }
        .aud-perm-check input { width: 16px; height: 16px; accent-color: var(--teal-glow); }
        .aud-perm-message { font-size: 12.5px; color: var(--status-ok); }
        .aud-perm-save { align-self: flex-start; padding: 10px 24px; border-radius: 999px; border: none; cursor: pointer; font-size: 13px; font-weight: 700; color: #eefaf5; background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal)); }
        .aud-perm-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

export default AdminUserDetail