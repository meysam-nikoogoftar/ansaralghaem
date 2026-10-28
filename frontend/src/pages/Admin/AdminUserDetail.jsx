import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import FinancialReportView from '../../components/FinancialReportView'
import JalaliDatePicker from '../../components/JalaliDatePicker'
import useAuthStore from '../../store/authStore'

const genderLabel = { male: 'برادر', female: 'خواهر' }
const maritalLabel = { single: 'مجرد', married: 'متاهل' }
const educationLabel = { diploma: 'دیپلم', associate: 'فوق دیپلم', bachelor: 'لیسانس', master: 'فوق لیسانس', phd: 'دکترا' }
const studentStatusLabel = { student: 'دانشجو', graduate: 'فارغ‌التحصیل', professor: 'استاد' }
const militaryLabel = { exempt: 'معاف', done: 'کارت پایان خدمت', student: 'معافیت تحصیلی', other: 'سایر' }
const roleLabel = { user: 'کاربر عادی', admin: 'ادمین', superadmin: 'سوپرادمین' }
const accountStatusLabel = { active: 'فعال', inactive: 'غیرفعال', blocked: 'مسدود', deleted: 'حذف شده' }

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

const PROFILE_FIELDS = [
  { section: 'اطلاعات هویتی', fields: [
    { key: 'first_name', label: 'نام' },
    { key: 'last_name', label: 'نام خانوادگی' },
    { key: 'father_name', label: 'نام پدر' },
    { key: 'national_code', label: 'کد ملی' },
    { key: 'birth_date', label: 'تاریخ تولد', type: 'jalali-date' },
    { key: 'gender', label: 'جنسیت', type: 'select', options: genderLabel },
    { key: 'marital_status', label: 'وضعیت تاهل', type: 'select', options: maritalLabel },
    { key: 'nationality', label: 'تابعیت' },
  ]},
  { section: 'اطلاعات تماس', fields: [
    { key: 'phone', label: 'شماره منزل' },
    { key: 'address', label: 'آدرس', type: 'textarea' },
    { key: 'emergency_name', label: 'نام نزدیکان' },
    { key: 'emergency_phone', label: 'شماره نزدیکان' },
    { key: 'emergency_relation', label: 'نسبت' },
  ]},
  { section: 'اطلاعات دانشگاهی', fields: [
    { key: 'university', label: 'نام دانشگاه' },
    { key: 'education_level', label: 'مقطع تحصیلی', type: 'select', options: educationLabel },
    { key: 'student_status', label: 'وضعیت دانشجویی', type: 'select', options: studentStatusLabel },
  ]},
  { section: 'اطلاعات گذرنامه', fields: [
    { key: 'passport_number', label: 'شماره گذرنامه' },
    { key: 'passport_expiry', label: 'تاریخ انقضا', type: 'jalali-date' },
  ]},
  { section: 'اطلاعات بهداشتی', fields: [
    { key: 'has_disease', label: 'سابقه بیماری زمینه‌ای', type: 'checkbox' },
    { key: 'disease_description', label: 'توضیح بیماری', type: 'textarea' },
    { key: 'has_asthma', label: 'سابقه بیماری آسم/ریوی', type: 'checkbox' },
    { key: 'has_allergy', label: 'حساسیت دارویی/غذایی', type: 'checkbox' },
    { key: 'allergy_description', label: 'توضیح حساسیت', type: 'textarea' },
  ]},
  { section: 'اطلاعات نظامی', fields: [
    { key: 'military_status', label: 'وضعیت نظام وظیفه', type: 'select', options: militaryLabel },
  ]},
  { section: 'سرپرست', fields: [
    { key: 'guardian_national_code', label: 'کد ملی سرپرست' },
  ]},
]

const DOCUMENT_FIELDS = [
  { key: 'profile_image', label: 'تصویر پرسنلی' },
  { key: 'national_card_image', label: 'تصویر کارت ملی' },
  { key: 'student_card_image', label: 'تصویر کارت دانشجویی' },
  { key: 'passport_image', label: 'تصویر صفحه اول گذرنامه' },
]

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

