import AppLink from '@/components/navigation/app-link'
import { ordersSchema } from '@/lib/dashboard/contracts'
import { privateRequest, requireServerUser } from '@/lib/server/session'

export const metadata = { title: 'سفارش‌های من' }

const statuses: Record<string, string> = {
  registered: 'ثبت شده',
  paid: 'پرداخت شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
}

export default async function OrdersPage() {
  await requireServerUser('/dashboard/orders')
  const orders = await privateRequest('/shop/orders/my/', ordersSchema.parse).catch(() => null)
  return (
    <section className="db-page">
      <h1 className="section-title">سفارش‌های من</h1>
      {orders === null && (
        <p role="status" className="request-feedback">
          دریافت سفارش‌ها انجام نشد. <a href="/dashboard/orders">تلاش مجدد</a>
        </p>
      )}
      {orders?.length === 0 && (
        <p>
          هنوز سفارشی ثبت نشده است. <AppLink href="/shop">مشاهده فروشگاه</AppLink>
        </p>
      )}
      {orders?.map((order) => (
        <article className="db-registration" key={order.id}>
          <h2>{order.product_title}</h2>
          <dl className="db-registration-meta">
            <div>
              <dt>شماره سفارش</dt>
              <dd>
                <bdi>{order.order_number}</bdi>
              </dd>
            </div>
            <div>
              <dt>وضعیت</dt>
              <dd>{statuses[order.status] || order.status}</dd>
            </div>
            <div>
              <dt>تعداد</dt>
              <dd>{order.quantity.toLocaleString('fa-IR')}</dd>
            </div>
            <div>
              <dt>مبلغ</dt>
              <dd>{order.final_price.toLocaleString('fa-IR')} تومان</dd>
            </div>
            <div>
              <dt>آدرس</dt>
              <dd>{order.address}</dd>
            </div>
            <div>
              <dt>کد پستی</dt>
              <dd>
                <bdi>{order.postal_code}</bdi>
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </section>
  )
}
