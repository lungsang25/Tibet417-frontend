import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import SEO from '../components/SEO'
import { ProductCardSkeleton } from '../components/ProductSection'
import { getProductBadge } from '../utils/productBadges'

const Wishlist = () => {
  const { t } = useTranslation('wishlist');
  const { token, navigate, products, wishlist, authChecked } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authChecked) {
      if (!token) {
        navigate('/login');
      } else {
        setLoading(false);
      }
    }
  }, [token, authChecked, navigate]);

  const wishlistProducts = products.filter(product => wishlist.includes(product._id));

  if (loading) {
    return (
      <div className='border-t-2 pt-10'>
        <div className='text-2xl mb-8'>
          <Title text1={t('title')} text2='' />
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='border-t-2 pt-10 min-h-[60vh]'>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path='/wishlist'
      />

      <div className='text-2xl mb-8'>
        <Title text1={t('title')} text2='' />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <svg
            className='w-24 h-24 text-line mb-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            strokeWidth='1'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
            />
          </svg>
          <h2 className='text-xl text-ink mb-2'>{t('empty.title')}</h2>
          <p className='text-stone mb-6'>{t('empty.description')}</p>
          <Link
            to='/collection'
            className='bg-ink text-paper px-8 py-3 text-sm uppercase tracking-label hover:bg-stone transition-colors duration-300'
          >
            {t('empty.cta')}
          </Link>
        </div>
      ) : (
        <>
          <p className='text-sm text-stone mb-6'>
            {t('count', { count: wishlistProducts.length })}
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {wishlistProducts.map((item, index) => (
              <ProductItem
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                image={item.image}
                sizes={item.sizes}
                badge={getProductBadge(item, t)}
                priority={index < 4}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Wishlist
