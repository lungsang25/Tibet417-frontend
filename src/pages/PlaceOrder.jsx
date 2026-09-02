import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import Modal from '../components/Modal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const { t, i18n } = useTranslation('checkout')
    const [method, setMethod] = useState('cod');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [qrModal, setQrModal] = useState(null);
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, currency } = useContext(ShopContext);

    // ── Redeemable Bonus Program: points redemption ─────────────────────────
    // A checkout-time PREVIEW only — clamped here purely for UX, since the
    // server (bonusService.computeRedemption) always recomputes and enforces
    // the real cap from the customer's actual balance at order-placement time.
    const [redemption, setRedemption] = useState(null) // { redeemRatePerCurrencyUnit, maxRedemptionPercent, minRedeemPoints }
    const [pointsBalance, setPointsBalance] = useState(0)
    const [redeemInput, setRedeemInput] = useState('')
    const [appliedPoints, setAppliedPoints] = useState(0)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        const loadRedemption = async () => {
            try {
                const metaRes = await axios.get(backendUrl + '/api/bonus/meta')
                if (cancelled || !metaRes.data?.success || !metaRes.data.redemption?.active) return
                const balanceRes = await axios.post(backendUrl + '/api/bonus/balance', {}, { headers: { token } })
                if (cancelled) return
                setRedemption(metaRes.data.redemption)
                if (balanceRes.data.success) setPointsBalance(balanceRes.data.confirmed)
            } catch (error) {
                console.log(error)
            }
        }
        loadRedemption()
        return () => { cancelled = true }
    }, [token])

    const orderTotal = getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee
    const maxRedeemable = redemption
        ? Math.min(pointsBalance, Math.floor(orderTotal * (redemption.maxRedemptionPercent / 100) * redemption.redeemRatePerCurrencyUnit))
        : 0
    const discountAmount = redemption && appliedPoints > 0
        ? Math.round((appliedPoints / redemption.redeemRatePerCurrencyUnit) * 100) / 100
        : 0

    const applyPoints = () => {
        const requested = Math.floor(Number(redeemInput) || 0)
        const clamped = Math.max(0, Math.min(requested, maxRedeemable))
        if (clamped < redemption.minRedeemPoints) {
            toast.error(t('bonusPoints.minNote', { min: redemption.minRedeemPoints }))
            return
        }
        setAppliedPoints(clamped)
    }

    const removePoints = () => {
        setAppliedPoints(0)
        setRedeemInput('')
    }

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const handleTwintPayment = (paymentData) => {
        // Real Payrexx integration - redirect to payment URL
        if (paymentData.paymentUrl) {
            // Redirect to Payrexx payment page
            window.location.href = paymentData.paymentUrl;
        } else if (paymentData.qrCodeUrl) {
            // Show QR code modal for mobile payments
            setQrModal(paymentData);
        } else {
            toast.error(t('toasts.paymentUrlUnavailable'));
        }
    }

    const verifyTwintPayment = async (orderId, paymentStatus) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/order/verifyTwint', {
                orderId: orderId,
                success: paymentStatus
            }, {headers: {token}})

            if (data.success) {
                setCartItems({})
                navigate('/orders')
                toast.success(t('toasts.twintSuccess'))
            } else {
                toast.error(data.message || t('toasts.paymentVerificationFailed'))
            }
        } catch (error) {
            console.log(error)
            toast.error('Payment verification failed')
        }
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {

            let orderItems = []

            for(const items in cartItems){
                for(const item in cartItems[items]){
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee,
                // Which language to write the shipping emails in. Captured here
                // because the customer's browser language when the parcel ships
                // is unknowable — that email is sent from an admin click days
                // later. Assembled once, so this covers COD, Stripe and Twint.
                locale: i18n.language,
                // Intent only — how many points the customer would like to
                // apply. The server always recomputes and enforces the real
                // discount from the customer's actual balance; this number is
                // never trusted as-is.
                redeemPoints: appliedPoints,
            }

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                    if (responseStripe.data.success) {
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'twint':
                    const responseTwint = await axios.post(backendUrl + '/api/order/twint', orderData, {headers:{token}})
                    if (responseTwint.data.success) {
                        handleTwintPayment(responseTwint.data.payment)
                    } else {
                        toast.error(responseTwint.data.message)
                    }
                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={t('deliveryInfo.text1')} text2={t('deliveryInfo.text2')} as='h1' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} autoComplete='given-name' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.firstName')} />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} autoComplete='family-name' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.lastName')} />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} autoComplete='email' className='border border-line rounded py-1.5 px-3.5 w-full' type="email" placeholder={t('placeholders.email')} />
                <input required onChange={onChangeHandler} name='street' value={formData.street} autoComplete='street-address' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.street')} />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} autoComplete='address-level2' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.city')} />
                    <input onChange={onChangeHandler} name='state' value={formData.state} autoComplete='address-level1' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.state')} />
                </div>
                <div className='flex gap-3'>
                    {/* type=number previously hid a leading zero and added spinner
                        arrows to what is really a short text code, not a quantity. */}
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} autoComplete='postal-code' inputMode='numeric' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.zipcode')} />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} autoComplete='country-name' className='border border-line rounded py-1.5 px-3.5 w-full' type="text" placeholder={t('placeholders.country')} />
                </div>
                {/* type=tel (not number) so a leading + and spaces are valid input,
                    and mobile keyboards offer the right symbols instead of a plain
                    numeric pad with no way to type +41. */}
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} autoComplete='tel' className='border border-line rounded py-1.5 px-3.5 w-full' type="tel" placeholder={t('placeholders.phone')} />
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal discountAmount={discountAmount} />
                </div>

                {redemption && pointsBalance > 0 && (
                    <div className='mt-6 min-w-80 border border-line rounded p-4'>
                        <p className='text-sm font-medium mb-1'>{t('bonusPoints.heading')}</p>
                        <p className='text-xs text-stone mb-3'>{t('bonusPoints.available', { count: pointsBalance })}</p>

                        {appliedPoints > 0 ? (
                            <div className='flex items-center justify-between gap-3 text-sm'>
                                <span>{t('bonusPoints.applied', { points: appliedPoints, amount: `${currency} ${discountAmount.toFixed(2)}` })}</span>
                                <button type='button' onClick={removePoints} className='text-xs underline text-stone bg-transparent border-0 cursor-pointer whitespace-nowrap'>
                                    {t('bonusPoints.remove')}
                                </button>
                            </div>
                        ) : (
                            <div className='flex gap-2'>
                                <input
                                    type='number'
                                    min={0}
                                    max={maxRedeemable}
                                    value={redeemInput}
                                    onChange={(e) => setRedeemInput(e.target.value)}
                                    placeholder={t('bonusPoints.applyLabel')}
                                    className='border border-line rounded px-3 py-1.5 text-sm w-full'
                                />
                                <button type='button' onClick={applyPoints} className='bg-ink text-paper px-4 py-1.5 text-sm whitespace-nowrap'>
                                    {t('bonusPoints.apply')}
                                </button>
                            </div>
                        )}

                        <p className='text-xs text-stone mt-2'>
                            {t('bonusPoints.maxNote', { percent: redemption.maxRedemptionPercent })}{' '}
                            {t('bonusPoints.minNote', { min: redemption.minRedeemPoints })}
                        </p>
                    </div>
                )}

                <div className='mt-12'>
                    <Title text1={t('paymentMethod.text1')} text2={t('paymentMethod.text2')} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <fieldset className='flex gap-3 flex-col lg:flex-row'>
                        <legend className='sr-only'>{t('paymentMethod.text1')} {t('paymentMethod.text2')}</legend>
                        <label className='flex items-center gap-3 border p-2 px-3 cursor-pointer has-[:checked]:border-ink'>
                            <input type='radio' name='paymentMethod' value='stripe' checked={method === 'stripe'} onChange={() => setMethod('stripe')} className='sr-only peer' />
                            <span className='min-w-3.5 h-3.5 border rounded-full peer-checked:bg-green-400' aria-hidden='true'></span>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
                        </label>
                        <label className='flex items-center gap-3 border p-2 px-3 cursor-pointer has-[:checked]:border-ink'>
                            <input type='radio' name='paymentMethod' value='twint' checked={method === 'twint'} onChange={() => setMethod('twint')} className='sr-only peer' />
                            <span className='min-w-3.5 h-3.5 border rounded-full peer-checked:bg-green-400' aria-hidden='true'></span>
                            <img className='h-5 mx-4' src={assets.twint_logo} alt="Twint" />
                        </label>
                        <label className='flex items-center gap-3 border p-2 px-3 cursor-pointer has-[:checked]:border-ink'>
                            <input type='radio' name='paymentMethod' value='cod' checked={method === 'cod'} onChange={() => setMethod('cod')} className='sr-only peer' />
                            <span className='min-w-3.5 h-3.5 border rounded-full peer-checked:bg-green-400' aria-hidden='true'></span>
                            <span className='text-stone text-sm font-medium mx-4'>{t('cod')}</span>
                        </label>
                    </fieldset>

                    <label className='flex items-start gap-3 mt-8 text-sm text-stone cursor-pointer'>
                        <input required type='checkbox' className='mt-0.5' checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                        <span>{t('termsPrefix')}<Link to='/terms' target='_blank' className='underline text-ink'>{t('termsLink')}</Link>{t('termsSuffix')}</span>
                    </label>

                    <div className='w-full text-end mt-6'>
                        <button type='submit' className='bg-ink text-paper px-16 py-3 text-sm'>{t('placeOrderButton')}</button>
                    </div>

                </div>

            </div>

            <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} titleId='twint-modal-title' className='max-w-md w-full mx-4 p-6'>
                <h3 id='twint-modal-title' className='text-lg font-bold mb-4 text-center'>{t('twintModal.title')}</h3>
                <div className='text-center mb-4'>
                    <img src={qrModal?.qrCodeUrl} alt={t('twintModal.title')} className='w-48 h-48 mx-auto mb-4 border' />
                    <p className='text-sm text-stone mb-2'>{t('twintModal.scanText')}</p>
                    <p className='text-lg font-semibold'>CHF {qrModal?.amount?.toFixed(2)}</p>
                </div>
                <div className='flex gap-2'>
                    <a href={qrModal?.paymentUrl} className='flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center'>
                        {t('twintModal.openPaymentPage')}
                    </a>
                    <button type='button' onClick={() => setQrModal(null)} className='flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600'>
                        {t('twintModal.cancel')}
                    </button>
                </div>
            </Modal>
        </form>
    )
}

export default PlaceOrder
