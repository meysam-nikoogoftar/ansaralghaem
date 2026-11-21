import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import localFont from 'next/font/local'
import { headers } from 'next/headers'
import Providers from './providers'
import { themeBootstrap } from '@/lib/theme-script'
import { siteName, siteUrl } from '@/lib/seo'
import { getServerUser } from '@/lib/server/session'
import '@/styles/foundation.css'
import '@/styles/interface.css'
import '@/styles/account-menu.css'
import '@/styles/migration.css'

const vazirmatn = localFont({
  src: '../public/fonts/Vazirmatn-variable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-vazirmatn',
})
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: siteName, template: `%s | ${siteName}` },
  description: 'اخبار، دلنوشته‌ها و تصاویر هیئت دانشجویی انصار القائم (عج)',
  robots: { index: true, follow: true },
  icons: { icon: { url: '/site-icon.png', sizes: '48x48', type: 'image/png' } },
}
export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || undefined
  const initialUser = await getServerUser().catch(() => undefined)
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={vazirmatn.className}>
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  )
}
