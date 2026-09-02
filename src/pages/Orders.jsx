import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { getThumbnail } from '../utils/imageUtils';
import PageLoader from '../components/PageLoader';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation';
import { formatDate } from '../utils/formatDate';

const Orders = () => {

  const { t, i18n } = useTranslation('account')
  const { backendUrl, token , currency} = useContext(ShopContext);

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrderData = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        // Newest first — the API returns orders in creation order.
        setOrders([...response.data.orders].reverse())
      } else {
        toast.error(response.data.message || t('orders.loadFailed'))
      }
    } catch (error) {
      console.log(error)
      toast.error(t('orders.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    loadOrderData()
  },[token])

  if (loading) {
    return <PageLoader label={t('orders.loading')} />
  }

  return (
    <div className='border-t pt-16'>

        <div className='text-2xl'>
            <Title text1={t('orders.heading.text1')} text2={t('orders.heading.text2')} as='h1'/>
        </div>

        {orders.length === 0 ? (
          <div className='py-16 text-center flex flex-col items-center gap-4'>
            <p className='text-stone'>{t('orders.empty.text')}</p>
            <Link to='/collection' className='bg-ink text-paper text-sm px-8 py-3'>{t('orders.empty.cta')}</Link>
          </div>
        ) : (
        <div className='flex flex-col gap-8 mt-6'>
            {
              orders.map((order) => (
                <div key={order._id} className='border p-4 sm:p-6 flex flex-col gap-4'>
                  <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-sm text-stone border-b pb-3'>
                    <span>{t('orders.orderNumber', { id: order._id.slice(-8).toUpperCase() })}</span>
                    <span>{formatDate(order.date, i18n.language)}</span>
                    <span>{t('orders.payment')} {order.paymentMethod}</span>
                    <span className='font-medium text-ink'>{t('orders.total')} {currency}{order.amount}</span>
                  </div>

                  <div className='flex flex-col gap-4'>
                    {order.items.map((item, index) => (
                      <div key={`${item._id}-${item.size}-${index}`} className='flex items-start gap-4 text-sm text-stone'>
                        <img className='w-16 sm:w-20' src={getThumbnail(item.image[0])} alt="" loading='lazy' />
                        <div>
                          <p className='sm:text-base font-medium'>{item.name}</p>
                          <div className='flex items-center gap-3 mt-1 text-base text-stone'>
                            <p>{currency}{item.price}</p>
                            <p>{t('orders.quantity')} {item.quantity}</p>
                            <p>{t('orders.size')} {item.size}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='flex flex-wrap items-center justify-between gap-4 border-t pt-4'>
                    <div className='flex flex-col gap-2'>
                      <OrderStatusTimeline status={order.status} />
                      {order.tracking?.number && (
                        <p className='text-xs text-stone'>
                          {order.tracking.carrierName} · <span className='font-mono'>{order.tracking.number}</span>
                        </p>
                      )}
                    </div>
                    {/* Was onClick={loadOrderData} — a "Track Order" button that
                        only refetched the same list. It now goes to the order's
                        own page, which is also where the shipping email lands. */}
                    <Link to={`/orders/${order._id}`} className='border px-4 py-2 text-sm font-medium rounded-sm shrink-0'>{t('orders.trackOrder')}</Link>
                  </div>
                </div>
              ))
            }
        </div>
        )}
    </div>
  )
}

export default Orders
