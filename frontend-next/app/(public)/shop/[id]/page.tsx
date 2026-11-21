import Link from 'next/link'
import { getProduct } from '@/lib/api/commerce'
import { headers } from 'next/headers'
import { safeMediaPath } from '@/lib/urls'
import { jsonLd, siteUrl, pageMetadata } from '@/lib/seo'
import { ProductImage, ProductPrice } from '@/components/commerce/product-display'
import OrderForm from '@/components/commerce/order-form'
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  return pageMetadata(product.title, `/shop/${id}`, product.description.slice(0, 160))
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getProduct((await params).id)
  const nonce = (await headers()).get('x-nonce') || undefined
  const image = safeMediaPath(product.main_image)
  return (
    <article className="pd-page pd-container">
      <Link href="/shop">برگشت به فروشگاه</Link>
      <div className="pd-card pd-grid">
        <div className="pd-image">
          <ProductImage product={product} />
        </div>
        <div className="pd-info">
          <h1>{product.title}</h1>
          <p>
            {product.category_name} · {product.code}
          </p>
          <ProductPrice product={product} />
          <p>{product.description}</p>
          <p>{product.stock ? `موجود (${product.stock})` : 'ناموجود'}</p>
          {product.stock > 0 && <OrderForm product={product} />}
        </div>
      </div>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            sku: product.code,
            ...(image ? { image: new URL(image, siteUrl).href } : {}),
            offers: {
              '@type': 'Offer',
              url: new URL(`/shop/${product.id}`, siteUrl).href,
              priceCurrency: 'IRR',
              price: (product.discounted_price || product.price) * 10,
              availability:
                product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />
    </article>
  )
}
