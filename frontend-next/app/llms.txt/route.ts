import { siteName, siteUrl } from '@/lib/seo'

export function GET() {
  const pages = [
    ['صفحهٔ اصلی', '/', 'معرفی هیئت دانشجویی و فعالیت‌های کاروان اربعین'],
    ['اخبار و اطلاعیه‌ها', '/news', 'اطلاعیه‌ها و رویدادهای منتشرشده'],
    ['دلنوشته‌ها', '/articles', 'نوشته‌ها و خاطرات منتشرشده'],
    ['نگارخانه', '/gallery', 'تصاویر عمومی هیئت و کاروان'],
    ['فروشگاه', '/shop', 'محصولات عمومی و اطلاعات قیمت و موجودی'],
  ]
  const links = pages.map(([title, path, description]) =>
    `- [${title}](${new URL(path!, siteUrl)}): ${description}`,
  )

  return new Response(
    [`# ${siteName}`, '', '> وب‌سایت فارسی هیئت دانشجویی انصار القائم (عج).', '', '## صفحات عمومی', '', ...links, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
