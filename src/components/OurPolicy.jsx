import React from 'react'
import { useTranslation } from 'react-i18next'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  const { t } = useTranslation('home')
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-stone'>

      <div>
        <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" />
        <p className='font-semibold text-ink'>{t('policy.exchange.heading')}</p>
        <p className='text-stone'>{t('policy.exchange.text')}</p>
      </div>
      <div>
        <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
        <p className='font-semibold text-ink'>{t('policy.returns.heading')}</p>
        <p className='text-stone'>{t('policy.returns.text')}</p>
      </div>
      <div>
        <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" />
        <p className='font-semibold text-ink'>{t('policy.support.heading')}</p>
        <p className='text-stone'>{t('policy.support.text')}</p>
      </div>

    </div>
  )
}

export default OurPolicy
