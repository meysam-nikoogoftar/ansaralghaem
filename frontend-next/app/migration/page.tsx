import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'وضعیت مهاجرت', robots: { index: false, follow: false } }
export default function MigrationPage() {
  return (
    <main className="page-status">
      <h1>زیرساخت مهاجرت به Next.js آماده است</h1>
      <p>اخبار، دلنوشته‌ها و گالری در Next اجرا می‌شوند.</p>
      <a href="/news">مشاهدهٔ اخبار</a>
    </main>
  )
}
