import Home from '@/components/home/home'
import { getHomeData } from '@/lib/api/home'
import { headers } from 'next/headers'
import { jsonLd, pageMetadata, siteName, siteUrl } from '@/lib/seo'
import '@/styles/home.css'
import '@/styles/shrine.css'
export const metadata = pageMetadata(
  'هیئت دانشجویی انصار القائم (عج)',
  '/',
  'اخبار، سفرها و فعالیت‌های هیئت دانشجویی انصار القائم (عج)',
)
export default async function HomePage() {
  const [data, requestHeaders] = await Promise.all([getHomeData(), headers()])
  const description = 'هیئت دانشجویی برگزارکنندهٔ کاروان پیاده‌روی اربعین و منتشرکنندهٔ اخبار و مطالب مرتبط.'
  return (
    <>
      <script
        type="application/ld+json"
        nonce={requestHeaders.get('x-nonce') ?? undefined}
        dangerouslySetInnerHTML={{ __html: jsonLd({
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', '@id': new URL('/#organization', siteUrl).href, name: siteName, url: siteUrl.href, description },
            { '@type': 'WebSite', name: siteName, url: siteUrl.href, inLanguage: 'fa', publisher: { '@id': new URL('/#organization', siteUrl).href } },
          ],
        }) }}
      />
      <Home data={data} />
    </>
  )
}
