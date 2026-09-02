import React, { useContext, useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import Title from '../components/Title'
import PageLoader from '../components/PageLoader'
import OrderStatusTimeline from '../components/OrderStatusTimeline'
import OrderTracking from '../components/OrderTracking'
import { getThumbnail } from '../utils/imageUtils'
import { formatDate } from '../utils/formatDate'

/**
 * One order, with its package tracking. This is where the "Track your package"
 * button in the shipping email lands, so it has to survive being opened cold
 * in a new browser by someone who may or may not still be logged in.
 */
const OrderDetail = () => {
  const { t, i18n } = useTranslation('account')
  const { orderId } = useParams()
  const { pathname } = useLocation()
  const { backendUrl, token, authChecked, currency, navigate } = useContext(ShopContext)

  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading')   // 'loading' | 'ready' | 'notfound'

  useEffect(() => {
    // Wait for ShopContext to read localStorage. `token` is '' on the first
    // render even for a signed-in customer, so acting sooner would bounce
    // everyone arriving from the email straight to the login page.
    if (!authChecked) return

    if (!token) {
      // Strip the /:lang prefix — LocalizedLink/navigate re-add it, and the
      // redirect target is validated in Login.jsx before it is used.
      const target = '/' + pathname.split('/').slice(2).join('/')
      navigate(`/login?redirect=${encodeURIComponent(target)}`)
      return
    }

    let cancelled = false
    const load = async () => {
      setState('loading')
      try {
        const response = await axios.post(backendUrl + '/api/order/single',
          { orderId }, { headers: { token } })
        if (cancelled) return
        if (response.data.success) {
          setOrder(response.data.order)
          setState('ready')
        } else {
          // The API answers "Order not found" for someone else's order too, so
          // there is deliberately nothing more specific to show here.
          setState('notfound')
        }
      } catch (error) {
        console.log(error)
        if (!cancelled) setState('notfound')
      }
    }
    load()
    return () => { cancelled = true }
  }, [authChecked, token, orderId, backendUrl, pathname, navigate])

  if (!authChecked || state === 'loading') {
    return <PageLoader label={t('orders.detail.loading')} />
  }

  if (state === 'notfound' || !order) {
    return (
      <div className='border-t pt-16 py-16 text-center flex flex-col items-center gap-4'>
        <p className='text-stone'>{t('orders.detail.notFound')}</p>
        <Link to='/orders' className='bg-ink text-paper text-sm px-8 py-3'>
          {t('orders.detail.notFoundCta')}
        </Link>
      </div>
    )
  }

  return (
    <div className='border-t pt-16'>
      <Link to='/orders' className='text-sm text-stone hover:text-ink'>
        &larr; {t('orders.detail.back')}
      </Link>

      <div className='text-2xl mt-4'>
        <Title text1={t('orders.detail.heading.text1')} text2={t('orders.detail.heading.text2')} as='h1' />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm text-stone border-b pb-3 mt-6'>
        <span>{t('orders.orderNumber', { id: order._id.slice(-8).toUpperCase() })}</span>
        <span>{formatDate(order.date, i18n.language)}</span>
        <span>{t('orders.payment')} {order.paymentMethod}</span>
        <span className='font-medium text-ink'>{t('orders.total')} {currency}{order.amount}</span>
      </div>

      {/* items-start: without it the grid stretches both cards to equal height,
          which leaves a tall empty box next to the timeline when an order has
          no tracking yet. */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-start'>
        <OrderTracking order={order} />

        <div className='border border-line p-4 sm:p-6'>
          <h2 className='text-sm uppercase tracking-label text-stone mb-4'>
            {t('orders.detail.timelineHeading')}
          </h2>
          <OrderStatusTimeline
            status={order.status}
            history={order.statusHistory || []}
            orderDate={order.date}
            variant='detailed'
          />
        </div>
      </div>

      <h2 className='text-sm uppercase tracking-label text-stone mt-10 mb-4'>
        {t('orders.detail.itemsHeading')}
      </h2>
      <div className='flex flex-col gap-4 border-t pt-6'>
        {order.items.map((item, index) => (
          <div key={`${item._id}-${item.size}-${index}`} className='flex items-start gap-4 text-sm text-stone'>
            <img className='w-16 sm:w-20' src={getThumbnail(item.image[0])} alt='' loading='lazy' />
            <div>
              <p className='sm:text-base font-medium text-ink'>{item.name}</p>
              <div className='flex items-center gap-3 mt-1 text-base text-stone'>
                <p>{currency}{item.price}</p>
                <p>{t('orders.quantity')} {item.quantity}</p>
                <p>{t('orders.size')} {item.size}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {order.address && (
        <div className='mt-10'>
          <h2 className='text-sm uppercase tracking-label text-stone mb-3'>
            {t('orders.detail.shippingAddress')}
          </h2>
          <address className='not-italic text-sm text-stone leading-relaxed'>
            {order.address.firstName} {order.address.lastName}<br />
            {order.address.street}<br />
            {order.address.zipcode} {order.address.city}<br />
            {order.address.country}
          </address>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
