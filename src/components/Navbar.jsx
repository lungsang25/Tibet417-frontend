import React, { useContext, useState, useEffect, useRef } from 'react'
import {assets} from '../assets/assets'
import { useTranslation } from 'react-i18next'
import { LocalizedLink as Link, LocalizedNavLink as NavLink } from '../hooks/useLocalizedNavigation'
import { ShopContext } from '../context/ShopContext';
import LanguageSwitcher from './LanguageSwitcher';
import IconButton from './IconButton';
import useFocusTrap from '../hooks/useFocusTrap';

const Navbar = () => {

    const { t } = useTranslation();
    const [visible,setVisible] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);
    const mobilePanelRef = useRef(null);
    const menuButtonRef = useRef(null);

    const {setShowSearch , getCartCount , navigate, token, setToken, setCartItems} = useContext(ShopContext);

    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
    }

    const closeMobileMenu = () => {
        setVisible(false)
        menuButtonRef.current?.focus()
    }

    useFocusTrap(visible, mobilePanelRef, { onEscape: closeMobileMenu })

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowProfileMenu(false);
                profileButtonRef.current?.focus();
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showProfileMenu]);

  return (
    <div className='sticky top-0 z-40 bg-paper flex items-center justify-between py-5 font-medium'>
      
      <Link to='/'><img src={assets.logo} className='w-36' alt='Tibet417 — Tibetan and Himalayan fashion' /></Link>

      {/* The primary nav is the strongest internal-link signal Google has for
          which pages matter. The category links are here so the crawlable
          category URLs are reachable from every page, not just the footer. */}
      <nav aria-label='Primary'>
      <ul className='hidden sm:flex gap-5 text-sm text-stone'>

        <NavLink to='/' className='flex flex-col items-center gap-1'>
            <p>{t('common:nav.home')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-stone hidden' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
            <p>{t('common:nav.collection')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-stone hidden' />
        </NavLink>
        <NavLink to='/collection/men' className='flex flex-col items-center gap-1'>
            <p>{t('common:nav.men')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-stone hidden' />
        </NavLink>
        <NavLink to='/collection/women' className='flex flex-col items-center gap-1'>
            <p>{t('common:nav.women')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-stone hidden' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1'>
            <p>{t('common:nav.about')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-stone hidden' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
            <p>{t('common:nav.contact')}</p>
            <hr className='w-2/4 border-none h-[1.5px] bg-stone hidden' />
        </NavLink>

      </ul>
      </nav>

      <div className='flex items-center gap-6'>
            <LanguageSwitcher className='hidden sm:block' />

            <IconButton
                onClick={()=> { setShowSearch(true); navigate('/collection') }}
                icon={assets.search_icon}
                label={t('common:nav.searchLabel')}
                iconClassName='w-5'
            />

            <Link to='/cart' className='relative' aria-label={t('common:nav.cartWithCount', { count: getCartCount() })}>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                {/* Re-keying on the count replays fade-up as a little "pop" each
                    time an item is added, reusing the existing keyframe rather
                    than introducing a dedicated badge animation. */}
                <p key={getCartCount()} aria-hidden='true' className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-ink text-paper aspect-square rounded-full text-[8px] animate-fade-up'>{getCartCount()}</p>
            </Link>

            {/* Profile Menu Icon (3 lines) - Hidden on mobile */}
            <div className='relative hidden sm:block' ref={profileMenuRef}>
                <button
                    type='button'
                    ref={profileButtonRef}
                    onClick={()=> token ? setShowProfileMenu(!showProfileMenu) : navigate('/login')}
                    aria-haspopup='menu'
                    aria-expanded={token ? showProfileMenu : undefined}
                    aria-label={t('common:profileMenu.myProfile')}
                    className='flex flex-col gap-1 cursor-pointer bg-transparent border-0 p-0'
                >
                    <div className='w-5 h-0.5 bg-ink'></div>
                    <div className='w-5 h-0.5 bg-ink'></div>
                    <div className='w-5 h-0.5 bg-ink'></div>
                </button>

                {/* Dropdown Menu */}
                {token && showProfileMenu &&
                <div className='absolute dropdown-menu right-0 pt-4 z-10' role='menu'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-paper text-stone rounded shadow-modal'>
                        <button type='button' role='menuitem' onClick={()=>{navigate('/profile'); setShowProfileMenu(false)}} className='text-left cursor-pointer bg-transparent border-0 p-0 hover:text-ink'>{t('common:profileMenu.myProfile')}</button>
                        <button type='button' role='menuitem' onClick={()=>{navigate('/orders'); setShowProfileMenu(false)}} className='text-left cursor-pointer bg-transparent border-0 p-0 hover:text-ink'>{t('common:profileMenu.orders')}</button>
                        <button type='button' role='menuitem' onClick={()=>{navigate('/wishlist'); setShowProfileMenu(false)}} className='text-left cursor-pointer bg-transparent border-0 p-0 hover:text-ink'>{t('common:profileMenu.wishlist')}</button>
                        <button type='button' role='menuitem' onClick={()=>{logout(); setShowProfileMenu(false)}} className='text-left cursor-pointer bg-transparent border-0 p-0 hover:text-ink'>{t('common:profileMenu.logout')}</button>
                    </div>
                </div>}
            </div>

            <IconButton
                ref={menuButtonRef}
                onClick={()=>setVisible(true)}
                icon={assets.menu_icon}
                label={t('common:nav.openMenu')}
                iconClassName='w-5'
                className='sm:hidden'
                aria-expanded={visible}
            />
      </div>

        {/* Sidebar menu for small screens */}
        <div
            ref={mobilePanelRef}
            role='dialog'
            aria-modal='true'
            aria-label={t('common:nav.mobileMenu')}
            className={`fixed top-0 right-0 bottom-0 overflow-hidden bg-paper transition-all duration-base z-50 ${visible ? 'w-full' : 'w-0'}`}
        >
                <div className='flex flex-col text-stone'>
                    <button type='button' onClick={closeMobileMenu} className='flex items-center gap-4 p-3 cursor-pointer bg-transparent border-0 text-left w-full'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>{t('common:nav.back')}</p>
                    </button>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/'>{t('common:nav.home')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection'>{t('common:nav.collection')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection/men'>{t('common:nav.men')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection/women'>{t('common:nav.women')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/collection/kids'>{t('common:nav.kids')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/about'>{t('common:nav.about')}</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/contact'>{t('common:nav.contact')}</NavLink>

                    {/* Profile menu items for mobile */}
                    {token ? (
                        <>
                            <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/profile'>{t('common:mobileMenu.myProfile')}</NavLink>
                            <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/orders'>{t('common:mobileMenu.orders')}</NavLink>
                            <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/wishlist'>{t('common:mobileMenu.wishlist')}</NavLink>
                            <button type='button' onClick={()=>{logout(); setVisible(false)}} className='py-2 pl-6 border cursor-pointer bg-transparent text-left w-full'>{t('common:mobileMenu.logout')}</button>
                        </>
                    ) : (
                        <NavLink onClick={()=>setVisible(false)} className='py-2 pl-6 border' to='/login'>{t('common:nav.login')}</NavLink>
                    )}
                    <div className='py-3 pl-6 border'>
                        <LanguageSwitcher />
                    </div>
                </div>
        </div>

    </div>
  )
}

export default Navbar
