import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation'
import { getMediumImage, getSrcSet } from '../utils/imageUtils'
import OptimizedImage from './OptimizedImage'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

// Matches the 2/3/4-column grids these cards actually render in
// (Collection.jsx, ProductSection.jsx, RelatedProducts.jsx) so the browser
// doesn't fetch a desktop-sized image on a phone.
const CARD_SIZES = '(min-width: 1024px) 23vw, (min-width: 640px) 30vw, 47vw'

const ProductItem = ({id,image,name,price,priority = false,badge,sizes}) => {
    const { t } = useTranslation();
    const {currency, addToCart, isInWishlist, addToWishlist, removeFromWishlist, products} = useContext(ShopContext);
    const hoverImage = image?.[1];
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const inWishlist = isInWishlist(id);

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isAddingToCart) return;
        
        const product = products.find(p => p._id === id);
        if (!product || !product.sizes || product.sizes.length === 0) {
            toast.error('Product sizes not available');
            return;
        }

        setIsAddingToCart(true);
        try {
            await addToCart(id, product.sizes[0]);
            toast.success(t('common:actions.addedToCart'));
        } catch (error) {
            console.error(error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (inWishlist) {
            await removeFromWishlist(id);
        } else {
            await addToWishlist(id);
        }
    };

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

        {/* Wishlist Button - Top Right */}
        <button
          type='button'
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? t('common:actions.removeFromWishlist') : t('common:actions.addToWishlist')}
          className='absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 sm:opacity-100 sm:group-hover:opacity-100 z-10'
        >
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${inWishlist ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-ink'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Quick Add Button - Bottom Center on Hover */}
        <button
          type='button'
          onClick={handleQuickAdd}
          disabled={isAddingToCart}
          aria-label={t('common:actions.quickAdd')}
          className='absolute bottom-0 left-0 right-0 bg-ink text-paper py-3 text-sm uppercase tracking-label transition-all duration-300 translate-y-full group-hover:translate-y-0 disabled:opacity-50 z-10'
        >
          {isAddingToCart ? t('common:actions.adding') : t('common:actions.quickAdd')}
        </button>
      </div>

      <p className='pt-3 text-sm text-ink line-clamp-1'>{name}</p>
      <p className='pt-1 text-sm text-stone'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem
