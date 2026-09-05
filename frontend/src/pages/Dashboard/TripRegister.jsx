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
    <div className="tr-page">
      <h1 className="tr-heading">ثبت‌نام سفر</h1>

      {/* انتخاب سفر */}
      <div className="tr-card">
        <h2>انتخاب سفر</h2>
        {trips.length === 0 ? (
          <p className="tr-empty-text">در حال حاضر سفری برای ثبت‌نام وجود ندارد</p>
        ) : (
          <div className="tr-trip-options">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className={`tr-trip-option${selectedTrip?.id === trip.id ? ' selected' : ''}`}
              >
                <div>
                  <h3>{trip.title}</h3>
                  <p>{trip.start_date} تا {trip.end_date}</p>
                </div>
                <strong>{trip.cost?.toLocaleString('fa-IR')} تومان</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شرایط سفر */}
      {selectedTrip && (
        <div className="tr-card">
          <h2>شرایط سفر</h2>
          <div className="tr-conditions">
            {selectedTrip.conditions || 'شرایطی تعریف نشده'}
          </div>
          <label className="tr-agree">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>شرایط فوق را خوانده و قبول دارم</span>
          </label>
        </div>
      )}

      {/* همسفران */}
      <div className="tr-card">
        <h2>همسفران (اختیاری)</h2>
        <div className="tr-search-row">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="کد ملی همسفر"
            className="tr-input"
          />
          <button onClick={searchCompanion} className="tr-search-btn">جستجو</button>
        </div>

        {searchError && <p className="tr-search-error">{searchError}</p>}

        {searchResult && (
          <div className="tr-search-result">
            <div className="tr-search-result-info">
              {searchResult.profile_image ? (
                <img src={searchResult.profile_image} alt="" />
              ) : (
                <div className="tr-avatar-fallback">{searchResult.first_name?.[0]}</div>
              )}
              <div>
                <p>{searchResult.first_name} {searchResult.last_name}</p>
                <span>کد ملی: {searchResult.national_code}</span>
              </div>
            </div>
            <button onClick={addCompanion} className="tr-add-btn">اضافه کردن</button>
          </div>
        )}

        {companions.length > 0 && (
          <div className="tr-companion-list">
            {companions.map((c) => (
              <div key={c.id} className="tr-companion-row">
                <p>{c.first_name} {c.last_name}</p>
                <button onClick={() => removeCompanion(c.id)}>حذف</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* دکمه ثبت‌نام */}
      <button onClick={handleSubmit} disabled={isLoading || !selectedTrip} className="tr-submit">
        {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام در سفر'}
      </button>

      <style>{`
        .tr-page { display: flex; flex-direction: column; gap: 18px; max-width: 680px; }
        .tr-heading { font-family: var(--font-display); color: var(--gold-light); font-size: 22px; }

        .tr-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px 22px;
        }
        .tr-card h2 {
          font-family: var(--font-display);
          color: var(--gold-light);
          font-size: 15px;
          margin-bottom: 14px;
        }
        .tr-empty-text { color: var(--ink-dim); font-size: 13px; }

        .tr-trip-options { display: flex; flex-direction: column; gap: 10px; }
        .tr-trip-option {
          display: flex; align-items: center; justify-content: space-between;
          border: 1.5px solid var(--line);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          cursor: pointer;
          transition: all .25s ease;
        }
        .tr-trip-option:hover { border-color: rgba(216,181,104,0.4); }
        .tr-trip-option.selected {
          border-color: var(--gold);
          background: rgba(216,181,104,0.06);
        }
        .tr-trip-option h3 { color: var(--ink); font-size: 14px; font-weight: 600; }
        .tr-trip-option p { color: var(--ink-faint); font-size: 12px; margin-top: 4px; }
        .tr-trip-option strong { color: var(--gold-light); font-size: 14px; }

        .tr-conditions {
          background: rgba(10,21,18,0.5);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 14px;
          color: var(--ink-dim);
          font-size: 13px;
          line-height: 1.9;
          max-height: 180px;
          overflow-y: auto;
        }
        .tr-agree {
          display: flex; align-items: center; gap: 10px;
          margin-top: 14px; cursor: pointer;
        }
        .tr-agree input { width: 16px; height: 16px; accent-color: var(--gold); }
        .tr-agree span { color: var(--ink-dim); font-size: 13px; }

        .tr-search-row { display: flex; gap: 10px; margin-bottom: 14px; }
        .tr-input {
          flex: 1;
          padding: 11px 14px;
          background: rgba(10,21,18,0.6);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          color: var(--ink);
          font-size: 13px;
          outline: none;
        }
        .tr-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(216,181,104,0.12); }
        .tr-search-btn {
          padding: 0 20px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: transparent;
          color: var(--ink-dim);
          font-size: 13px;
          cursor: pointer;
        }
        .tr-search-btn:hover { border-color: var(--gold); color: var(--gold-light); }

        .tr-search-error { color: #ff9aa8; font-size: 13px; margin-bottom: 12px; }

        .tr-search-result {
          display: flex; align-items: center; justify-content: space-between;
          border: 1px solid rgba(31,163,130,0.3);
          background: rgba(31,163,130,0.08);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-bottom: 14px;
        }
        .tr-search-result-info { display: flex; align-items: center; gap: 10px; }
        .tr-search-result-info img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
        .tr-avatar-fallback {
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--teal);
          color: var(--gold-light);
          display: grid; place-items: center;
          font-weight: 700; font-size: 14px;
        }
        .tr-search-result-info p { color: var(--ink); font-size: 13px; font-weight: 600; }
        .tr-search-result-info span { color: var(--ink-faint); font-size: 11px; }
        .tr-add-btn {
          padding: 8px 16px;
          border-radius: 999px;
          border: none;
          background: var(--teal-glow);
          color: #06130f;
          font-size: 12px; font-weight: 700;
          cursor: pointer;
        }

        .tr-companion-list { display: flex; flex-direction: column; gap: 8px; }
        .tr-companion-row {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,21,18,0.5);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
        }
        .tr-companion-row p { color: var(--ink); font-size: 13px; font-weight: 500; }
        .tr-companion-row button {
          background: none; border: none;
          color: #ff9aa8; font-size: 12px; cursor: pointer;
        }

        .tr-submit {
          width: 100%;
          padding: 15px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 15px; font-weight: 700;
          color: #1a1206;
          background: linear-gradient(135deg, var(--gold-light), var(--gold) 50%, var(--gold-dark));
          box-shadow: 0 6px 20px -6px rgba(216,181,104,0.45);
          transition: transform .25s ease, opacity .25s ease;
        }
        .tr-submit:hover:not(:disabled) { transform: translateY(-2px); }
        .tr-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}

export default TripRegister