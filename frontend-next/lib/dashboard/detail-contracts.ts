import { z } from 'zod'
import { userSchema } from '@/lib/contracts'
import { dashboardRegistrationSchema } from './contracts'

const id = z.number().int().positive()
const text = z.string()
const image = text.nullish()
const money = z.number().int()
export function listResponse<T extends z.ZodType>(schema: T) {
  const list = z.array(schema)
  return z.union([list, z.object({ results: list }).transform((data) => data.results)])
}

export const ownArticle = z.object({ id, title: text, content: text, status: text })
export const ownPhoto = z.object({ id, title: text, image, status: text })
export const ticketMessage = z.object({ id, sender: id.nullable(), text, created_at: text })
export const ticket = z.object({
  id,
  user: id,
  title: text,
  priority: text,
  status: text,
  messages: z.array(ticketMessage),
})
export const availableTrip = z.object({
  id,
  title: text,
  start_date: text,
  end_date: text,
  conditions: text,
  cost: money,
  registration_open: z.boolean(),
  remaining_capacity: z.number().int().nonnegative().nullish(),
})
export const companion = z.object({
  id,
  first_name: text,
  last_name: text,
  national_code: text,
  profile_image: image,
})
export const registration = dashboardRegistrationSchema.extend({
  remaining_amount: money,
  paid_from_wallet: money,
  paid_directly: money,
  total_cost: money,
  refund_requested: z.boolean(),
  refund_status: text.nullish(),
  companions: z
    .array(
      z.object({
        id,
        companion_detail: z.object({ first_name: text, last_name: text }).nullish(),
      }),
    )
    .default([]),
})
export const walletCharge = z.object({ balance: money, message: text.optional() })
export const walletPayment = z.object({ wallet_balance: money })
export const transaction = z.object({
  id,
  amount: money,
  description: text.nullish(),
  status: text,
  transaction_type: text,
  created_at: text,
})
const payment = z.object({ id, amount: money, created_at: text })
export const financialReport = z.object({
  summary: z.object({
    wallet_balance: money,
    total_charged: money,
    total_wallet_spent: money,
    total_direct_paid: money,
    total_refunded: money,
    total_contributed: money,
  }),
  wallet_transactions: z.array(transaction),
  direct_payments: z.array(payment.extend({ trip_title: text })),
  contribution_payments: z.array(payment.extend({ contribution_title: text })),
})
export const profile = userSchema.extend({
  father_name: text.nullish(),
  national_code: text.nullish(),
  birth_date: text.nullish(),
  gender: text.nullish(),
  marital_status: text.nullish(),
  phone: text.nullish(),
  address: text.nullish(),
  emergency_name: text.nullish(),
  emergency_phone: text.nullish(),
  emergency_relation: text.nullish(),
  university: text.nullish(),
  education_level: text.nullish(),
  student_status: text.nullish(),
  passport_number: text.nullish(),
  passport_expiry: text.nullish(),
  has_disease: z.boolean(),
  disease_description: text.nullish(),
  has_asthma: z.boolean(),
  has_allergy: z.boolean(),
  allergy_description: text.nullish(),
  military_status: text.nullish(),
  national_card_image: image,
  student_card_image: image,
  passport_image: image,
})

export type OwnArticle = z.infer<typeof ownArticle>
export type OwnPhoto = z.infer<typeof ownPhoto>
export type Ticket = z.infer<typeof ticket>
export type AvailableTrip = z.infer<typeof availableTrip>
export type Companion = z.infer<typeof companion>
export type Registration = z.infer<typeof registration>
export type Transaction = z.infer<typeof transaction>
export type FinancialReport = z.infer<typeof financialReport>
export type Profile = z.infer<typeof profile>
