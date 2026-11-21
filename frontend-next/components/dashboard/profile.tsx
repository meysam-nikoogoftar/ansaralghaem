'use client'
import '@/styles/dashboard/profile-page.css'
import {
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useRouter } from 'next/navigation'
import { announceSessionChange } from '@migration/session-client'
import { FormControl, ErrorSummary } from './forms'
import JalaliDatePicker from './jalali-date-picker'
import { dashboardRequest } from '@/lib/dashboard/browser'
import { fieldErrors } from '@/lib/api/errors'
import { safeMediaPath } from '@/lib/urls'
import { profile, type Profile as ProfileData } from '@/lib/dashboard/detail-contracts'
import type { FieldErrors } from '@/types'
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="pf-card">
    <h2 className="pf-card-title">{title}</h2>
    <div className="pf-grid">{children}</div>
  </div>
)

type ProfileFields = Record<string, string | boolean>
type ProfileChange = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
type ProfileFieldProps = {
  label: string
  name: string
  type?: string
  options?: { value: string; label: string }[]
  formData: ProfileFields
  setFormData: Dispatch<SetStateAction<ProfileFields>>
  handleChange: (event: ProfileChange) => void
  errors: FieldErrors
}
function Field({
  label,
  name,
  type = 'text',
  options,
  formData,
  setFormData,
  handleChange,
  errors,
}: ProfileFieldProps) {
  const value = String(formData[name] ?? '')
  const common = { label, name, className: 'pf-input', error: errors[name] }
  return (
    <div className={type === 'checkbox' ? 'pf-field pf-field-checkbox' : 'pf-field'}>
      {type === 'checkbox' ? (
        <label className="pf-checkbox-label">
          <FormControl
            type="checkbox"
            name={name}
            checked={Boolean(formData[name])}
            onChange={handleChange}
            className="pf-checkbox"
            error={errors[name]}
          />
          <span>{label}</span>
        </label>
      ) : options ? (
        <FormControl as="select" {...common} value={value} onChange={handleChange}>
          <option value="">انتخاب کنید</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormControl>
      ) : type === 'jalali-date' ? (
        <>
          <span>{label}</span>
          <JalaliDatePicker
            label={label}
            value={value}
            onChange={(date) => setFormData((current) => ({ ...current, [name]: date }))}
          />
          {errors[name] && <span className="field-error">{errors[name]}</span>}
        </>
      ) : type === 'textarea' ? (
        <FormControl as="textarea" {...common} value={value} rows={3} onChange={handleChange} />
      ) : (
        <FormControl {...common} type={type} value={value} onChange={handleChange} />
      )}
    </div>
  )
}

