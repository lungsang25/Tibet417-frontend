import React from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import Title from './Title'
import ProductItem from './ProductItem'
import { getProductBadge } from '../utils/productBadges'

export const ProductCardSkeleton = () => (
  <div>
    <div className='aspect-[3/4] w-full bg-line animate-pulse' />
    <div className='mt-3 h-3 w-3/4 bg-line animate-pulse' />
    <div className='mt-2 h-3 w-1/4 bg-line animate-pulse' />
  </div>
)

/**
 * Shared shell for the homepage product rails (LATEST COLLECTIONS, BEST SELLERS).
 * Owns the header, the grid and the loading/empty states.
 */
const ProductSection = ({
  text1,
  text2,
  description,
  products = [],
  count = 4,
  href = '/collection',
  linkLabel,
  loading = false,
}) => {
  const { t } = useTranslation()
  // Nothing to show once loading has settled — don't render an empty section.
  if (!loading && products.length === 0) return null

  return (
    <section className='py-12 sm:py-16'>
      <div className='flex items-end justify-between gap-6 border-b border-line pb-5'>
        <div>
          <div className='text-2xl sm:text-3xl'>
            <Title text1={text1} text2={text2} />
          </div>
          {description && (
            <p className='max-w-xl text-sm text-stone'>{description}</p>
          )}
        </div>
        <Link
          to={href}
          onClick={() => scrollTo(0, 0)}
          className='shrink-0 whitespace-nowrap text-[11px] uppercase tracking-label text-ink border-b border-ink pb-1 hover:text-stone hover:border-stone transition-colors duration-300'
        >
          {linkLabel ?? t('common:actions.viewAll')}
        </Link>
      </div>

      <div className='mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10'>
        {loading
          ? Array.from({ length: count }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          : products.map((item, index) => (
              <ProductItem
                key={item._id ?? index}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
                priority={index < 4}
                badge={getProductBadge(item, t)}
              />
            ))}
      </div>
    </section>
  )
}

export default ProductSection
