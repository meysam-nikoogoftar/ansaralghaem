import Screen from '@/components/dashboard/tickets'
import { listResponse, ticket } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'تیکت‌ها' }

export default async function Page() {
  await requireServerUser('/dashboard/tickets')
  const initialItems = await privateRequest('/tickets/my/', listResponse(ticket).parse).catch(
    () => null,
  )
  return <Screen initialItems={initialItems} />
}
