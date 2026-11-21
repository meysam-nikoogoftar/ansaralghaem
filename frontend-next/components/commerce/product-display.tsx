import Image from 'next/image'
import { safeMediaPath } from '@/lib/urls'
import type { Product } from '@/lib/commerce-contracts'
export function ProductImage({ product }: { product: Product }) {
  const src = safeMediaPath(product.main_image)
  return src ? (
    <Image
      src={src}
      alt={product.title}
      width={640}
      height={480}
      sizes="(max-width: 700px) 100vw, 50vw"
      style={{ width: '100%', height: 'auto' }}
    />
  ) : (
    <span>تصویر محصول موجود نیست</span>
  )
}
export function ProductPrice({ product }: { product: Product }) {
  return (
    <p>
      {product.discounted_price ? <del>{product.price.toLocaleString('fa-IR')} </del> : null}{' '}
      {(product.discounted_price || product.price).toLocaleString('fa-IR')} تومان
    </p>
  )
}
