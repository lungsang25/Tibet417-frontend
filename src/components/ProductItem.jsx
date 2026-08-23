import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import { getMediumImage, getSrcSet } from '../utils/imageUtils'
import OptimizedImage from './OptimizedImage'

// Matches the 2/3/4-column grids these cards actually render in
// (Collection.jsx, ProductSection.jsx, RelatedProducts.jsx) so the browser
// doesn't fetch a desktop-sized image on a phone.
const CARD_SIZES = '(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 47vw'

const ProductItem = ({id,image,name,price,priority = false,badge}) => {

    const {currency} = useContext(ShopContext);
    const hoverImage = image?.[1];

  return (
    <Link onClick={()=>scrollTo(0,0)} className='group block cursor-pointer' to={`/product/${id}`}>
      <div className='relative aspect-[3/4] w-full overflow-hidden bg-line'>
        <div className='absolute inset-0'>
          <OptimizedImage
            src={getMediumImage(image[0])}
            srcSet={getSrcSet(image[0])}
            sizes={CARD_SIZES}
            alt={name}
            priority={priority}
            containerClassName='w-full h-full'
            className='transition-transform duration-700 ease-out group-hover:scale-[1.04]'
          />
        </div>

        {/* Second product shot, revealed on hover */}
        {hoverImage && (
          <div className='absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
            <OptimizedImage
              src={getMediumImage(hoverImage)}
              srcSet={getSrcSet(hoverImage)}
              sizes={CARD_SIZES}
              alt=''
              containerClassName='w-full h-full'
              className='transition-transform duration-700 ease-out group-hover:scale-[1.04]'
            />
          </div>
        )}

        {badge && (
          <span className='absolute top-3 left-3 bg-white/95 text-ink px-2.5 py-1 text-[10px] uppercase tracking-label'>
            {badge}
          </span>
        )}
      </div>

      <p className='pt-3 text-sm text-ink line-clamp-1'>{name}</p>
      <p className='pt-1 text-sm text-stone'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
