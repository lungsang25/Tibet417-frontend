import React, { useState, useRef } from 'react';
import { getBlurPlaceholder } from '../utils/imageUtils';

const OptimizedImage = ({
    src,
    srcSet,
    sizes,
    alt = '',
    className = '',
    containerClassName = '',
    priority = false
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef(null);

    const blurSrc = getBlurPlaceholder(src);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div ref={imgRef} className={`relative overflow-hidden ${containerClassName}`}>
            {/* Skeleton placeholder - stops animating once loaded */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Blur placeholder */}
            {!isLoaded && blurSrc && (
                <img
                    src={blurSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
                    aria-hidden="true"
                />
            )}

            {/* Main image - always rendered, fades in when loaded */}
            <img
                src={src}
                srcSet={srcSet}
                sizes={srcSet ? sizes : undefined}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                fetchpriority={priority ? 'high' : 'auto'}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                onLoad={handleLoad}
            />
        </div>
    );
};

export default OptimizedImage;
