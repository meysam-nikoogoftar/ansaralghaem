import 'server-only'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { backendHeaders, backendOrigin } from '@/lib/server/config'
import { productSchema, productCategorySchema } from '@/lib/commerce-contracts'
import { z } from 'zod'
export async function commerceRequest<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`${backendOrigin}/api${path}`, {
    headers: backendHeaders(),
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  })
  if (response.status === 404) notFound()
  if (!response.ok) throw new Error('دریافت اطلاعات فروشگاه انجام نشد')
  return schema.parse(await response.json())
}
export const getProducts = cache(() => commerceRequest('/shop/products/', z.array(productSchema)))
export const getProductCategories = cache(() =>
  commerceRequest('/shop/categories/', z.array(productCategorySchema)),
)
export const getProduct = cache((id: string) => {
  if (!/^[1-9]\d{0,9}$/.test(id)) notFound()
  return commerceRequest(`/shop/products/${id}/`, productSchema)
})
