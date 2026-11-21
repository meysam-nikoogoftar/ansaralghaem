import { z } from 'zod'

export const dashboardWalletSchema = z.object({ balance: z.number() })
export const dashboardRegistrationSchema = z.object({
  id: z.number().int().positive(),
  status: z.string(),
  tracking_code: z.string(),
  registered_at: z.string(),
  remaining_amount: z.number().nullable(),
  payment_status: z.string(),
  trip_detail: z
    .object({ title: z.string(), start_date: z.string(), end_date: z.string() })
    .nullish(),
})
const registrationList = z.array(dashboardRegistrationSchema)
export const dashboardRegistrationsSchema = z.union([
  registrationList,
  z.object({ results: registrationList }).transform(({ results }) => results),
])
export const ordersSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    product_title: z.string(),
    order_number: z.string(),
    status: z.string(),
    quantity: z.number(),
    final_price: z.number(),
    address: z.string(),
    postal_code: z.string(),
  }),
)
export type DashboardWallet = z.infer<typeof dashboardWalletSchema>
export type DashboardRegistration = z.infer<typeof dashboardRegistrationSchema>
