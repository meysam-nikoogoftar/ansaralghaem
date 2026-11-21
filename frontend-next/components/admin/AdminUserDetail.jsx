'use client'

import { FormValidation } from '@/components/dashboard/forms'
import { errorMessage, fieldErrors } from '@/lib/api/errors'
import { LoadFeedback, useLoadFeedback } from '@/components/dashboard/load-feedback'
import { FormControl } from '@/components/dashboard/forms'
import { useEffect, useState } from 'react'
import Link from '@/components/navigation/app-link'
import api from '@/lib/admin/api'
import { safeCommitmentPath, safeMediaPath } from '@/lib/urls'
import FinancialReportView from '@/components/dashboard/financial-report'
import JalaliDatePicker from '@/components/ui/jalali-date-picker'
import { useSession } from '@/components/auth/session-provider'

const genderLabel = { male: 'برادر', female: 'خواهر' }
const maritalLabel = { single: 'مجرد', married: 'متاهل' }
const educationLabel = {
  diploma: 'دیپلم',
  associate: 'فوق دیپلم',
  bachelor: 'لیسانس',
  master: 'فوق لیسانس',
  phd: 'دکترا',
}
const studentStatusLabel = { student: 'دانشجو', graduate: 'فارغ‌التحصیل', professor: 'استاد' }
const militaryLabel = {
  exempt: 'معاف',
  done: 'کارت پایان خدمت',
  student: 'معافیت تحصیلی',
  other: 'سایر',
}
const roleLabel = { user: 'کاربر عادی', admin: 'ادمین', superadmin: 'سوپرادمین' }
const accountStatusLabel = {
  active: 'فعال',
  inactive: 'غیرفعال',
  blocked: 'مسدود',
  deleted: 'حذف شده',
}

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
  full: permissionFields.map((f) => f.key),
}

const PROFILE_FIELDS = [
  {
    section: 'اطلاعات هویتی',
    fields: [
      { key: 'first_name', label: 'نام' },
      { key: 'last_name', label: 'نام خانوادگی' },
      { key: 'father_name', label: 'نام پدر' },
      { key: 'national_code', label: 'کد ملی' },
      { key: 'birth_date', label: 'تاریخ تولد', type: 'jalali-date' },
      { key: 'gender', label: 'جنسیت', type: 'select', options: genderLabel },
      { key: 'marital_status', label: 'وضعیت تاهل', type: 'select', options: maritalLabel },
      { key: 'nationality', label: 'تابعیت' },
    ],
  },
  {
    section: 'اطلاعات تماس',
    fields: [
      { key: 'phone', label: 'شماره منزل' },
      { key: 'address', label: 'آدرس', type: 'textarea' },
      { key: 'emergency_name', label: 'نام نزدیکان' },
      { key: 'emergency_phone', label: 'شماره نزدیکان' },
      { key: 'emergency_relation', label: 'نسبت' },
    ],
  },
  {
    section: 'اطلاعات دانشگاهی',
    fields: [
      { key: 'university', label: 'نام دانشگاه' },
      { key: 'education_level', label: 'مقطع تحصیلی', type: 'select', options: educationLabel },
      {
        key: 'student_status',
        label: 'وضعیت دانشجویی',
        type: 'select',
        options: studentStatusLabel,
      },
    ],
  },
  {
    section: 'اطلاعات گذرنامه',
    fields: [
      { key: 'passport_number', label: 'شماره گذرنامه' },
      { key: 'passport_expiry', label: 'تاریخ انقضا', type: 'jalali-date' },
    ],
  },
  {
    section: 'اطلاعات بهداشتی',
    fields: [
      { key: 'has_disease', label: 'سابقه بیماری زمینه‌ای', type: 'checkbox' },
      { key: 'disease_description', label: 'توضیح بیماری', type: 'textarea' },
      { key: 'has_asthma', label: 'سابقه بیماری آسم/ریوی', type: 'checkbox' },
      { key: 'has_allergy', label: 'حساسیت دارویی/غذایی', type: 'checkbox' },
      { key: 'allergy_description', label: 'توضیح حساسیت', type: 'textarea' },
    ],
  },
  {
    section: 'اطلاعات نظامی',
    fields: [
      { key: 'military_status', label: 'وضعیت نظام وظیفه', type: 'select', options: militaryLabel },
    ],
  },
  { section: 'سرپرست', fields: [{ key: 'guardian_national_code', label: 'کد ملی سرپرست' }] },
]

