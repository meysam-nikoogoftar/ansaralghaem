import Screen from '@/components/dashboard/trips-register'
import { listResponse, availableTrip } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'ثبت‌نام سفر' }

export default async function Page() {
  await requireServerUser('/dashboard/trips/register')
  const initialItems = await privateRequest('/trips/', listResponse(availableTrip).parse).catch(
    () => null,
  )
  return <Screen initialItems={initialItems} />
}
