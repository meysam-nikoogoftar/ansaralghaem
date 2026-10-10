import { useEffect, useState } from 'react'
import api from '../../services/api'
import FinancialReportView from '../../components/FinancialReportView'

function FinancialReport() {
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/financial/report/')
      .then(res => setReport(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="fin-page">
      <h1 className="fin-heading">گزارش مالی من</h1>
      <FinancialReportView data={report} isLoading={isLoading} />

      <style>{`
        .fin-page { display: flex; flex-direction: column; gap: 20px; }
        .fin-heading { font-family: var(--font-display); color: var(--teal-glow); font-size: 22px; }
      `}</style>
    </div>
  )
}

export default FinancialReport