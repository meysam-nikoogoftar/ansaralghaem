import Screen from '@/components/dashboard/gallery'
import { listResponse, ownPhoto } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'گالری من' }

export default async function Page() {
  await requireServerUser('/dashboard/gallery')
  const initialItems = await privateRequest(
    '/content/gallery/my/',
    listResponse(ownPhoto).parse,
  ).catch(() => null)
  return <Screen initialItems={initialItems} />
}
