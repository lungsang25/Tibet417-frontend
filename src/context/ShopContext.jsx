import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { getMediumImage } from '../utils/imageUtils'
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigation'

export const ShopContext = createContext();

/**
 * scripts/prerender.mjs inlines the product list into each prerendered page as
 * window.__TIBET417_PRODUCTS__.
 *
 * Without it the first client render has an empty catalogue while the
 * prerendered HTML already shows six products, so hydration fails on every page
 * that lists products and React throws the markup away and repaints. Seeding
 * initial state from the inlined data makes the first render identical — and
 * skips a round-trip to the API before anything can appear.
 */
const normalizeProducts = (list) => [...list].reverse();

const preloadedProducts = () => {
    if (typeof window === 'undefined' || !Array.isArray(window.__TIBET417_PRODUCTS__)) return null;
    return normalizeProducts(window.__TIBET417_PRODUCTS__);
};

const ShopContextProvider = (props) => {

    // The checkout has always billed CHF (orderController.js -> Payrexx,
    // currency: 'CHF') and the GTC state prices are "strictly net and in Swiss
    // francs". The storefront rendered a '$' against those same numbers, so a
    // customer saw "$50" and was charged "CHF 50".
    const currency = 'CHF';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState(() => preloadedProducts() ?? []);
    const [productsLoaded, setProductsLoaded] = useState(() => preloadedProducts() !== null);
    const [token, setToken] = useState('')
    const navigate = useLocalizedNavigate();


    // Server-side /api/cart/add (cartController.js) always increments by
    // exactly 1 and ignores any other field in the body — it isn't a
    // quantity-aware endpoint. addToCart mirrors that here so local state
    // never drifts from what the server actually persists for a logged-in
    // user. Adding more than one at once (e.g. from the PDP quantity
    // selector) goes through updateQuantity instead, which the server does
    // treat as an absolute value.
    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);

        // cartItems is a snapshot from this render's context value. A caller
        // that just awaited addToCart for the same itemId (Product.jsx's
        // quantity selector does this) can reach here before that state
        // update has flowed back through context, so cartData[itemId] may
        // still look empty even though the item was just added — guard
        // rather than crash on cartData[itemId][size] = ...
        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }
        cartData[itemId][size] = quantity;

        setCartItems(cartData)

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalAmount;
    }

    const preloadImages = (products) => {
        const first10 = products.slice(0, 10);
        first10.forEach((product) => {
            if (product.image && product.image[0]) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = getMediumImage(product.image[0]);
                document.head.appendChild(link);
            }
        });
    };

    const getProductsData = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                // Same transform as the preload path, so a refresh after
                // hydration cannot reorder what is already on screen.
                const reversedProducts = normalizeProducts(response.data.products);
                setProducts(reversedProducts);
                preloadImages(reversedProducts);
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setProductsLoaded(true)
        }
    }

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
        }
    }, [token])

    const value = {
        products, productsLoaded, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        setToken, token
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;