function ProfileEditor({ user, onSaved }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const startEdit = () => {
    const init = {}
    PROFILE_FIELDS.forEach(group => {
      group.fields.forEach(f => { init[f.key] = user[f.key] ?? (f.type === 'checkbox' ? false : '') })
    })
    setFormData(init)
    setIsEditing(true)
  }

  const handleChange = (key, value, type) => {
    setFormData({ ...formData, [key]: type === 'checkbox' ? value.target.checked : value.target.value })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    try {
      const res = await api.put(`/accounts/admin/users/${user.id}/`, formData)
      onSaved(res.data)
      setIsEditing(false)
      setMessage('اطلاعات ذخیره شد')
    } catch {
      setMessage('خطا در ذخیره اطلاعات')
    }
    setIsSaving(false)
  }

  if (!isEditing) {
    return (
      <button onClick={startEdit} className="aud-edit-toggle">ویرایش اطلاعات</button>
    )
  }

  return (
    <div className="aud-edit-wrap">
      <div className="aud-edit-actions-top">
        <button onClick={handleSave} disabled={isSaving} className="aud-perm-save">
          {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
        <button onClick={() => setIsEditing(false)} className="aud-edit-cancel">انصراف</button>
        {message && <span className="aud-edit-message">{message}</span>}
      </div>

      {PROFILE_FIELDS.map(group => (
        <div key={group.section} className="aud-section">
          <h2>{group.section}</h2>
          <div className="aud-edit-grid">
            {group.fields.map(f => (
              <div key={f.key} className={f.type === 'textarea' ? 'aud-edit-field aud-edit-span-2' : 'aud-edit-field'}>
                {f.type === 'checkbox' ? (
                  <label className="aud-edit-checkbox">
                    <input type="checkbox" checked={!!formData[f.key]} onChange={(e) => handleChange(f.key, e, 'checkbox')} />
                    <span>{f.label}</span>
                  </label>
                ) : (
                  <>
                    <label>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={formData[f.key] || ''} onChange={(e) => handleChange(f.key, e)}>
                        <option value="">—</option>
                        {Object.entries(f.options).map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea value={formData[f.key] || ''} onChange={(e) => handleChange(f.key, e)} rows={2} />
                    ) : f.type === 'jalali-date' ? (
                      <JalaliDatePicker
                        value={formData[f.key] || ''}
                        onChange={(iso) => setFormData({ ...formData, [f.key]: iso })}
                      />
                    ) : (
                      <input type={f.type || 'text'} value={formData[f.key] || ''} onChange={(e) => handleChange(f.key, e)} />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DocumentsPanel({ user }) {
  return (
    <div className="aud-docs-grid">
      {DOCUMENT_FIELDS.map(doc => (
        <div key={doc.key} className="aud-doc-card">
          <p className="aud-doc-label">{doc.label}</p>
          {user[doc.key] ? (
            <a href={user[doc.key]} target="_blank" rel="noreferrer" className="aud-doc-image-link">
              <img src={user[doc.key]} alt={doc.label} />
            </a>
          ) : (
            <div className="aud-doc-placeholder">
              <span>📎</span>
              <p>هنوز آپلود نشده</p>
            </div>
          )}
        </div>
      ))}
      {user.commitment_form && (
        <div className="aud-doc-card">
          <p className="aud-doc-label">تعهدنامه / رضایت‌نامه</p>
          <a href={user.commitment_form} target="_blank" rel="noreferrer" className="aud-doc-file-link">📄 مشاهده فایل</a>
        </div>
      )}
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
  const [statusBusy, setStatusBusy] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)

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

  const handleSetStatus = async (newStatus) => {
    setStatusMenuOpen(false)
    if (newStatus === user.status) return
    if (!window.confirm(`وضعیت حساب به «${accountStatusLabel[newStatus]}» تغییر کند؟`)) return
    setStatusBusy(true)
    try {
      const res = await api.post(`/accounts/admin/users/${id}/status/`, { status: newStatus })
      setUser(u => ({ ...u, status: res.data.status }))
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در تغییر وضعیت حساب')
    }
    setStatusBusy(false)
  }

  if (isLoading) return <div className="aud-loading">در حال بارگذاری...</div>
  if (!user) return <div className="aud-loading">کاربر یافت نشد</div>

  const isSuperAdmin = currentUser?.user_type === 'superadmin'
  const canChangeStatus = isSuperAdmin && user.user_type !== 'superadmin'

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
        <div className="aud-header-badges">
          <span className={`aud-role-badge${user.user_type !== 'user' ? ' admin' : ''}`}>
            {roleLabel[user.user_type]}
          </span>

          <div className="aud-status-menu-wrap">
            <button
              onClick={() => canChangeStatus && setStatusMenuOpen(!statusMenuOpen)}
              className={`aud-status-badge aud-status-${user.status}${canChangeStatus ? ' clickable' : ''}`}
              disabled={statusBusy}
            >
              {accountStatusLabel[user.status] || user.status}
              {canChangeStatus && <span className="aud-status-caret">▾</span>}
            </button>

            {statusMenuOpen && (
              <>
                <div className="aud-menu-backdrop" onClick={() => setStatusMenuOpen(false)} />
                <div className="aud-status-dropdown">
                  <button onClick={() => handleSetStatus('active')} className="aud-status-item ok">فعال</button>
                  <button onClick={() => handleSetStatus('inactive')} className="aud-status-item warn">غیرفعال</button>
                  <button onClick={() => handleSetStatus('deleted')} className="aud-status-item danger">حذف کاربر</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="aud-tabs">
        <button onClick={() => setActiveTab('profile')} className={`aud-tab${activeTab === 'profile' ? ' active' : ''}`}>اطلاعات کاربر</button>
        <button onClick={() => setActiveTab('documents')} className={`aud-tab${activeTab === 'documents' ? ' active' : ''}`}>تصاویر ارسالی</button>
        <button onClick={() => setActiveTab('financial')} className={`aud-tab${activeTab === 'financial' ? ' active' : ''}`}>گزارش مالی کاربر</button>
        {isSuperAdmin && user.user_type === 'admin' && (
          <button onClick={() => setActiveTab('permissions')} className={`aud-tab${activeTab === 'permissions' ? ' active' : ''}`}>دسترسی‌های ادمین</button>
        )}
      </div>

      {activeTab === 'profile' && (
        <div className="aud-sections">
          <ProfileEditor user={user} onSaved={(updated) => setUser(u => ({ ...u, ...updated }))} />

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
        </div>
      )}

      {activeTab === 'documents' && <DocumentsPanel user={user} />}
      {activeTab === 'financial' && <FinancialReportView data={report} isLoading={isReportLoading} />}
      {activeTab === 'permissions' && <PermissionsPanel userId={id} />}

      <style>{`
        .aud-loading { text-align: center; padding: 60px 0; color: var(--ink-dim); font-size: 13px; }
        .aud-page { display: flex; flex-direction: column; gap: 20px; }

        .aud-back { align-self: flex-start; background: none; border: none; color: var(--ink-dim); font-size: 13px; text-decoration: none; }
        .aud-back:hover { color: var(--teal-glow); }

        .aud-header {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
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
        .aud-header-badges { margin-right: auto; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .aud-role-badge {
          font-size: 11.5px; padding: 5px 13px; border-radius: 999px;
          background: var(--status-neutral-bg); color: var(--status-neutral); border: 1px solid var(--status-neutral);
          white-space: nowrap;
        }
        .aud-role-badge.admin { background: var(--status-warn-bg); color: var(--status-warn); border-color: var(--status-warn); }

        .aud-status-menu-wrap { position: relative; }
        .aud-status-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 11.5px; padding: 5px 13px; border-radius: 999px; border: 1px solid; white-space: nowrap;
          font-family: var(--font-body); background: none; cursor: default;
        }
        .aud-status-badge.clickable { cursor: pointer; }
        .aud-status-badge:disabled { opacity: 0.6; cursor: not-allowed; }
        .aud-status-caret { font-size: 9px; }
        .aud-status-active { background: var(--status-ok-bg); color: var(--status-ok); border-color: var(--status-ok); }
        .aud-status-inactive { background: var(--status-warn-bg); color: var(--status-warn); border-color: var(--status-warn); }
        .aud-status-blocked, .aud-status-deleted { background: var(--status-danger-bg); color: var(--status-danger); border-color: var(--status-danger); }

        .aud-menu-backdrop { position: fixed; inset: 0; z-index: 40; }
        .aud-status-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; z-index: 41; min-width: 150px;
          background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius-md);
          box-shadow: 0 16px 36px -10px rgba(0,0,0,0.5); overflow: hidden;
        }
        .aud-status-item {
          display: block; width: 100%; padding: 10px 14px; text-align: right;
          background: none; border: none; font-size: 13px; cursor: pointer; font-family: var(--font-body);
        }
        .aud-status-item:hover { background: rgba(255,255,255,0.05); }
        .aud-status-item.ok { color: var(--status-ok); }
        .aud-status-item.warn { color: var(--status-warn); }
        .aud-status-item.danger { color: var(--status-danger); }

        .aud-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .aud-tab {
          padding: 10px 22px; border-radius: 999px; font-size: 13px; font-weight: 600;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
        }
        .aud-tab:hover { color: var(--teal-glow); border-color: var(--teal-glow); }
        .aud-tab.active { background: linear-gradient(135deg, var(--teal-light), var(--teal)); color: #eefaf5; border-color: transparent; }

        .aud-sections { display: flex; flex-direction: column; gap: 16px; }
        .aud-section { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 18px 22px; }
        .aud-section h2 { font-family: var(--font-display); color: var(--teal-glow); font-size: 14.5px; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--line); }

        .aud-info-row { display: flex; justify-content: space-between; gap: 14px; padding: 7px 0; font-size: 13px; }
        .aud-info-row span { color: var(--ink-faint); }
        .aud-info-row strong { color: var(--ink); font-weight: 500; text-align: left; }

        .aud-docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .aud-doc-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 14px; }
        .aud-doc-label { color: var(--teal-glow); font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .aud-doc-image-link { display: block; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--line); }
        .aud-doc-image-link img { width: 100%; height: 180px; object-fit: cover; display: block; transition: transform .4s ease; }
        .aud-doc-image-link:hover img { transform: scale(1.05); }
        .aud-doc-placeholder {
          height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
          background: var(--panel-inset-bg); border: 1px dashed var(--line); border-radius: var(--radius-md); color: var(--ink-faint);
        }
        .aud-doc-placeholder span { font-size: 26px; }
        .aud-doc-placeholder p { font-size: 12px; }
        .aud-doc-file-link { color: var(--teal-glow); font-size: 13px; }
        .aud-doc-file-link:hover { color: var(--teal-light); }

        .aud-edit-toggle {
          align-self: flex-start; padding: 9px 20px; border-radius: 999px; border: 1px solid rgba(15,111,92,0.4);
          background: transparent; color: var(--teal-glow); font-size: 13px; cursor: pointer;
        }
        .aud-edit-toggle:hover { background: rgba(15,111,92,0.1); }

        .aud-edit-wrap { display: flex; flex-direction: column; gap: 16px; }
        .aud-edit-actions-top {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          position: sticky; top: 0; z-index: 5; background: var(--bg); padding: 10px 0;
        }
        .aud-edit-cancel { padding: 10px 24px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer; }
        .aud-edit-message { font-size: 12.5px; color: var(--status-ok); }

        .aud-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .aud-edit-span-2 { grid-column: span 2; }
        .aud-edit-field label { display: block; color: var(--ink-dim); font-size: 12.5px; margin-bottom: 6px; }
        .aud-edit-field input, .aud-edit-field select, .aud-edit-field textarea {
          width: 100%; padding: 9px 12px; background: var(--input-bg); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-family: var(--font-body); font-size: 13px; outline: none;
        }
        .aud-edit-field input:focus, .aud-edit-field select:focus, .aud-edit-field textarea:focus { border-color: var(--teal-glow); }
        .aud-edit-field select option { background: var(--surface-2); color: var(--ink); }
        .aud-edit-checkbox { display: flex; align-items: center; gap: 9px; cursor: pointer; margin-top: 6px; }
        .aud-edit-checkbox input { width: 16px; height: 16px; accent-color: var(--teal-glow); }
        .aud-edit-checkbox span { color: var(--ink-dim); font-size: 13px; }

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

        @media (max-width: 700px) {
          .aud-edit-grid { grid-template-columns: 1fr; }
          .aud-edit-span-2 { grid-column: span 1; }
        }
      `}</style>
    </div>
  )
}

export default AdminUserDetail