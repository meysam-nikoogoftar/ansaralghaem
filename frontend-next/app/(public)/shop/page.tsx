import Link from 'next/link'
import { getProducts, getProductCategories } from '@/lib/api/commerce'
import { ProductImage, ProductPrice } from '@/components/commerce/product-display'
import { pageMetadata } from '@/lib/seo'
export const metadata = pageMetadata('فروشگاه', '/shop', 'فروشگاه صنایع دستی هیئت انصار القائم')
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const [products, categories, query] = await Promise.all([
    getProducts(),
    getProductCategories(),
    searchParams,
  ])
  const category = /^\d+$/.test(query.category || '') ? query.category : ''
  const term = typeof query.q === 'string' ? query.q.slice(0, 100).trim() : ''
  const visible = products.filter(
    (p) => (!category || String(p.category) === category) && (!term || p.title.includes(term)),
  )
  return (
    <section className="container sp-page">
      <h1>فروشگاه</h1>
      <form action="/shop">
        <label>
          جست‌وجوی محصول
          <input className="pd-input" name="q" defaultValue={term} maxLength={100} />
        </label>
        <label>
          دسته‌بندی
          <select className="pd-input" name="category" defaultValue={category}>
            <option value="">همه</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary">جست‌وجو</button>
      </form>
      <div className="sp-grid">
        {visible.map((product) => (
          <Link className="sp-card" key={product.id} href={`/shop/${product.id}`}>
            <ProductImage product={product} />
            <h2>{product.title}</h2>
            <ProductPrice product={product} />
            <p>{product.stock > 0 ? 'موجود' : 'ناموجود'}</p>
          </Link>
        ))}
      </div>
      {!visible.length && <p role="status">محصولی یافت نشد</p>}
    </section>
  )
}
