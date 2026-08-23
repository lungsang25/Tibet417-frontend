import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconButton from './IconButton';

const SearchBar = () => {

    const { t } = useTranslation('common');
    const { search, setSearch, showSearch, setShowSearch} = useContext(ShopContext);
    const [visible,setVisible] = useState(false)
    const location = useLocation();

    useEffect(()=>{
        if (location.pathname.includes('collection')) {
            setVisible(true);
        }
        else {
            setVisible(false)
        }
    },[location])

  return showSearch && visible ? (
    <div className='border-t border-b bg-gray-50 text-center'>
      <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
        <label htmlFor='site-search' className='sr-only'>{t('search.placeholder')}</label>
        <input id='site-search' value={search} onChange={(e)=>setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm' type="text" placeholder={t('search.placeholder')}/>
        <img className='w-4' src={assets.search_icon} alt="" />
      </div>
      <IconButton onClick={()=>setShowSearch(false)} icon={assets.cross_icon} label={t('search.close')} iconClassName='inline w-3' className='align-middle' />
    </div>
  ) : null
}

export default SearchBar
