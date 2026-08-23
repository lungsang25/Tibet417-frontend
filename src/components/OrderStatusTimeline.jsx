import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Mirrors the literal backend status enum (orderModel.js default +
 * tibet417-admin's status <select>): 'Order Placed' -> 'Packing' ->
 * 'Shipped' -> 'Out for delivery' -> 'Delivered'. If a status doesn't match
 * any known step (e.g. admin adds a new one this frontend hasn't been
 * updated for), we print the raw string rather than guess a position.
 */
const STEPS = [
  { key: 'Order Placed', labelKey: 'orderStatus.orderPlaced' },
  { key: 'Packing', labelKey: 'orderStatus.packing' },
  { key: 'Shipped', labelKey: 'orderStatus.shipped' },
  { key: 'Out for delivery', labelKey: 'orderStatus.outForDelivery' },
  { key: 'Delivered', labelKey: 'orderStatus.delivered' },
]

const OrderStatusTimeline = ({ status }) => {
  const { t } = useTranslation('common')
  const currentIndex = STEPS.findIndex((step) => step.key === status)

  if (currentIndex === -1) {
    return (
      <div className='flex items-center gap-2 text-sm text-ink'>
        <span className='w-2 h-2 rounded-full bg-ink' aria-hidden='true' />
        {status}
      </div>
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
