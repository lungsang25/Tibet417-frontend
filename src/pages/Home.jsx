import React from 'react'
import { useTranslation } from 'react-i18next'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import SEO from '../components/SEO'
import {
  siteName,
  legalName,
  defaultDescription,
  currencyCode,
  logoUrl,
  ogImage,
  business,
  postalAddressSchema,
  absoluteUrl,
} from '../config/site'
import { ORGANIZATION_ID } from '../config/schema'

const Home = () => {
  const { t } = useTranslation('home')
  const address = postalAddressSchema()

  // The Store node describes the shop itself and hangs off the site-wide
  // Organization by @id rather than restating it.
  //
  // It previously carried the literal string "+1-XXX-XXX-XXXX" and
  // addressCountry "US" — invalid markup describing the wrong country for a
  // business that sells exclusively into Switzerland. Fields that aren't known
  // are omitted now; see the TODOs in src/config/site.js.
  const storeNode = {
    '@type': 'Store',
    '@id': `${absoluteUrl('/')}#store`,
    name: siteName,
    legalName,
    description: defaultDescription,
    url: absoluteUrl('/'),
    logo: logoUrl,
    image: ogImage,
    parentOrganization: { '@id': ORGANIZATION_ID },
    currenciesAccepted: currencyCode,
    priceRange: 'CHF',
    areaServed: { '@type': 'Country', name: 'Switzerland' },
    email: business.email,
    ...(business.telephone ? { telephone: business.telephone } : {}),
    ...(address ? { address } : {}),
  }

  return (
    <div>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path='/'
        breadcrumb={[{ name: 'Home' }]}
        extraSchemaNodes={[storeNode]}
      />
      {/* The homepage's one stable heading. The hero's own headline rotates on a
          timer, so it cannot serve as the h1 — and a carousel caption would not
          tell a crawler what this site is in any case. Visually hidden rather
          than shown so the hero design is untouched; the text describes exactly
          what the page is, and screen readers announce it. */}
      <h1 className='sr-only'>{t('h1')}</h1>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
    </div>
  )
}

export default Home
