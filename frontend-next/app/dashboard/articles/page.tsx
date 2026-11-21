import Screen from '@/components/dashboard/articles'
import { listResponse, ownArticle } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'دلنوشته‌های من' }

export default async function Page() {
  await requireServerUser('/dashboard/articles')
  const initialItems = await privateRequest(
    '/content/articles/my/',
    listResponse(ownArticle).parse,
  ).catch(() => null)
  return <Screen initialItems={initialItems} />
}