function Profile({ initialUser }: { initialUser: ProfileData }) {
  const [user, setUser] = useState(initialUser)
  const router = useRouter()
  const submitting = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [documents, setDocuments] = useState<Record<string, File | undefined>>({})
  const [formData, setFormData] = useState<ProfileFields>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    father_name: user?.father_name || '',
    national_code: user?.national_code || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || '',
    marital_status: user?.marital_status || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergency_name: user?.emergency_name || '',
    emergency_phone: user?.emergency_phone || '',
    emergency_relation: user?.emergency_relation || '',
    university: user?.university || '',
    education_level: user?.education_level || '',
    student_status: user?.student_status || '',
    passport_number: user?.passport_number || '',
    passport_expiry: user?.passport_expiry || '',
    has_disease: user?.has_disease || false,
    disease_description: user?.disease_description || '',
    has_asthma: user?.has_asthma || false,
    has_allergy: user?.has_allergy || false,
    allergy_description: user?.allergy_description || '',
    military_status: user?.military_status || '',
  })

  const handleChange = (e: ProfileChange) => {
    const { name, value, type } = e.target
    const checked = e.target instanceof HTMLInputElement && e.target.checked
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setIsLoading(true)
    setErrors({})
    const normalized = {
      ...formData,
      national_code: formData.national_code || null,
      birth_date: formData.birth_date || null,
      passport_expiry: formData.passport_expiry || null,
    }
    const payload = new FormData()
    Object.entries(normalized).forEach(([key, value]) => payload.append(key, String(value ?? '')))
    Object.entries(documents).forEach(([key, file]) => {
      if (file) payload.append(key, file)
    })
    try {
      const updated = await dashboardRequest(
        '/accounts/profile/',
        profile.parse,
        Object.values(documents).some(Boolean) ? payload : normalized,
        'PUT',
      )
      setUser(updated)
      announceSessionChange()
      router.refresh()
      setMessage('پروفایل با موفقیت به‌روز شد')
    } catch (error) {
      setErrors(fieldErrors(error))
      setMessage('خطا در به‌روزرسانی')
    } finally {
      submitting.current = false
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pf-page">
      <h1 className="pf-heading">ویرایش پروفایل</h1>
      <p className="field-hint">
        اطلاعات هویتی و گذرنامه برای هماهنگی سفر، اطلاعات تماس برای ارتباط، و اطلاعات بهداشتی برای
        اعلام نیازهای مرتبط با سفر است. این فرم فیلد الزامی ندارد؛ مدارک موردنیاز را مطابق شرایط
        همان سفر تکمیل کنید.
      </p>
      <ErrorSummary errors={errors} />

      {message && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`pf-message ${message.includes('موفقیت') ? 'success' : 'error'}`}
        >
          {message}
        </div>
      )}

      <Section title="اطلاعات هویتی">
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="نام"
          name="first_name"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="نام خانوادگی"
          name="last_name"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="نام پدر"
          name="father_name"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="کد ملی"
          name="national_code"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="تاریخ تولد"
          name="birth_date"
          type="jalali-date"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="جنسیت"
          name="gender"
          options={[
            { value: 'male', label: 'برادر' },
            { value: 'female', label: 'خواهر' },
          ]}
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="وضعیت تاهل"
          name="marital_status"
          options={[
            { value: 'single', label: 'مجرد' },
            { value: 'married', label: 'متاهل' },
          ]}
        />
      </Section>

      <Section title="اطلاعات تماس">
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="شماره منزل"
          name="phone"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="نام نزدیکان"
          name="emergency_name"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="شماره نزدیکان"
          name="emergency_phone"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="نسبت"
          name="emergency_relation"
        />
        <div className="pf-field pf-span-2">
          <Field
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            errors={errors}
            label="آدرس"
            name="address"
            type="textarea"
          />
        </div>
      </Section>

      <Section title="اطلاعات دانشگاهی">
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="نام دانشگاه"
          name="university"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="مقطع تحصیلی"
          name="education_level"
          options={[
            { value: 'diploma', label: 'دیپلم' },
            { value: 'associate', label: 'فوق دیپلم' },
            { value: 'bachelor', label: 'لیسانس' },
            { value: 'master', label: 'فوق لیسانس' },
            { value: 'phd', label: 'دکترا' },
          ]}
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="وضعیت دانشجویی"
          name="student_status"
          options={[
            { value: 'student', label: 'دانشجو' },
            { value: 'graduate', label: 'فارغ‌التحصیل' },
            { value: 'professor', label: 'استاد' },
          ]}
        />
      </Section>

      <Section title="اطلاعات گذرنامه">
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="شماره گذرنامه"
          name="passport_number"
        />
        <Field
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          errors={errors}
          label="تاریخ انقضا"
          name="passport_expiry"
          type="date"
        />
      </Section>

      <Section title="اطلاعات بهداشتی">
        <div className="pf-field pf-span-2 pf-health-block">
          <Field
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            errors={errors}
            label="سابقه بیماری زمینه‌ای"
            name="has_disease"
            type="checkbox"
          />
          {formData.has_disease && (
            <Field
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              errors={errors}
              label="توضیح بیماری"
              name="disease_description"
              type="textarea"
            />
          )}
          <Field
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            errors={errors}
            label="سابقه بیماری آسم یا ریوی"
            name="has_asthma"
            type="checkbox"
          />
          <Field
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            errors={errors}
            label="حساسیت دارویی یا غذایی"
            name="has_allergy"
            type="checkbox"
          />
          {formData.has_allergy && (
            <Field
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              errors={errors}
              label="توضیح حساسیت"
              name="allergy_description"
              type="textarea"
            />
          )}
        </div>
      </Section>

      {user?.gender === 'male' && (
        <Section title="اطلاعات نظامی">
          <Field
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            errors={errors}
            label="وضعیت نظام وظیفه"
            name="military_status"
            options={[
              { value: 'exempt', label: 'معاف' },
              { value: 'done', label: 'کارت پایان خدمت' },
              { value: 'student', label: 'معافیت تحصیلی' },
              { value: 'other', label: 'سایر' },
            ]}
          />
        </Section>
      )}

      <Section title="مدارک">
        <p className="field-hint">
          در صورت نیاز طبق شرایط سفر، تصویر خوانای مدارک را انتخاب کنید. ارسال فایل با ذخیره تغییرات
          انجام می‌شود؛ انتخاب مجدد فقط فایل همان مدرک را جایگزین می‌کند.
        </p>
        {(
          [
            ['profile_image', 'تصویر پرسنلی'],
            ['national_card_image', 'کارت ملی'],
            ['student_card_image', 'کارت دانشجویی'],
            ['passport_image', 'گذرنامه'],
          ] as const
        ).map(([name, label]) => (
          <div className="pf-field" key={name}>
            <label htmlFor={`document-${name}`}>{label}</label>
            <FormControl
              as="input"
              id={`document-${name}`}
              type="file"
              name={name}
              accept="image/*"
              onChange={(e) =>
                setDocuments((current) => ({ ...current, [name]: e.target.files?.[0] }))
              }
            />
            {safeMediaPath(user[name]) && (
              <a href={safeMediaPath(user[name]) ?? undefined} target="_blank" rel="noreferrer">
                مشاهده مدرک فعلی
              </a>
            )}
            {errors[name] && (
              <span role="status" aria-live="polite" aria-atomic="true" className="field-error">
                {errors[name]}
              </span>
            )}
          </div>
        ))}
      </Section>
      <button type="submit" disabled={isLoading} className="pf-submit">
        {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  )
}

export default Profile
