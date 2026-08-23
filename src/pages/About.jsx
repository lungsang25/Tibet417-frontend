import React from 'react'
import { useTranslation } from 'react-i18next'
import Title from '../components/Title'
import SEO from '../components/SEO'
// Displayed at max-w-[450px]; 480/960 covers 1x/2x at that display size
// without shipping the full-resolution source (was a 1.2MB PNG).
import about_img from '../assets/about_img.png?w=480;960&format=avif;webp;png&quality=75&as=picture'

/**
 * This page is one of Google's main sources for understanding what "Tibet417"
 * actually is — and, alongside the category pages, a prime sitelink candidate.
 *
 * It previously ran generic storefront-template copy ("born out of a passion for
 * innovation… from fashion and beauty to electronics and home essentials") that
 * never mentioned Tibet, the Himalayas or Switzerland. It described no business
 * in particular, which is part of why the brand token "tibet417" resolves to a
 * rug SKU rather than to this shop.
 *
 * The copy below is grounded only in what the GTC and manifest already state.
 * TODO (owner): add the real founding story — who started it, when, and the
 * sourcing relationships behind the collection. Specifics are what make an
 * About page carry entity weight; nothing here has been invented to fill space.
 */
const About = () => {
  const { t } = useTranslation('about')
  return (
    <div>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path='/about'
        breadcrumb={[{ name: 'Home', path: '/' }, { name: 'About' }]}
      />

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={t('heading.text1')} text2={t('heading.text2')} as='h1' />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <picture>
            {about_img.sources.avif && <source type='image/avif' srcSet={about_img.sources.avif} sizes='(min-width: 768px) 450px, 100vw' />}
            {about_img.sources.webp && <source type='image/webp' srcSet={about_img.sources.webp} sizes='(min-width: 768px) 450px, 100vw' />}
            <img className='w-full md:max-w-[450px]' src={about_img.img.src} alt={t('imgAlt')} loading='lazy' />
          </picture>
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>{t('intro1')}</p>
              <p>{t('intro2')}</p>
              <b className='text-gray-800'>{t('missionLabel')}</b>
              <p>{t('missionText')}</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={t('whyChoose.text1')} text2={t('whyChoose.text2')} as='h2' />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('cards.provenance.label')}</b>
            <p className=' text-gray-600'>{t('cards.provenance.text')}</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('cards.swissDelivery.label')}</b>
            <p className=' text-gray-600'>{t('cards.swissDelivery.text')}</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('cards.withdrawal.label')}</b>
            <p className=' text-gray-600'>{t('cards.withdrawal.text')}</p>
          </div>
      </div>

    </div>
  )
}

export default About
