import TrackingForm from '@/components/commerce/tracking-form'
export const metadata = { title: 'پیگیری ثبت‌نام', robots: { index: false, follow: false } }
export default function TrackPage() {
  return (
    <section className="tg-container">
      <h1>پیگیری ثبت‌نام</h1>
      <div className="tg-card">
        <TrackingForm />
      </div>
    </section>
  )
}
