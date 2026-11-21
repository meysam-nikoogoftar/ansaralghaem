import { z } from 'zod'
export const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  code: z.string(),
  description: z.string(),
  category: z.number().int().nullable(),
  category_name: z.string().optional(),
  main_image: z.string().nullable(),
  price: z.number().nonnegative(),
  discounted_price: z.number().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
})
export const productCategorySchema = z.object({ id: z.number().int().positive(), name: z.string() })
export const trackingSchema = z.object({
  user_name: z.string(),
  tracking_code: z.string(),
  status: z.string(),
  payment_status: z.string(),
  trip_detail: z.object({ title: z.string() }),
})
export type Product = z.infer<typeof productSchema>
export type TrackingResult = z.infer<typeof trackingSchema>
