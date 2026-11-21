import Screen from '@/components/dashboard/trips'
import { listResponse, registration } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'
import { dashboardWalletSchema } from '@/lib/dashboard/contracts'

export const metadata = { title: 'سفرهای من' }

export default async function Page() {
  await requireServerUser('/dashboard/trips')
  const [initialItems, initialWallet] = await Promise.all([
    privateRequest('/trips/my-registrations/', listResponse(registration).parse).catch(() => null),
    privateRequest('/financial/wallet/', dashboardWalletSchema.parse).catch(() => null),
  ])
  return <Screen initialItems={initialItems} initialWallet={initialWallet} />
}
