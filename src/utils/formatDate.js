import { DEFAULT_LANG } from '../config/site'

/**
 * Localized dates.
 *
 * The app's only date render used to be `new Date(order.date).toDateString()`
 * — "Mon Sep 02 2026", always English, on a site that also serves German,
 * French and Italian. Intl is built into the browser, so there is no reason to
 * ship an English-only date to a French customer.
 *
 * Swiss regional tags rather than the bare language: the shop ships from
 * St. Gallen, so 'de-CH' (2. September 2026) is right where 'de-DE' is not.
 * Mirrors LOCALE_MAP in config/site.js and the backend's email templates.
 */
const LOCALE_TAG = { en: 'en-CH', de: 'de-CH', fr: 'fr-CH', it: 'it-CH' }

const tagFor = (lang) => LOCALE_TAG[lang] || LOCALE_TAG[DEFAULT_LANG]

export const formatDate = (ms, lang) =>
  ms ? new Intl.DateTimeFormat(tagFor(lang), { dateStyle: 'long' }).format(new Date(ms)) : ''

export const formatDateTime = (ms, lang) =>
  ms ? new Intl.DateTimeFormat(tagFor(lang), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms)) : ''
