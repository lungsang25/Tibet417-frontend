import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { getThumbnail } from '../utils/imageUtils';
import IconButton from '../components/IconButton';
import QuantityStepper from '../components/QuantityStepper';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation';

const Cart = () => {

  const { t } = useTranslation('cart');
  const { products, productsLoaded, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            })
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  const isEmpty = productsLoaded && cartData.length === 0;

  return (
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={t('heading.text1')} text2={t('heading.text2')} as='h1' />
      </div>

      {isEmpty ? (
        <div className='py-16 text-center flex flex-col items-center gap-4'>
          <p className='text-stone'>{t('empty.text')}</p>
          <Link to='/collection' className='bg-ink text-paper text-sm px-8 py-3'>{t('empty.cta')}</Link>
        </div>
      ) : (
        <>
          <div>
            {
              cartData.map((item, index) => {

                const productData = products.find((product) => product._id === item._id);

                return (
                  <div key={index} className='py-4 border-t border-b text-stone grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                    <div className=' flex items-start gap-6'>
                      <img className='w-16 sm:w-20' src={getThumbnail(productData.image[0])} alt="" loading='lazy' />
                      <div>
                        <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                        <div className='flex items-center gap-5 mt-2'>
                          <p>{currency}{productData.price}</p>
                          <p className='px-2 sm:px-3 sm:py-1 border bg-line'>{item.size}</p>
                        </div>
                        <p className='text-xs text-stone mt-1'>{t('lineSubtotal', { currency, amount: productData.price * item.quantity })}</p>
                      </div>
                    </div>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(quantity) => updateQuantity(item._id, item.size, quantity)}
                      label={t('quantityFor', { name: productData.name })}
                    />
                    <IconButton
                      onClick={() => updateQuantity(item._id, item.size, 0)}
                      icon={assets.bin_icon}
                      label={t('removeItem', { name: productData.name })}
                      iconClassName='w-4 sm:w-5'
                      className='mr-4'
                    />
                  </div>
                )

              })
            }
          </div>

          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-[450px]'>
              <CartTotal />
              <div className=' w-full text-end'>
                <button onClick={() => navigate('/place-order')} className='bg-ink text-paper text-sm my-8 px-8 py-3'>{t('checkoutButton')}</button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default Cart
