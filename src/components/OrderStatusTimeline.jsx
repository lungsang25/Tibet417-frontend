import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '../utils/formatDate'

/**
 * Mirrors the backend status enum (tibet417-backend/constants/orderConstants.js
 * -> ORDER_STATUSES, which is also the model's enum and what the admin panel
 * fetches from GET /api/order/meta): 'Order Placed' -> 'Packing' -> 'Shipped'
 * -> 'Out for delivery' -> 'Delivered'.
 *
 * Kept as a local literal rather than fetched, because each step needs an i18n
 * key that must exist at build time — scripts/check-i18n-keys.mjs fails the
 * build otherwise. A server-driven list could not invent translations; it
 * would only turn a build error into an English label on the French site.
 *
 * If a status doesn't match any known step we print the raw string rather than
 * guess a position.
 */
const STEPS = [
  { key: 'Order Placed', labelKey: 'orderStatus.orderPlaced' },
  { key: 'Packing', labelKey: 'orderStatus.packing' },
  { key: 'Shipped', labelKey: 'orderStatus.shipped' },
  { key: 'Out for delivery', labelKey: 'orderStatus.outForDelivery' },
  { key: 'Delivered', labelKey: 'orderStatus.delivered' },
]

/**
 * @param status   current order status
 * @param history  statusHistory entries; empty for orders placed before tracking existed
 * @param orderDate order.date, the one timestamp every order has
 * @param variant  'inline' — the horizontal dots used in the order list
 *                 'detailed' — a vertical, dated timeline for the order page
 */
const OrderStatusTimeline = ({ status, history = [], orderDate, variant = 'inline' }) => {
  const { t, i18n } = useTranslation('common')
  const currentIndex = STEPS.findIndex((step) => step.key === status)

  if (currentIndex === -1) {
    return (
      <div className='flex items-center gap-2 text-sm text-ink'>
        <span className='w-2 h-2 rounded-full bg-ink' aria-hidden='true' />
        {status}
      </div>
    )
  }

  /**
   * First occurrence wins: an admin bouncing a status back and forth to undo a
   * misclick should not move the date a step actually first happened. Orders
   * predating this feature have no history at all, but the first step's time
   * is still knowable from `date`.
   */
  const timeAt = (key, index) => {
    const entry = history.find((h) => h.status === key)
    if (entry) return entry.at
    return index === 0 ? orderDate : null
  }

  if (variant === 'detailed') {
    return (
      <ol className='flex flex-col gap-0'>
        {STEPS.map((step, index) => {
          const isComplete = index <= currentIndex
          const at = isComplete ? timeAt(step.key, index) : null
          return (
            <li key={step.key} className='flex gap-3'>
              <div className='flex flex-col items-center'>
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${isComplete ? 'bg-ink' : 'bg-line'}`}
                  aria-hidden='true'
                />
                {index < STEPS.length - 1 && (
                  <span className={`w-px flex-1 min-h-[28px] ${index < currentIndex ? 'bg-ink' : 'bg-line'}`} aria-hidden='true' />
                )}
              </div>
              <div className='pb-4'>
                <p className={`text-sm ${isComplete ? 'text-ink' : 'text-stone'}`}>{t(step.labelKey)}</p>
                {/* Omitted rather than blanked when unknown — a pre-tracking
                    order simply shows fewer dates, not empty rows. */}
                {at && <p className='text-xs text-stone mt-0.5'>{formatDateTime(at, i18n.language)}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className='flex flex-wrap items-center gap-x-2 gap-y-3 text-xs'>
      {STEPS.map((step, index) => {
        const isComplete = index <= currentIndex
        return (
          <li key={step.key} className='flex items-center gap-2'>
            <span
              className={`w-2 h-2 rounded-full ${isComplete ? 'bg-ink' : 'bg-line'}`}
              aria-hidden='true'
            />
            <span className={isComplete ? 'text-ink' : 'text-stone'}>
              {t(step.labelKey)}
            </span>
            {index < STEPS.length - 1 && (
              <span className={`w-6 h-px ${isComplete ? 'bg-ink' : 'bg-line'}`} aria-hidden='true' />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default OrderStatusTimeline
