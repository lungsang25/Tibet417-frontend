import React, { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from './components/SEO'
import { siteName } from './config/site'
import LocaleLayout, { RootRedirect, LegacyRedirect } from './components/LocaleLayout'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Analytics from './components/Analytics'
import PageLoader from './components/PageLoader'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Route-level code-splitting: previously every page (including checkout,
// auth and order-history, which most homepage visitors never touch) shipped
// in one bundle. Navbar/Footer/SearchBar/Analytics/SEO/LocaleLayout stay
// eager — they render on every route, so splitting them would only add
// request overhead with no bundle-size benefit.
const Home = lazy(() => import('./pages/Home'))
const Collection = lazy(() => import('./pages/Collection'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Terms = lazy(() => import('./pages/Terms'))
const Impressum = lazy(() => import('./pages/Impressum'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'))
const Orders = lazy(() => import('./pages/Orders'))
const Profile = lazy(() => import('./pages/Profile'))
const Verify = lazy(() => import('./pages/Verify'))
const VerifyTwint = lazy(() => import('./pages/VerifyTwint'))

/**
 * Routes behind auth or mid-checkout. None of these pages rendered any metadata
 * of their own, so each inherited the shell's canonical and told Google it was
 * the homepage — seven URLs all claiming to be https://www.tibet417.com/.
 *
 * Handled centrally rather than in each page so the list stays in one place and
 * matches robots.txt. Keyed by the unprefixed path — the leading /:lang segment
 * is stripped before matching.
 */
const PRIVATE_ROUTE_TITLES = {
  '/cart': (t) => `${t('cart:heading.text1')} ${t('cart:heading.text2')}`,
  '/login': (t) => t('account:login.loginHeading'),
  '/place-order': (t) => `${t('checkout:deliveryInfo.text1')} ${t('checkout:deliveryInfo.text2')}`,
  '/orders': (t) => `${t('account:orders.heading.text1')} ${t('account:orders.heading.text2')}`,
  '/profile': (t) => t('common:profileMenu.myProfile'),
  '/verify': (t) => t('account:verify.twintVerifying'),
  '/verify-twint': (t) => t('account:verify.twintVerifying'),
}

const App = () => {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  // Strip the leading /:lang segment ('/de/cart' -> '/cart') before matching.
  const pathWithoutLang = '/' + pathname.split('/').slice(2).join('/')
  const privateTitleFn = PRIVATE_ROUTE_TITLES[pathWithoutLang]
  const privateTitle = privateTitleFn ? privateTitleFn(t) : null

  return (
    <div className='overflow-x-clip px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-white focus:px-4 focus:py-2'
      >
        {t('common:a11y.skipToContent')}
      </a>
      {privateTitle && (
        <SEO
          title={`${privateTitle} | ${siteName}`}
          description={`${privateTitle} — ${siteName}.`}
          path={pathWithoutLang}
          noindex
        />
      )}
      <Analytics />
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <main id='main-content'>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/' element={<RootRedirect />} />
            <Route path='/:lang' element={<LocaleLayout />}>
              <Route index element={<Home />} />
              <Route path='collection' element={<Collection />} />
              {/* Crawlable category URLs. Same component — the param pins the filter. */}
              <Route path='collection/:categorySlug' element={<Collection />} />
              <Route path='about' element={<About />} />
              <Route path='contact' element={<Contact />} />
              <Route path='terms' element={<Terms />} />
              <Route path='impressum' element={<Impressum />} />
              <Route path='product/:productId' element={<Product />} />
              <Route path='cart' element={<Cart />} />
              <Route path='login' element={<Login />} />
              <Route path='place-order' element={<PlaceOrder />} />
              <Route path='orders' element={<Orders />} />
              <Route path='profile' element={<Profile />} />
              <Route path='verify' element={<Verify />} />
              <Route path='verify-twint' element={<VerifyTwint />} />
            </Route>
            {/* Pre-migration URLs with more than one segment (/collection/men,
                /product/<id>) — they don't match '/:lang' at all. Single-segment
                legacy URLs (/about, /cart, ...) are caught inside LocaleLayout
                instead, since they do match '/:lang' (with lang="about" etc). */}
            <Route path='*' element={<LegacyRedirect />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
