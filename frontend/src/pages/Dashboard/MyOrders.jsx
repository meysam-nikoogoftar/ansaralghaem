import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import useLoadFeedback from '../../hooks/useLoadFeedback'
import LoadFeedback from '../../components/LoadFeedback'

const statuses = { registered: 'ثبت شده', paid: 'پرداخت شده', shipped: 'ارسال شده', delivered: 'تحویل داده شده' }
export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const { observeLoad, loadState, retryLoad } = useLoadFeedback()
  useEffect(() => {
    observeLoad(() => api.get('/shop/orders/my/').then(response => setOrders(response.data)), 'orders')
  }, [observeLoad])
  return <div>
    <h1 className="section-title">سفارش‌های من</h1>
    <LoadFeedback state={loadState} onRetry={retryLoad} />
    {!loadState.pending && !loadState.errors.length && !orders.length && <p>هنوز سفارشی ثبت نشده است. <Link to="/shop">مشاهده فروشگاه</Link></p>}
    {orders.map(order => <article key={order.id} className="request-feedback" style={{ marginBlock: 16 }}>
      <h2>{order.product_title}</h2>
      <p>شماره سفارش: <bdi>{order.order_number}</bdi></p>
      <p>وضعیت: {statuses[order.status] || order.status}</p>
      <p>تعداد: {Number(order.quantity).toLocaleString('fa-IR')}</p>
      <p>مبلغ: {Number(order.final_price).toLocaleString('fa-IR')} تومان</p>
      <p>آدرس: {order.address}</p>
      <p>کد پستی: <bdi>{order.postal_code}</bdi></p>
    </article>)}
  </div>
}
