import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { formatDate } from '../utils/formatDate'

const SHIPPED_OR_LATER = ['Shipped', 'Out for delivery', 'Delivered']

/**
 * The package panel on the order page.
 *
 * Three states, because "no tracking number" means different things before and
 * after a parcel leaves: waiting for one, versus an order that shipped without
 * one (the 'Other' carrier, or an order placed before tracking existed).
 */
const OrderTracking = ({ order }) => {
  const { t, i18n } = useTranslation('account')
  const [copied, setCopied] = useState(false)

  const tracking = order.tracking || {}
  const hasTracking = Boolean(tracking.number)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tracking.number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Insecure context, or an older Safari. The number is selectable on
      // screen, so this is a lost affordance rather than a lost capability.
      toast.error(t('orders.tracking.copyFailed'))
    }
  }

  if (!hasTracking) {
    const shipped = SHIPPED_OR_LATER.includes(order.status)
    return (
      <div className='border border-line p-4 sm:p-6'>
        <h2 className='text-sm uppercase tracking-label text-stone mb-3'>{t('orders.tracking.heading')}</h2>
        <p className='text-sm text-stone'>
          {shipped ? t('orders.tracking.unavailable') : t('orders.tracking.pending')}
        </p>
      </div>
    )
  }

  return (
    <div className='border border-line p-4 sm:p-6'>
      <h2 className='text-sm uppercase tracking-label text-stone mb-4'>{t('orders.tracking.heading')}</h2>

      <dl className='flex flex-col gap-3 text-sm'>
        <div className='flex flex-wrap items-baseline gap-x-3'>
          <dt className='text-stone'>{t('orders.tracking.carrier')}</dt>
          <dd className='text-ink font-medium'>{tracking.carrierName}</dd>
        </div>

        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          <dt className='text-stone'>{t('orders.tracking.number')}</dt>
          <dd className='text-ink font-mono break-all'>{tracking.number}</dd>
          <button
            type='button'
            onClick={copy}
            aria-label={t('orders.tracking.copyAria')}
            className='text-xs border border-line px-2 py-1 hover:border-ink transition-colors'
          >
            {copied ? t('orders.tracking.copied') : t('orders.tracking.copy')}
          </button>
          <span className='sr-only' aria-live='polite'>
            {copied ? t('orders.tracking.copied') : ''}
          </span>
        </div>

        {tracking.estimatedDelivery && (
          <div className='flex flex-wrap items-baseline gap-x-3'>
            <dt className='text-stone'>{t('orders.tracking.estimatedDelivery')}</dt>
            <dd className='text-ink'>{formatDate(tracking.estimatedDelivery, i18n.language)}</dd>
          </div>
        )}

        {tracking.shippedAt && (
          <div className='text-stone text-xs'>
            {t('orders.tracking.shippedOn', { date: formatDate(tracking.shippedAt, i18n.language) })}
          </div>
        )}
        {tracking.deliveredAt && (
          <div className='text-stone text-xs'>
            {t('orders.tracking.deliveredOn', { date: formatDate(tracking.deliveredAt, i18n.language) })}
          </div>
        )}
      </dl>

      {tracking.note && <p className='mt-4 text-sm text-ink'>{tracking.note}</p>}

      {tracking.url ? (
        <a
          href={tracking.url}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-block mt-5 bg-ink text-paper text-sm px-6 py-3'
        >
          {t('orders.tracking.trackOn', { carrier: tracking.carrierName })}
        </a>
      ) : (
        // The 'Other' carrier has no public tracking page — say so rather than
        // rendering a button that goes nowhere.
        <p className='mt-5 text-xs text-stone'>{t('orders.tracking.noLink')}</p>
      )}
    </div>
  )
}

export default OrderTracking
