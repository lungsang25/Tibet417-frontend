/**
 * Transforms Cloudinary URLs to serve optimized images
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedImage = (url, options = {}) => {
    const { width = 400, height = 400 } = options;
    
    if (url && url.includes('cloudinary.com')) {
        return url.replace('/upload/', `/upload/w_${width},h_${height},c_limit,q_auto,f_auto/`);
    }
    return url;
};

/**
 * Get tiny blur placeholder (< 1KB) for instant loading
 */
export const getBlurPlaceholder = (url) => {
    if (url && url.includes('cloudinary.com')) {
        return url.replace('/upload/', '/upload/w_20,h_20,c_limit,q_10,e_blur:1000/');
    }
    return url;
};

/**
 * Get thumbnail version of image (smaller size for lists/carts)
 */
export const getThumbnail = (url) => {
    return getOptimizedImage(url, { width: 100, height: 100 });
};

/**
 * Get medium size image for product cards
 */
export const getMediumImage = (url) => {
    return getOptimizedImage(url, { width: 400, height: 400 });
};

/**
 * Get large image for product detail page
 */
export const getLargeImage = (url) => {
    return getOptimizedImage(url, { width: 800, height: 800 });
};

/**
 * Build a srcset from the same Cloudinary f_auto,q_auto pipeline at several
 * widths, so a product card on a phone doesn't download the same bytes as one
 * on a 4K desktop. No-op (returns undefined) for non-Cloudinary sources.
 */
export const getSrcSet = (url, widths = [240, 400, 600, 800]) => {
    if (!url || !url.includes('cloudinary.com')) return undefined;
    return widths.map((width) => `${getOptimizedImage(url, { width, height: width })} ${width}w`).join(', ');
};
