import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

/**
 * `discountAmount` is an OPTIONAL prop, undefined/0 by default — Cart.jsx
 * renders this with no redemption context at all, so the discount row and
 * the adjusted total only appear when PlaceOrder.jsx passes a real value.
 * It is purely a checkout-time PREVIEW: the actual discount applied is
 * always recomputed server-side (bonusService.computeRedemption) from the
 * customer's real balance, never trusted from here.
 */
const CartTotal = ({ discountAmount = 0 }) => {

    const { t } = useTranslation('cart');
    const {currency,delivery_fee,getCartAmount} = useContext(ShopContext);
    const subtotal = getCartAmount()
    const grossTotal = subtotal === 0 ? 0 : subtotal + delivery_fee
    const netTotal = Math.max(0, grossTotal - discountAmount)

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={t('total.heading.text1')} text2={t('total.heading.text2')} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>{t('total.subtotal')}</p>
                <p>{currency} {subtotal}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>{t('total.shippingFee')}</p>
                <p>{currency} {delivery_fee}.00</p>
            </div>
            {discountAmount > 0 && (
                <>
                    <hr />
                    <div className='flex justify-between text-green-700'>
                        <p>{t('total.pointsDiscount')}</p>
                        <p>−{currency} {discountAmount.toFixed(2)}</p>
                    </div>
                </>
            )}
            <hr />
            <div className='flex justify-between'>
                <b>{t('total.total')}</b>
                <b>{currency} {netTotal.toFixed(2)}</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal
