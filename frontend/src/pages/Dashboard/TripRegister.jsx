import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

function TripRegister() {
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [companions, setCompanions] = useState([])
  const [searchCode, setSearchCode] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/trips/?registration_open=true')
      .then(res => setTrips(res.data.filter(t => t.registration_open)))
      .catch(() => {})
  }, [])

  const searchCompanion = async () => {
    setSearchError('')
    setSearchResult(null)
    try {
      const res = await api.get(`/accounts/search-user/?national_code=${searchCode}`)
      if (companions.find(c => c.id === res.data.id)) {
        setSearchError('این کاربر قبلاً اضافه شده')
        return
      }
      setSearchResult(res.data)
    } catch (err) {
      setSearchError(err.response?.data?.error || 'کاربر یافت نشد')
    }
  }

  const addCompanion = () => {
    if (searchResult) {
      setCompanions([...companions, searchResult])
      setSearchResult(null)
      setSearchCode('')
    }
  }

  const removeCompanion = (id) => {
    setCompanions(companions.filter(c => c.id !== id))
  }

  const handleSubmit = async () => {
    if (!selectedTrip) {
      alert('لطفاً یک سفر انتخاب کنید')
      return
    }
    if (!agreed) {
      alert('لطفاً شرایط سفر را بپذیرید')
      return
    }
    setIsLoading(true)
    try {
      await api.post('/trips/register/', {
        trip: selectedTrip.id,
        companion_national_codes: companions.map(c => c.national_code)
      })
      navigate('/dashboard/trips')
    } catch (err) {
      alert(err.response?.data?.error || 'خطا در ثبت‌نام')
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">ثبت‌نام سفر</h1>

      {/* انتخاب سفر */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">انتخاب سفر</h2>
        {trips.length === 0 ? (
          <p className="text-gray-500 text-sm">در حال حاضر سفری برای ثبت‌نام وجود ندارد</p>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                  selectedTrip?.id === trip.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{trip.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {trip.start_date} تا {trip.end_date}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-800">
                      {trip.cost?.toLocaleString()} تومان
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شرایط سفر */}
      {selectedTrip && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">شرایط سفر</h2>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto">
            {selectedTrip.conditions || 'شرایطی تعریف نشده'}
          </div>
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 accent-green-700"
            />
            <span className="text-sm text-gray-700">شرایط فوق را خوانده و قبول دارم</span>
          </label>
        </div>
      )}

      {/* همسفران */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">همسفران (اختیاری)</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="کد ملی همسفر"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={searchCompanion}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
          >
            جستجو
          </button>
        </div>

        {searchError && (
          <p className="text-red-600 text-sm mb-3">{searchError}</p>
        )}

        {searchResult && (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {searchResult.profile_image ? (
                <img src={searchResult.profile_image} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
                  {searchResult.first_name?.[0]}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">
                  {searchResult.first_name} {searchResult.last_name}
                </p>
                <p className="text-xs text-gray-500">کد ملی: {searchResult.national_code}</p>
              </div>
            </div>
            <button
              onClick={addCompanion}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              اضافه کردن
            </button>
          </div>
        )}

        {companions.length > 0 && (
          <div className="space-y-2">
            {companions.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">
                  {c.first_name} {c.last_name}
                </p>
                <button
                  onClick={() => removeCompanion(c.id)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* دکمه ثبت‌نام */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !selectedTrip}
        className="w-full bg-green-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام در سفر'}
      </button>
    </div>
  )
}

export default TripRegister