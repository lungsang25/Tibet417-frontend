import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { getProductBadge } from '../utils/productBadges';

const MIN_RESULTS = 4;

const RelatedProducts = ({category,subCategory,currentProductId}) => {

    const { t } = useTranslation('product');
    const { products } = useContext(ShopContext);
    const [related,setRelated] = useState([]);

    useEffect(()=>{

        if (products.length > 0) {

            const others = products.filter((item) => item._id !== currentProductId);
            const exactMatch = others.filter((item) => item.category === category && item.subCategory === subCategory);

            let result = exactMatch;
            if (result.length < MIN_RESULTS) {
                const seen = new Set(result.map((item) => item._id));
                const sameCategory = others.filter((item) => item.category === category && !seen.has(item._id));
                result = [...result, ...sameCategory];
            }

            setRelated(result.slice(0,5));
        }

    },[products, category, subCategory, currentProductId])

  return (
    <div className='my-24'>
      <div className=' text-center text-3xl py-2'>
        <Title text1={t('related.text1')} text2={t('related.text2')} />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item)=>(
            <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} sizes={item.sizes} badge={getProductBadge(item, t)} />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