const DOCUMENT_FIELDS = [
  { key: 'profile_image', label: 'تصویر پرسنلی' },
  { key: 'national_card_image', label: 'تصویر کارت ملی' },
  { key: 'student_card_image', label: 'تصویر کارت دانشجویی' },
  { key: 'passport_image', label: 'تصویر صفحه اول گذرنامه' },
]

function PermissionsPanel({ userId }) {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [perms, setPerms] = useState(null)
  const isLoading = !loadState.started || loadState.pending > 0
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    observeLoad(
      () => api.get(`/accounts/admin/users/${userId}/permissions/`).then(setPerms),
      '`/accounts/admin/users/${userId}/permissions/`',
    )
  }, [observeLoad, userId])

  const applyPreset = (roleKey) => {
    const active = rolePresets[roleKey] || []
    const next = { ...perms, admin_role: roleKey }
    permissionFields.forEach((f) => {
      next[f.key] = active.includes(f.key)
    })
    setPerms(next)
  }

  const toggleField = (key) => {
    setPerms({ ...perms, [key]: !perms[key], admin_role: 'custom' })
  }

  const handleSave = async () => {
    setValidationErrors({})

    setIsSaving(true)
    setMessage('')
    try {
      const res = await api.put(`/accounts/admin/users/${userId}/permissions/`, perms)
      setPerms(res)
      setMessage('دسترسی‌ها ذخیره شد')
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      setMessage('خطا در ذخیره دسترسی‌ها')
    }
    setIsSaving(false)
  }

  if (isLoading)
    return (
      <FormValidation errors={validationErrors}>
        <>
          <LoadFeedback state={loadState} onRetry={retryLoad} />
          {<div className="aud-loading">در حال بارگذاری...</div>}
        </>
      </FormValidation>
    )
  if (!perms)
    return (
      <FormValidation errors={validationErrors}>
        <>
          <LoadFeedback state={loadState} onRetry={retryLoad} />
          {null}
        </>
      </FormValidation>
    )

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="aud-perm-panel">
            <div className="aud-perm-presets">
              <span>نقش از پیش‌تعریف‌شده:</span>
              <button onClick={() => applyPreset('financial')} className="aud-perm-preset-btn">
                مسئول مالی
              </button>
              <button onClick={() => applyPreset('registration')} className="aud-perm-preset-btn">
                مسئول ثبت‌نام
              </button>
              <button onClick={() => applyPreset('content')} className="aud-perm-preset-btn">
                مسئول محتوا
              </button>
              <button onClick={() => applyPreset('full')} className="aud-perm-preset-btn full">
                فعال‌سازی کامل
              </button>
            </div>

            <div className="aud-perm-grid">
              {permissionFields.map((f) => (
                <label key={f.key} className="aud-perm-check">
                  <FormControl
                    as="input"
                    type="checkbox"
                    checked={!!perms[f.key]}
                    onChange={() => toggleField(f.key)}
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>

            {message && (
              <div role="status" aria-live="polite" aria-atomic="true" className="aud-perm-message">
                {message}
              </div>
            )}

            <button onClick={handleSave} disabled={isSaving} className="aud-perm-save">
              {isSaving ? 'در حال ذخیره...' : 'ذخیره دسترسی‌ها'}
            </button>
          </div>
        }
      </>
    </FormValidation>
  )
}

