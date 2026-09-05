import { useState } from 'react'
import useAuthStore from '../../store/authStore'

function Profile() {
  const { user, updateProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
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
    const success = await updateProfile(formData)
    setMessage(success ? 'پروفایل با موفقیت بروزرسانی شد' : 'خطا در بروزرسانی')
    setIsLoading(false)
  }

  const Section = ({ title, children }) => (
    <div className="pf-card">
      <h2 className="pf-card-title">{title}</h2>
      <div className="pf-grid">{children}</div>
    </div>
  )

  const Field = ({ label, name, type = 'text', options }) => (
    <div className={type === 'checkbox' ? 'pf-field pf-field-checkbox' : 'pf-field'}>
      {type !== 'checkbox' && <label>{label}</label>}
      {options ? (
        <select name={name} value={formData[name]} onChange={handleChange} className="pf-input">
          <option value="">انتخاب کنید</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <label className="pf-checkbox-label">
          <input
            type="checkbox"
            name={name}
            checked={formData[name]}
            onChange={handleChange}
            className="pf-checkbox"
          />
          <span>{label}</span>
        </label>
      ) : type === 'textarea' ? (
        <textarea name={name} value={formData[name]} onChange={handleChange} rows={3} className="pf-input" />
      ) : (
        <input type={type} name={name} value={formData[name]} onChange={handleChange} className="pf-input" />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="pf-page">
      <h1 className="pf-heading">ویرایش پروفایل</h1>

      {message && (
        <div className={`pf-message ${message.includes('موفقیت') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <Section title="اطلاعات هویتی">
        <Field label="نام" name="first_name" />
        <Field label="نام خانوادگی" name="last_name" />
        <Field label="نام پدر" name="father_name" />
        <Field label="کد ملی" name="national_code" />
        <Field label="تاریخ تولد" name="birth_date" type="date" />
        <Field label="جنسیت" name="gender" options={[
          { value: 'male', label: 'برادر' },
          { value: 'female', label: 'خواهر' },
        ]} />
        <Field label="وضعیت تاهل" name="marital_status" options={[
          { value: 'single', label: 'مجرد' },
          { value: 'married', label: 'متاهل' },
        ]} />
      </Section>

      <Section title="اطلاعات تماس">
        <Field label="شماره منزل" name="phone" />
        <Field label="نام نزدیکان" name="emergency_name" />
        <Field label="شماره نزدیکان" name="emergency_phone" />
        <Field label="نسبت" name="emergency_relation" />
        <div className="pf-field pf-span-2">
          <Field label="آدرس" name="address" type="textarea" />
        </div>
      </Section>

      <Section title="اطلاعات دانشگاهی">
        <Field label="نام دانشگاه" name="university" />
        <Field label="مقطع تحصیلی" name="education_level" options={[
          { value: 'diploma', label: 'دیپلم' },
          { value: 'associate', label: 'فوق دیپلم' },
          { value: 'bachelor', label: 'لیسانس' },
          { value: 'master', label: 'فوق لیسانس' },
          { value: 'phd', label: 'دکترا' },
        ]} />
        <Field label="وضعیت دانشجویی" name="student_status" options={[
          { value: 'student', label: 'دانشجو' },
          { value: 'graduate', label: 'فارغ‌التحصیل' },
          { value: 'professor', label: 'استاد' },
        ]} />
      </Section>

      <Section title="اطلاعات گذرنامه">
        <Field label="شماره گذرنامه" name="passport_number" />
        <Field label="تاریخ انقضا" name="passport_expiry" type="date" />
      </Section>

      <Section title="اطلاعات بهداشتی">
        <div className="pf-field pf-span-2 pf-health-block">
          <Field label="سابقه بیماری زمینه‌ای" name="has_disease" type="checkbox" />
          {formData.has_disease && <Field label="توضیح بیماری" name="disease_description" type="textarea" />}
          <Field label="سابقه بیماری آسم یا ریوی" name="has_asthma" type="checkbox" />
          <Field label="حساسیت دارویی یا غذایی" name="has_allergy" type="checkbox" />
          {formData.has_allergy && <Field label="توضیح حساسیت" name="allergy_description" type="textarea" />}
        </div>
      </Section>

      {user?.gender === 'male' && (
        <Section title="اطلاعات نظامی">
          <Field label="وضعیت نظام وظیفه" name="military_status" options={[
            { value: 'exempt', label: 'معاف' },
            { value: 'done', label: 'کارت پایان خدمت' },
            { value: 'student', label: 'معافیت تحصیلی' },
            { value: 'other', label: 'سایر' },
          ]} />
        </Section>
      )}

      <button type="submit" disabled={isLoading} className="pf-submit">
        {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>

      <style>{`
        .pf-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 900px;
        }
        .pf-heading {
          font-family: var(--font-display);
          color: var(--gold-light);
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
          color: #ff9aa8;
        }

        .pf-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
        }
        .pf-card-title {
          font-family: var(--font-display);
          color: var(--gold-light);
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
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          outline: none;
          transition: all .25s ease;
        }
        .pf-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(216,181,104,0.12);
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
          accent-color: var(--gold);
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
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 20px -6px rgba(216,181,104,0.45);
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