import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import { assets } from '../assets/assets'
import { siteName, legalName, business } from '../config/site'

// The footer is the site's most repeated internal-link block, so it is a large
// part of how Google models the hierarchy that sitelinks are drawn from. It now
// links the category pages rather than listing dead <li> text.
const Footer = () => {
  const { t } = useTranslation('footer')
  const year = new Date().getFullYear()

  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-32' alt={`${siteName} logo`} />
            <p className='w-full md:w-2/3 text-stone'>
            {t('description')}
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>{t('shop.heading')}</p>
            <ul className='flex flex-col gap-1 text-stone'>
                <li><Link to='/collection'>{t('shop.allProducts')}</Link></li>
                <li><Link to='/collection/men'>{t('shop.men')}</Link></li>
                <li><Link to='/collection/women'>{t('shop.women')}</Link></li>
                <li><Link to='/collection/kids'>{t('shop.kids')}</Link></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>{t('company.heading')}</p>
            <ul className='flex flex-col gap-1 text-stone'>
                <li><Link to='/'>{t('company.home')}</Link></li>
                <li><Link to='/about'>{t('company.aboutUs')}</Link></li>
                <li><Link to='/contact'>{t('company.contact')}</Link></li>
                <li><Link to='/terms'>{t('company.terms')}</Link></li>
                <li><Link to='/impressum'>{t('company.impressum')}</Link></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>{t('getInTouch.heading')}</p>
            <ul className='flex flex-col gap-1 text-stone'>
                {business.telephone && <li>{business.telephone}</li>}
                <li><a href={`mailto:${business.email}`}>{business.email}</a></li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>{t('copyright', { year, legalName })}</p>
        </div>

    </div>
  )
}

export default Footer
