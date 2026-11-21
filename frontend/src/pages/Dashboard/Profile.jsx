import FormControl from '../../components/FormControl'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import JalaliDatePicker from '../../components/JalaliDatePicker'
import ErrorSummary from '../../components/ErrorSummary'
import { fieldErrors } from '../../utils/validation'

const Section = ({ title, children }) => (
    <div className="pf-card">
      <h2 className="pf-card-title">{title}</h2>
      <div className="pf-grid">{children}</div>
    </div>
  )

function Field({ label, name, type = 'text', options, formData, setFormData, handleChange, errors }) {
  return <div className={type === 'checkbox' ? 'pf-field pf-field-checkbox' : 'pf-field'}>
    {type === 'checkbox' ? <label className="pf-checkbox-label">
      <FormControl as="input" type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className="pf-checkbox" error={errors?.[name]} />
      <span>{label}</span>
    </label> : <FormControl as={options ? 'select' : type === 'textarea' ? 'textarea' : type === 'jalali-date' ? JalaliDatePicker : 'input'}
      label={label} name={name} type={options || type === 'textarea' || type === 'jalali-date' ? undefined : type}
      value={formData[name] ?? ''} onChange={type === 'jalali-date' ? iso => setFormData(current => ({ ...current, [name]: iso })) : handleChange}
      className="pf-input" rows={type === 'textarea' ? 3 : undefined} error={errors?.[name]}>
      {options && <><option value="">انتخاب کنید</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</>}
    </FormControl>}
  </div>
}

