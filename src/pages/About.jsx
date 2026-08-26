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

      <p className='text-center italic font-display text-lg text-gray-700 max-w-2xl mx-auto mt-4'>{t('tagline')}</p>

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
          <Title text1={t('promise.text1')} text2={t('promise.text2')} as='h2' />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-16'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('promiseCards.craftsmanship.label')}</b>
            <p className=' text-gray-600'>{t('promiseCards.craftsmanship.text')}</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('promiseCards.accessibility.label')}</b>
            <p className=' text-gray-600'>{t('promiseCards.accessibility.text')}</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('promiseCards.journey.label')}</b>
            <p className=' text-gray-600'>{t('promiseCards.journey.text')}</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={t('swiss.text1')} text2={t('swiss.text2')} as='h2' />
      </div>

      <p className='text-gray-600 max-w-3xl mb-8'>{t('swissIntro')}</p>

      <div className='flex flex-col md:flex-row text-sm mb-16'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('swissCards.pricing.label')}</b>
            <p className=' text-gray-600'>{t('swissCards.pricing.text')}</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>{t('swissCards.delivery.label')}</b>
            <p className=' text-gray-600'>{t('swissCards.delivery.text')}</p>
          </div>
      </div>

      <p className='text-center italic text-gray-600 max-w-2xl mx-auto mb-20'>{t('closing')}</p>

    </div>
  )
}

export default About
