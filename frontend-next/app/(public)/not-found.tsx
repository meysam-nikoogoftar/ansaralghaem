import AppLink from '@/components/navigation/app-link'
export default function NotFound() {
  return (
    <section className="page-status">
      <h1>محتوا پیدا نشد</h1>
      <p>این محتوا وجود ندارد یا هنوز منتشر نشده است.</p>
      <AppLink href="/news">مشاهدهٔ اخبار</AppLink>
    </section>
  )
}