function Profile() {
  const { user, updateProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [documents, setDocuments] = useState({})
  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    const normalized = { ...formData, national_code: formData.national_code || null, birth_date: formData.birth_date || null, passport_expiry: formData.passport_expiry || null }
    const payload = new FormData()
    Object.entries(normalized).forEach(([key, value]) => payload.append(key, value ?? ''))
    Object.entries(documents).forEach(([key, file]) => { if (file) payload.append(key, file) })
    const success = await updateProfile(Object.values(documents).some(Boolean) ? payload : normalized)
    if (!success) setErrors(fieldErrors(useAuthStore.getState().error))
    setMessage(success ? 'پروفایل با موفقیت بروزرسانی شد' : 'خطا در بروزرسانی')
    setIsLoading(false)
  }


  return (
    <form onSubmit={handleSubmit} className="pf-page">
      <h1 className="pf-heading">ویرایش پروفایل</h1>
      <p className="field-hint">اطلاعات هویتی و گذرنامه برای هماهنگی سفر، اطلاعات تماس برای ارتباط، و اطلاعات بهداشتی برای اعلام نیازهای مرتبط با سفر است. این فرم فیلد الزامی ندارد؛ مدارک موردنیاز را مطابق شرایط همان سفر تکمیل کنید.</p>
      <ErrorSummary errors={errors} />

      {message && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`pf-message ${message.includes('موفقیت') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <Section title="اطلاعات هویتی">
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="نام" name="first_name" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="نام خانوادگی" name="last_name" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="نام پدر" name="father_name" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="کد ملی" name="national_code" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="تاریخ تولد" name="birth_date" type="jalali-date" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="جنسیت" name="gender" options={[
          { value: 'male', label: 'برادر' },
          { value: 'female', label: 'خواهر' },
        ]} />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="وضعیت تاهل" name="marital_status" options={[
          { value: 'single', label: 'مجرد' },
          { value: 'married', label: 'متاهل' },
        ]} />
      </Section>

      <Section title="اطلاعات تماس">
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="شماره منزل" name="phone" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="نام نزدیکان" name="emergency_name" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="شماره نزدیکان" name="emergency_phone" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="نسبت" name="emergency_relation" />
        <div className="pf-field pf-span-2">
          <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="آدرس" name="address" type="textarea" />
        </div>
      </Section>

      <Section title="اطلاعات دانشگاهی">
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="نام دانشگاه" name="university" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="مقطع تحصیلی" name="education_level" options={[
          { value: 'diploma', label: 'دیپلم' },
          { value: 'associate', label: 'فوق دیپلم' },
          { value: 'bachelor', label: 'لیسانس' },
          { value: 'master', label: 'فوق لیسانس' },
          { value: 'phd', label: 'دکترا' },
        ]} />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="وضعیت دانشجویی" name="student_status" options={[
          { value: 'student', label: 'دانشجو' },
          { value: 'graduate', label: 'فارغ‌التحصیل' },
          { value: 'professor', label: 'استاد' },
        ]} />
      </Section>

      <Section title="اطلاعات گذرنامه">
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="شماره گذرنامه" name="passport_number" />
        <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="تاریخ انقضا" name="passport_expiry" type="date" />
      </Section>

      <Section title="اطلاعات بهداشتی">
        <div className="pf-field pf-span-2 pf-health-block">
          <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="سابقه بیماری زمینه‌ای" name="has_disease" type="checkbox" />
          {formData.has_disease && <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="توضیح بیماری" name="disease_description" type="textarea" />}
          <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="سابقه بیماری آسم یا ریوی" name="has_asthma" type="checkbox" />
          <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="حساسیت دارویی یا غذایی" name="has_allergy" type="checkbox" />
          {formData.has_allergy && <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="توضیح حساسیت" name="allergy_description" type="textarea" />}
        </div>
      </Section>

      {user?.gender === 'male' && (
        <Section title="اطلاعات نظامی">
          <Field formData={formData} setFormData={setFormData} handleChange={handleChange} errors={errors} label="وضعیت نظام وظیفه" name="military_status" options={[
            { value: 'exempt', label: 'معاف' },
            { value: 'done', label: 'کارت پایان خدمت' },
            { value: 'student', label: 'معافیت تحصیلی' },
            { value: 'other', label: 'سایر' },
          ]} />
        </Section>
      )}

      <Section title="مدارک">
        <p className="field-hint">در صورت نیاز طبق شرایط سفر، تصویر خوانای مدارک را انتخاب کنید. ارسال فایل با ذخیره تغییرات انجام می‌شود؛ انتخاب مجدد فقط فایل همان مدرک را جایگزین می‌کند.</p>
        {[
          ['profile_image', 'تصویر پرسنلی'], ['national_card_image', 'کارت ملی'],
          ['student_card_image', 'کارت دانشجویی'], ['passport_image', 'گذرنامه'],
        ].map(([name, label]) => <div className="pf-field" key={name}>
          <label htmlFor={`document-${name}`}>{label}</label>
          <FormControl as="input" id={`document-${name}`} type="file" name={name} accept="image/*" onChange={e => setDocuments(current => ({ ...current, [name]: e.target.files[0] }))} />
          {user?.[name] && <a href={user[name]} target="_blank" rel="noreferrer">مشاهده مدرک فعلی</a>}
          {errors[name] && <span role="status" aria-live="polite" aria-atomic="true" className="field-error">{errors[name]}</span>}
        </div>)}
      </Section>
      <button type="submit" disabled={isLoading} className="pf-submit">
        {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>

      <style>{`
        .pf-page {
          width: 100%;
          margin-inline: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 880px;
        }
        .pf-heading {
          font-family: var(--font-display);
          color: var(--teal-glow);
          font-size: 22px;
        }
        .pf-message {
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 13px;
        }
        .pf-message.success {
          background: rgba(31,163,130,0.15);
          border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow);
        }
        .pf-message.error {
          background: rgba(122,35,48,0.2);
          border: 1px solid rgba(122,35,48,0.4);
          color: var(--status-danger);
        }

        .pf-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
        }
        .pf-card-title {
          font-family: var(--font-display);
          color: var(--teal-glow);
          font-size: 16px;
          padding-bottom: 12px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--line);
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pf-span-2 { grid-column: span 2; }

        .pf-field label {
          display: block;
          color: var(--ink-dim);
          font-size: 13px;
          margin-bottom: 6px;
        }
        .pf-input {
          width: 100%;
          padding: 11px 14px;
          background: var(--input-bg);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          outline: none;
          transition: all .25s ease;
        }
        .pf-input:focus {
          border-color: var(--teal-glow);
          box-shadow: 0 0 0 3px rgba(15,111,92,0.15);
        }
        select.pf-input option { background: var(--surface-2); color: var(--ink); }

        .pf-health-block { display: flex; flex-direction: column; gap: 12px; }
        .pf-checkbox-label {
          display: flex; align-items: center; gap: 10px;
          cursor: pointer;
          color: var(--ink-dim);
          font-size: 13px;
        }
        .pf-checkbox {
          width: 17px; height: 17px;
          accent-color: var(--teal-glow);
        }

        .pf-submit {
          width: 100%;
          padding: 15px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          color: #eefaf5;
          background: linear-gradient(135deg, var(--teal-light), var(--teal) 65%, var(--teal));
          box-shadow: 0 6px 20px -6px rgba(15,111,92,0.45);
          transition: transform .25s ease, opacity .25s ease;
        }
        .pf-submit:hover:not(:disabled) { transform: translateY(-2px); }
        .pf-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 700px) {
          .pf-grid { grid-template-columns: 1fr; }
          .pf-span-2 { grid-column: span 1; }
        }
      `}</style>
    </form>
  )
}

export default Profile