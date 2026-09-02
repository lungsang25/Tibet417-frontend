import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext';
import RelatedProducts from '../components/RelatedProducts';
import { getLargeImage, getMediumImage } from '../utils/imageUtils';
import SEO from '../components/SEO';
import { currencyCode, absoluteUrl, siteName } from '../config/site';
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation';
import PageLoader from '../components/PageLoader';
import QuantityStepper from '../components/QuantityStepper';
import Modal from '../components/Modal';
import SizeRecommender from '../components/SizeRecommender';
import SizeRecommenderButton from '../components/SizeRecommenderButton';

const Product = () => {

  const { t } = useTranslation('product');
  const { productId } = useParams();
  const { products, productsLoaded, currency, cartItems, addToCart, updateQuantity } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size,setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [sizeRecommenderOpen, setSizeRecommenderOpen] = useState(false)

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products])

  // Reset the chosen quantity whenever a visitor lands on a different
  // product, so it can't carry a stale value from the last PDP visited.
  useEffect(() => {
    setQuantity(1)
  }, [productId])

  useEffect(() => {
    if (!lightboxOpen || !productData) return undefined

    const handleKeyDown = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const currentIndex = productData.image.indexOf(image)
      const delta = event.key === 'ArrowLeft' ? -1 : 1
      const nextIndex = (currentIndex + delta + productData.image.length) % productData.image.length
      setImage(productData.image[nextIndex])
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, productData, image])

  const handleAddToCart = async () => {
    if (!size) {
      addToCart(productData._id, size)
      return
    }

    const existingQty = cartItems[productData._id]?.[size] || 0
    if (existingQty === 0) {
      await addToCart(productData._id, size)
      if (quantity > 1) {
        await updateQuantity(productData._id, size, quantity)
      }
    } else {
      await updateQuantity(productData._id, size, existingQty + quantity)
    }
    toast.success(t('common:actions.addedToCart'))
  }

  if (!productsLoaded) {
    return <PageLoader label={t('loading')} />
  }

  if (!productData) {
    return (
      <div className='min-h-[50vh] flex flex-col items-center justify-center text-center gap-4 border-t-2 pt-10'>
        <p className='text-xl'>{t('notFound.title')}</p>
        <p className='text-stone'>{t('notFound.text')}</p>
        <Link to='/collection' className='bg-ink text-paper text-sm px-8 py-3'>{t('notFound.linkText')}</Link>
      </div>
    )
  }

  return (
    <div className='border-t-2 pt-10 pb-28 sm:pb-10 transition-opacity ease-in duration-500 opacity-100'>
      <SEO
        title={`${productData.name} | ${siteName}`}
        description={`${productData.description.slice(0, 155)}${productData.description.length > 155 ? '…' : ''}`}
        path={`/product/${productData._id}`}
        ogType="product"
        ogImage={productData.image[0]}
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Collection', path: '/collection' },
          { name: productData.category, path: `/collection/${productData.category.toLowerCase()}` },
          { name: productData.name },
        ]}
        extraSchemaNodes={[
          {
            '@type': 'Product',
            '@id': `${absoluteUrl(`/product/${productData._id}`)}#product`,
            name: productData.name,
            image: productData.image,
            description: productData.description,
            sku: productData._id,
            category: `${productData.category} / ${productData.subCategory}`,
            brand: { '@type': 'Brand', name: siteName },
            offers: {
              '@type': 'Offer',
              url: absoluteUrl(`/product/${productData._id}`),
              // Matches what Payrexx actually charges (orderController.js) and
              // what the GTC state. This said USD while the checkout billed CHF.
              priceCurrency: currencyCode,
              price: productData.price,
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              eligibleRegion: { '@type': 'Country', name: 'CH' },
            },
            // No aggregateRating: there is no review system behind these
            // products. The hardcoded 4 / 122 that used to sit here was
            // identical on every product and violates Google's structured data
            // policy on fabricated reviews. Re-add only when real, verifiable
            // customer reviews exist.
          },
        ]}
      />
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item,index)=>(
                  <button
                    type='button'
                    key={index}
                    onClick={()=>setImage(item)}
                    aria-pressed={item === image}
                    aria-label={t('imgAltView', { name: productData.name, index: index + 1 })}
                    className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer bg-transparent border-0 p-0'
                  >
                    <img src={getMediumImage(item)} className={`w-full ${item === image ? 'ring-2 ring-ink' : ''}`} alt='' loading='lazy' />
                  </button>
                ))
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <button type='button' onClick={() => setLightboxOpen(true)} className='w-full cursor-zoom-in bg-transparent border-0 p-0'>
                <img className='w-full h-auto' src={getLargeImage(image)} alt={productData.name} />
              </button>
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <p className='mt-5 text-3xl font-medium'>{currency} {productData.price}</p>
          <p className='mt-5 text-stone md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>{t('selectSize')}</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item,index)=>(
                  <button onClick={()=>setSize(item)} aria-pressed={item === size} className={`border py-2 px-4 bg-line ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                ))}
              </div>
              <SizeRecommenderButton onClick={() => setSizeRecommenderOpen(true)} />
          </div>
          <div className='flex flex-col gap-2 mb-6'>
            <p>{t('quantityLabel')}</p>
            <QuantityStepper value={quantity} onChange={setQuantity} label={t('quantityLabel')} />
          </div>
          <button onClick={handleAddToCart} className='hidden sm:inline-block bg-ink text-paper px-8 py-3 text-sm active:bg-stone'>{t('common:actions.addToCart')}</button>
          <hr className='mt-8 sm:w-4/5' />
          {/* Claims here must match the GTC: 10 calendar days of withdrawal
              (clause 8), delivery within Switzerland, prices net in CHF. The
              previous copy promised cash on delivery, which is not an offered
              payment method, and a 7-day return window the GTC do not grant. */}
          <div className='text-sm text-stone mt-5 flex flex-col gap-1'>
              <p>{t('shippingNote')}</p>
              <p>{t('vatNote')}</p>
              <p>{t('withdrawalNotePrefix')}<Link to='/terms' className='underline'>{t('termsLink')}</Link>{t('withdrawalNoteSuffix')}</p>
          </div>
        </div>
      </div>

      {/* ---------- Description ------------- */}
      {/* The "Reviews (122)" tab is gone along with the fake rating it counted.
          The body here used to be generic filler explaining what an e-commerce
          website is — duplicated verbatim across every product, which is exactly
          the thin, templated content that keeps product pages out of the index. */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>{t('descriptionTab')}</b>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-stone'>
          <p>{productData.description}</p>
          <p>{productData.category} · {productData.subCategory}</p>
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} currentProductId={productData._id} />

      {/* Sticky mobile add-to-cart bar */}
      <div className='fixed bottom-0 left-0 right-0 sm:hidden bg-paper border-t border-line p-4 z-40 flex items-center justify-between gap-4'>
        <p className='text-lg font-medium'>{currency} {productData.price}</p>
        <button onClick={handleAddToCart} className='flex-1 bg-ink text-paper px-6 py-3 text-sm active:bg-stone'>{t('common:actions.addToCart')}</button>
      </div>

      <Modal isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} titleId='lightbox-title' className='max-w-4xl w-full'>
        <h2 id='lightbox-title' className='sr-only'>{productData.name}</h2>
        <div className='relative flex items-center justify-center bg-paper'>
          {productData.image.length > 1 && (
            <button
              type='button'
              onClick={() => {
                const currentIndex = productData.image.indexOf(image)
                const prevIndex = (currentIndex - 1 + productData.image.length) % productData.image.length
                setImage(productData.image[prevIndex])
              }}
              aria-label={t('lightbox.previous')}
              className='absolute left-2 text-2xl bg-paper/80 w-9 h-9 flex items-center justify-center'
            >
              ‹
            </button>
          )}
          <img src={getLargeImage(image)} alt={productData.name} className='max-h-[85vh] w-auto' />
          {productData.image.length > 1 && (
            <button
              type='button'
              onClick={() => {
                const currentIndex = productData.image.indexOf(image)
                const nextIndex = (currentIndex + 1) % productData.image.length
                setImage(productData.image[nextIndex])
              }}
              aria-label={t('lightbox.next')}
              className='absolute right-2 text-2xl bg-paper/80 w-9 h-9 flex items-center justify-center'
            >
              ›
            </button>
          )}
        </div>
      </Modal>

      <SizeRecommender
        isOpen={sizeRecommenderOpen}
        onClose={() => setSizeRecommenderOpen(false)}
        productData={productData}
        onSizeSelect={(selectedSize) => setSize(selectedSize)}
      />
    </div>
  )
}

export default Product
