import Screen from '@/components/dashboard/wallet'
import { listResponse, transaction } from '@/lib/dashboard/detail-contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'
import { dashboardWalletSchema } from '@/lib/dashboard/contracts'

export const metadata = { title: 'کیف پول' }

export default async function Page() {
  await requireServerUser('/dashboard/wallet')
  const [initialItems, initialWallet] = await Promise.all([
    privateRequest('/financial/wallet/transactions/', listResponse(transaction).parse).catch(
      () => null,
    ),
    privateRequest('/financial/wallet/', dashboardWalletSchema.parse).catch(() => null),
  ])
  return <Screen initialItems={initialItems} initialWallet={initialWallet} />
}
