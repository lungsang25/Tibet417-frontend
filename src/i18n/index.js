import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import { SUPPORTED_LANGS, DEFAULT_LANG } from '../config/site'

import enCommon from './locales/en/common.json'
import enFooter from './locales/en/footer.json'
import enHome from './locales/en/home.json'
import enAbout from './locales/en/about.json'
import enContact from './locales/en/contact.json'
import enCollection from './locales/en/collection.json'
import enProduct from './locales/en/product.json'
import enCart from './locales/en/cart.json'
import enCheckout from './locales/en/checkout.json'
import enAccount from './locales/en/account.json'
import enTerms from './locales/en/terms.json'
import enImpressum from './locales/en/impressum.json'
import enSizeRecommender from './locales/en/sizeRecommender.json'

import deCommon from './locales/de/common.json'
import deFooter from './locales/de/footer.json'
import deHome from './locales/de/home.json'
import deAbout from './locales/de/about.json'
import deContact from './locales/de/contact.json'
import deCollection from './locales/de/collection.json'
import deProduct from './locales/de/product.json'
import deCart from './locales/de/cart.json'
import deCheckout from './locales/de/checkout.json'
import deAccount from './locales/de/account.json'
import deTerms from './locales/de/terms.json'
import deImpressum from './locales/de/impressum.json'
import deSizeRecommender from './locales/de/sizeRecommender.json'

import frCommon from './locales/fr/common.json'
import frFooter from './locales/fr/footer.json'
import frHome from './locales/fr/home.json'
import frAbout from './locales/fr/about.json'
import frContact from './locales/fr/contact.json'
import frCollection from './locales/fr/collection.json'
import frProduct from './locales/fr/product.json'
import frCart from './locales/fr/cart.json'
import frCheckout from './locales/fr/checkout.json'
import frAccount from './locales/fr/account.json'
import frTerms from './locales/fr/terms.json'
import frImpressum from './locales/fr/impressum.json'
import frSizeRecommender from './locales/fr/sizeRecommender.json'

import itCommon from './locales/it/common.json'
import itFooter from './locales/it/footer.json'
import itHome from './locales/it/home.json'
import itAbout from './locales/it/about.json'
import itContact from './locales/it/contact.json'
import itCollection from './locales/it/collection.json'
import itProduct from './locales/it/product.json'
import itCart from './locales/it/cart.json'
import itCheckout from './locales/it/checkout.json'
import itAccount from './locales/it/account.json'
import itTerms from './locales/it/terms.json'
import itImpressum from './locales/it/impressum.json'
import itSizeRecommender from './locales/it/sizeRecommender.json'

const resources = {
  en: {
    common: enCommon, footer: enFooter, home: enHome, about: enAbout, contact: enContact,
    collection: enCollection, product: enProduct, cart: enCart, checkout: enCheckout,
    account: enAccount, terms: enTerms, impressum: enImpressum, sizeRecommender: enSizeRecommender,
  },
  de: {
    common: deCommon, footer: deFooter, home: deHome, about: deAbout, contact: deContact,
    collection: deCollection, product: deProduct, cart: deCart, checkout: deCheckout,
    account: deAccount, terms: deTerms, impressum: deImpressum, sizeRecommender: deSizeRecommender,
  },
  fr: {
    common: frCommon, footer: frFooter, home: frHome, about: frAbout, contact: frContact,
    collection: frCollection, product: frProduct, cart: frCart, checkout: frCheckout,
    account: frAccount, terms: frTerms, impressum: frImpressum, sizeRecommender: frSizeRecommender,
  },
  it: {
    common: itCommon, footer: itFooter, home: itHome, about: itAbout, contact: itContact,
    collection: itCollection, product: itProduct, cart: itCart, checkout: itCheckout,
    account: itAccount, terms: itTerms, impressum: itImpressum, sizeRecommender: itSizeRecommender,
  },
}

/**
 * The active language is read straight from the URL here, synchronously,
 * rather than always initializing to English and correcting it afterward in
 * a LocaleLayout effect.
 *
 * That "init English, fix it in an effect" approach has a real race: on a
 * fresh page load, `useTranslation()` subscribes to i18next's
 * `languageChanged` event in a passive effect, which runs *after* layout
 * effects. If LocaleLayout's layout effect calls `changeLanguage` and that
 * promise resolves before a given component's own subscription effect has
 * run, that component misses the event and never re-renders — it silently
 * keeps showing English. Observed in practice: /de and /fr routes randomly
 * stayed English on a hard reload while /it happened to win the race. Since
 * scripts/prerender.mjs navigates fresh to every URL (exactly a hard
 * reload), this would have made the prerendered language a coin flip.
 * Getting it right from the first render sidesteps the race entirely.
 */
const initialLang = (() => {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const segment = window.location.pathname.split('/')[1]
  return SUPPORTED_LANGS.includes(segment) ? segment : DEFAULT_LANG
})()

// Translations are bundled statically rather than fetched — the whole
// catalogue across 4 languages is a few hundred KB uncompressed, and an async
// backend would race scripts/prerender.mjs's snapshot timing (it waits for
// the canonical link to match, not for translations to finish loading).
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: DEFAULT_LANG,
    supportedLngs: SUPPORTED_LANGS,
    ns: Object.keys(resources[DEFAULT_LANG]),
    defaultNS: 'common',
    interpolation: { escapeValue: false }, // React already escapes.
    returnEmptyString: false,
  })

export default i18next
