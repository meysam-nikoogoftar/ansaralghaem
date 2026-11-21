import DashboardOverview from '@/components/dashboard/dashboard-overview'
import { dashboardRegistrationsSchema, dashboardWalletSchema } from '@/lib/dashboard/contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export default async function DashboardPage() {
  const user = await requireServerUser('/dashboard')
  const [wallet, registrations] = await Promise.all([
    privateRequest('/financial/wallet/', dashboardWalletSchema.parse).catch(() => null),
    privateRequest('/trips/my-registrations/', dashboardRegistrationsSchema.parse).catch(
      () => null,
    ),
  ])
  return <DashboardOverview user={user} wallet={wallet} registrations={registrations} />
}
