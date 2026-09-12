import { useEffect, useState } from 'react'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'

const typeMeta = {
  user: { label: 'کاربر عادی', color: '#af9f88' },
  admin: { label: 'ادمین', color: '#d8b568' },
  superadmin: { label: 'سوپرادمین', color: '#ff9aa8' },
}

function AdminUsers() {
  const { user: currentUser } = useAuthStore()
  const isSuperAdmin = currentUser?.user_type === 'superadmin'

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState('')

  const fetchUsers = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (typeFilter) params.append('user_type', typeFilter)
    api.get(`/accounts/admin/users/?${params.toString()}`)
      .then(res => setUsers(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleToggleRole = async (u) => {
    const newType = u.user_type === 'admin' ? 'user' : 'admin'
    setBusyId(u.id)
    setMessage('')
    try {
      const res = await api.post(`/accounts/admin/users/${u.id}/promote/`, { user_type: newType })
      setUsers(users.map(x => x.id === u.id ? { ...x, user_type: res.data.user_type } : x))
      setMessage(`نقش ${u.first_name} ${u.last_name} به «${typeMeta[res.data.user_type].label}» تغییر کرد`)
    } catch (err) {
      setMessage(err.response?.data?.error || 'خطا در تغییر نقش کاربر')
    }
    setBusyId(null)
  }

  return (
    <div className="aus-page">
      <h1 className="aus-heading">مدیریت کاربران</h1>

      {message && <div className="aus-message">{message}</div>}

      <div className="aus-toolbar">
        <form onSubmit={handleSearchSubmit} className="aus-search-form">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام، موبایل یا کد ملی..."
            className="aus-search-input"
          />
          <button type="submit" className="aus-search-btn">جستجو</button>
        </form>

        <div className="aus-type-tabs">
          {[
            { key: '', label: 'همه' },
            { key: 'user', label: 'کاربر عادی' },
            { key: 'admin', label: 'ادمین' },
            { key: 'superadmin', label: 'سوپرادمین' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`aus-type-tab${typeFilter === t.key ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="aus-loading">در حال بارگذاری...</div>
      ) : users.length === 0 ? (
        <div className="aus-empty">کاربری یافت نشد</div>
      ) : (
        <div className="aus-table-wrap">
          <table className="aus-table">
            <thead>
              <tr>
                <th>کاربر</th>
                <th>موبایل</th>
                <th>کد ملی</th>
                <th>نقش</th>
                <th>تاریخ عضویت</th>
                {isSuperAdmin && <th>عملیات</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="aus-user-cell">
                      <div className="aus-avatar">
                        {u.profile_image ? <img src={u.profile_image} alt="" /> : (u.first_name?.[0] || '؟')}
                      </div>
                      <span>{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="aus-mono">{u.mobile}</td>
                  <td className="aus-mono">{u.national_code || '—'}</td>
                  <td>
                    <span
                      className="aus-role-pill"
                      style={{ color: typeMeta[u.user_type]?.color, borderColor: typeMeta[u.user_type]?.color, background: `${typeMeta[u.user_type]?.color}1a` }}
                    >
                      {typeMeta[u.user_type]?.label || u.user_type}
                    </span>
                  </td>
                  <td className="aus-date">{new Date(u.date_joined).toLocaleDateString('fa-IR')}</td>
                  {isSuperAdmin && (
                    <td>
                      {u.user_type === 'superadmin' ? (
                        <span className="aus-locked">—</span>
                      ) : (
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={busyId === u.id}
                          className={`aus-role-btn${u.user_type === 'admin' ? ' demote' : ''}`}
                        >
                          {busyId === u.id ? '...' : (u.user_type === 'admin' ? 'تنزل به کاربر عادی' : 'ارتقا به ادمین')}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .aus-page { display: flex; flex-direction: column; gap: 18px; }
        .aus-heading { font-family: var(--font-display); color: var(--gold-light); font-size: 21px; }

        .aus-message {
          padding: 11px 14px; border-radius: var(--radius-sm);
          background: rgba(31,163,130,0.12); border: 1px solid rgba(31,163,130,0.3);
          color: var(--teal-glow); font-size: 13px;
        }

        .aus-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .aus-search-form { display: flex; gap: 8px; flex: 1; min-width: 240px; max-width: 380px; }
        .aus-search-input {
          flex: 1; padding: 9px 14px;
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-sm); color: var(--ink); font-size: 13px; outline: none;
        }
        .aus-search-input:focus { border-color: var(--gold); }
        .aus-search-btn {
          padding: 0 16px; border-radius: var(--radius-sm); border: 1px solid var(--line);
          background: transparent; color: var(--ink-dim); font-size: 13px; cursor: pointer;
        }
        .aus-search-btn:hover { border-color: var(--gold); color: var(--gold-light); }

        .aus-type-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .aus-type-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px;
          border: 1px solid var(--line); background: transparent; color: var(--ink-dim); cursor: pointer;
        }
        .aus-type-tab:hover { color: var(--gold-light); border-color: var(--gold); }
        .aus-type-tab.active {
          background: rgba(216,181,104,0.12); color: var(--gold-light); border-color: var(--gold);
        }

        .aus-loading, .aus-empty {
          text-align: center; padding: 50px 0; color: var(--ink-dim); font-size: 13px;
        }

        .aus-table-wrap {
          background: var(--surface); border: 1px solid var(--line);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .aus-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .aus-table th {
          text-align: right; padding: 12px 16px; color: var(--ink-faint);
          font-size: 11.5px; font-weight: 500;
          border-bottom: 1px solid var(--line);
          white-space: nowrap;
        }
        .aus-table td {
          padding: 12px 16px; color: var(--ink);
          border-bottom: 1px solid var(--line);
          white-space: nowrap;
        }
        .aus-table tr:last-child td { border-bottom: none; }
        .aus-table tr:hover td { background: rgba(255,255,255,0.02); }

        .aus-user-cell { display: flex; align-items: center; gap: 10px; }
        .aus-avatar {
          width: 30px; height: 30px; border-radius: 50%; overflow: hidden;
          background: var(--teal); color: var(--gold-light);
          display: grid; place-items: center; font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .aus-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .aus-mono { font-family: monospace; color: var(--ink-dim); font-size: 12.5px; }
        .aus-date { color: var(--ink-faint); font-size: 12px; }

        .aus-role-pill {
          font-size: 11px; padding: 4px 11px; border-radius: 999px; border: 1px solid;
        }

        .aus-role-btn {
          font-size: 11.5px; padding: 6px 13px; border-radius: 999px;
          border: 1px solid rgba(216,181,104,0.4); background: transparent;
          color: var(--gold-light); cursor: pointer;
        }
        .aus-role-btn:hover { background: rgba(216,181,104,0.1); }
        .aus-role-btn.demote { border-color: rgba(255,107,125,0.4); color: #ff9aa8; }
        .aus-role-btn.demote:hover { background: rgba(122,35,48,0.12); }
        .aus-role-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .aus-locked { color: var(--ink-faint); font-size: 12px; }
      `}</style>
    </div>
  )
}

export default AdminUsers