function ProfileEditor({ user, onSaved }) {
  const [validationErrors, setValidationErrors] = useState({})

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  const startEdit = () => {
    const init = {}
    PROFILE_FIELDS.forEach((group) => {
      group.fields.forEach((f) => {
        init[f.key] = user[f.key] ?? (f.type === 'checkbox' ? false : '')
      })
    })
    setFormData(init)
    setIsEditing(true)
  }

  const handleChange = (key, value, type) => {
    setFormData({
      ...formData,
      [key]: type === 'checkbox' ? value.target.checked : value.target.value,
    })
  }

  const handleSave = async () => {
    setValidationErrors({})

    setIsSaving(true)
    setMessage('')
    try {
      const payload = {
        ...formData,
        birth_date: formData.birth_date || null,
        passport_expiry: formData.passport_expiry || null,
        national_code: formData.national_code || null,
      }
      const res = await api.put(`/accounts/admin/users/${user.id}/`, payload)
      onSaved(res)
      setIsEditing(false)
      setMessage('اطلاعات ذخیره شد')
    } catch (error) {
      setValidationErrors(fieldErrors(error))

      setMessage('خطا در ذخیره اطلاعات')
    }
    setIsSaving(false)
  }

  if (!isEditing) {
    return (
      <FormValidation errors={validationErrors}>
        <button onClick={startEdit} className="aud-edit-toggle">
          ویرایش اطلاعات
        </button>
      </FormValidation>
    )
  }

  return (
    <FormValidation errors={validationErrors}>
      <div className="aud-edit-wrap">
        <div className="aud-edit-actions-top">
          <button onClick={handleSave} disabled={isSaving} className="aud-perm-save">
            {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
          <button onClick={() => setIsEditing(false)} className="aud-edit-cancel">
            انصراف
          </button>
          {message && (
            <span role="status" aria-live="polite" aria-atomic="true" className="aud-edit-message">
              {message}
            </span>
          )}
        </div>

        {PROFILE_FIELDS.map((group) => (
          <div key={group.section} className="aud-section">
            <h2>{group.section}</h2>
            <div className="aud-edit-grid">
              {group.fields.map((f) => (
                <div
                  key={f.key}
                  className={
                    f.type === 'textarea' ? 'aud-edit-field aud-edit-span-2' : 'aud-edit-field'
                  }
                >
                  {f.type === 'checkbox' ? (
                    <label className="aud-edit-checkbox">
                      <FormControl
                        as="input"
                        type="checkbox"
                        checked={!!formData[f.key]}
                        onChange={(e) => handleChange(f.key, e, 'checkbox')}
                      />
                      <span>{f.label}</span>
                    </label>
                  ) : (
                    <>
                      <label htmlFor={`admin-profile-${user.id}-${f.key}`}>{f.label}</label>
                      {f.type === 'select' ? (
                        <FormControl
                          as="select"
                          id={`admin-profile-${user.id}-${f.key}`}
                          name={f.key}
                          value={formData[f.key] || ''}
                          onChange={(e) => handleChange(f.key, e)}
                        >
                          <option value="">—</option>
                          {Object.entries(f.options).map(([val, lbl]) => (
                            <option key={val} value={val}>
                              {lbl}
                            </option>
                          ))}
                        </FormControl>
                      ) : f.type === 'textarea' ? (
                        <FormControl
                          as="textarea"
                          id={`admin-profile-${user.id}-${f.key}`}
                          name={f.key}
                          value={formData[f.key] || ''}
                          onChange={(e) => handleChange(f.key, e)}
                          rows={2}
                        />
                      ) : f.type === 'jalali-date' ? (
                        <JalaliDatePicker
                          id={`admin-profile-${user.id}-${f.key}`}
                          value={formData[f.key] || ''}
                          onChange={(iso) => setFormData({ ...formData, [f.key]: iso })}
                        />
                      ) : (
                        <FormControl
                          as="input"
                          id={`admin-profile-${user.id}-${f.key}`}
                          name={f.key}
                          type={f.type || 'text'}
                          value={formData[f.key] || ''}
                          onChange={(e) => handleChange(f.key, e)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </FormValidation>
  )
}

function DocumentsPanel({ user }) {
  const commitment = safeCommitmentPath(user.commitment_form)
  return (
    <div className="aud-docs-grid">
      {DOCUMENT_FIELDS.map((doc) => {
        const path = safeMediaPath(user[doc.key])
        return (
          <div key={doc.key} className="aud-doc-card">
            <p className="aud-doc-label">{doc.label}</p>
            {path ? (
              <a href={path} target="_blank" rel="noreferrer" className="aud-doc-image-link">
                <img src={path} alt={doc.label} />
              </a>
            ) : (
              <div className="aud-doc-placeholder">
                <span>📎</span>
                <p>هنوز آپلود نشده</p>
              </div>
            )}
          </div>
        )
      })}
      {commitment && (
        <div className="aud-doc-card">
          <p className="aud-doc-label">تعهدنامه / رضایت‌نامه</p>
          <a href={commitment} target="_blank" rel="noreferrer" className="aud-doc-file-link">
            📄 مشاهده فایل
          </a>
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

function AdminUserDetail({ id }) {
  const [validationErrors, setValidationErrors] = useState({})

  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const { user: currentUser } = useSession()
  const canViewFinancial =
    currentUser?.user_type === 'superadmin' || currentUser?.perm_financial === true
  const [user, setUser] = useState(null)
  const [report, setReport] = useState(null)
  const isLoading = !loadState.started || loadState.pending > 0
  const [isReportLoading, setIsReportLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [statusBusy, setStatusBusy] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)

  useEffect(() => {
    observeLoad(
      () => api.get(`/accounts/admin/users/${id}/`).then(setUser),
      '`/accounts/admin/users/${id}/`',
    )

    if (canViewFinancial)
      observeLoad(
        () =>
          api
            .get(`/financial/admin/report/${id}/`)
            .then(setReport)
            .finally(() => setIsReportLoading(false)),
        '`/financial/admin/report/${id}/`',
      )
  }, [canViewFinancial, id, observeLoad])

  const handleSetStatus = async (newStatus) => {
    setValidationErrors({})

    setStatusMenuOpen(false)
    if (newStatus === user.status) return
    if (!window.confirm(`وضعیت حساب به «${accountStatusLabel[newStatus]}» تغییر کند؟`)) return
    setStatusBusy(true)
    try {
      const res = await api.post(`/accounts/admin/users/${id}/status/`, { status: newStatus })
      setUser((u) => ({ ...u, status: res.status }))
    } catch (err) {
      setValidationErrors(fieldErrors(err))

      alert(errorMessage(err, 'خطا در تغییر وضعیت حساب'))
    }
    setStatusBusy(false)
  }

  if (isLoading)
    return (
      <FormValidation errors={validationErrors}>
        <>
          <LoadFeedback state={loadState} onRetry={retryLoad} />
          {<div className="aud-loading">در حال بارگذاری...</div>}
        </>
      </FormValidation>
    )
  if (!user && loadState.errors.includes(404))
    return (
      <FormValidation errors={validationErrors}>
        <>
          <LoadFeedback state={loadState} onRetry={retryLoad} />
          {<div className="aud-loading">کاربر یافت نشد</div>}
        </>
      </FormValidation>
    )

  if (!user) return <LoadFeedback state={loadState} onRetry={retryLoad} />

  const isSuperAdmin = currentUser?.user_type === 'superadmin'
  const canChangeStatus = isSuperAdmin && user.user_type !== 'superadmin'

  return (
    <FormValidation errors={validationErrors}>
      <>
        <LoadFeedback state={loadState} onRetry={retryLoad} />
        {
          <div className="aud-page">
            <Link href="/admin/users" className="aud-back">
              ← برگشت به لیست کاربران
            </Link>

            <div className="aud-header">
              <div className="aud-avatar">
                {user.profile_image ? (
                  <img src={safeMediaPath(user.profile_image) ?? undefined} alt="" />
                ) : (
                  user.first_name?.[0] || '؟'
                )}
              </div>
              <div>
                <h1>
                  {user.first_name} {user.last_name}
                </h1>
                <p>
                  {user.mobile} · عضو از {new Date(user.date_joined).toLocaleDateString('fa-IR')}
                </p>
              </div>
              <div className="aud-header-badges">
                <span className={`aud-role-badge${user.user_type !== 'user' ? ' admin' : ''}`}>
                  {roleLabel[user.user_type]}
                </span>

                <div className="aud-status-menu-wrap">
                  <button
                    aria-expanded={canChangeStatus ? statusMenuOpen : undefined}
                    aria-controls="account-status-actions"
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
                      <div
                        id="account-status-actions"
                        className="aud-status-dropdown"
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setStatusMenuOpen(false)
                            event.currentTarget.parentElement.querySelector('button')?.focus()
                          }
                        }}
                      >
                        <button
                          onClick={() => handleSetStatus('active')}
                          className="aud-status-item ok"
                        >
                          فعال
                        </button>
                        <button
                          onClick={() => handleSetStatus('inactive')}
                          className="aud-status-item warn"
                        >
                          غیرفعال
                        </button>
                        <button
                          onClick={() => handleSetStatus('deleted')}
                          className="aud-status-item danger"
                        >
                          حذف کاربر
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="aud-tabs">
              <button
                aria-pressed={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                className={`aud-tab${activeTab === 'profile' ? ' active' : ''}`}
              >
                اطلاعات کاربر
              </button>
              <button
                aria-pressed={activeTab === 'documents'}
                onClick={() => setActiveTab('documents')}
                className={`aud-tab${activeTab === 'documents' ? ' active' : ''}`}
              >
                تصاویر ارسالی
              </button>
              {canViewFinancial && (
                <button
                  aria-pressed={activeTab === 'financial'}
                  onClick={() => setActiveTab('financial')}
                  className={`aud-tab${activeTab === 'financial' ? ' active' : ''}`}
                >
                  گزارش مالی کاربر
                </button>
              )}
              {isSuperAdmin && user.user_type === 'admin' && (
                <button
                  aria-pressed={activeTab === 'permissions'}
                  onClick={() => setActiveTab('permissions')}
                  className={`aud-tab${activeTab === 'permissions' ? ' active' : ''}`}
                >
                  دسترسی‌های ادمین
                </button>
              )}
            </div>

            {activeTab === 'profile' && (
              <div className="aud-sections">
                <ProfileEditor
                  user={user}
                  onSaved={(updated) => setUser((u) => ({ ...u, ...updated }))}
                />

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
                  {user.has_disease && (
                    <InfoRow label="توضیح بیماری" value={user.disease_description} />
                  )}
                  <InfoRow label="سابقه بیماری آسم/ریوی" value={user.has_asthma ? 'بله' : 'خیر'} />
                  <InfoRow label="حساسیت دارویی/غذایی" value={user.has_allergy ? 'بله' : 'خیر'} />
                  {user.has_allergy && (
                    <InfoRow label="توضیح حساسیت" value={user.allergy_description} />
                  )}
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
            {activeTab === 'financial' &&
              canViewFinancial &&
              (isReportLoading ? (
                <p className="fr-loading" role="status">
                  در حال بارگذاری گزارش مالی...
                </p>
              ) : (
                report && <FinancialReportView data={report} />
              ))}
            {activeTab === 'permissions' && <PermissionsPanel userId={id} />}
          </div>
        }
      </>
    </FormValidation>
  )
}

export default AdminUserDetail
