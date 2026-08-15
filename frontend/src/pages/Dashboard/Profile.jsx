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
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )

  const Field = ({ label, name, type = 'text', options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">انتخاب کنید</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            checked={formData[name]}
            onChange={handleChange}
            className="w-4 h-4 accent-green-700"
          />
          <span className="text-sm text-gray-600">{label}</span>
        </label>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800">ویرایش پروفایل</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
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
        <div className="md:col-span-2">
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
        <div className="md:col-span-2 space-y-3">
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  )
}

export default Profile