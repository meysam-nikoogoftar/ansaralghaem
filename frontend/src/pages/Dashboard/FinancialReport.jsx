import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import FinancialReportView from '../../components/FinancialReportView'
import './travel-finance.css'

function FinancialReport() {
  const { observeLoad, loadState, retryLoad } = useLoadFeedback()

  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    observeLoad(() => api.get('/financial/report/')
      .then(res => setReport(res.data))
      .catch(error => { throw error })
      .finally(() => setIsLoading(false)), "'/financial/report/'")
  }, [observeLoad])

  return (
    <><LoadFeedback state={loadState} onRetry={retryLoad} />{<div className="fin-page">
      <header className="fin-head"><div><h1 className="fin-heading">گزارش مالی من</h1><p>خلاصه موجودی و جزئیات پرداخت‌ها و دریافت‌های شما.</p></div><span>همه مبالغ به تومان</span></header>
      <FinancialReportView data={report} isLoading={isLoading} />


    </div>}</>
  )
}

export default FinancialReport
