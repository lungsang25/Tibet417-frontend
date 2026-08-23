import React, { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import PageLoader from '../components/PageLoader'

const Verify = () => {

    const { t } = useTranslation('account')
    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
    const [searchParams] = useSearchParams()

    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async () => {
        try {

            const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })

            if (response.data.success) {
                setCartItems({})
                navigate('/orders')
                toast.success(t('verify.paymentCompleted'))
            } else {
                navigate('/cart')
                toast.error(response.data.message || t('verify.paymentVerificationFailed'))
            }

        } catch (error) {
            console.log(error)
            navigate('/cart')
            toast.error(t('verify.paymentVerificationFailed'))
        }
    }

    useEffect(() => {
        if (token && orderId) {
            verifyPayment()
        } else if (!token) {
            navigate('/login')
        } else {
            navigate('/cart')
        }
    }, [token, orderId, success])

    return <PageLoader title={t('verify.verifying')} label={t('verify.pleaseWait')} />
}

export default Verify
