import { useState, useRef, useEffect } from 'react';
import './LazyImage.css';

/**
 * LazyImage Component
 * - Lazy loads images using Intersection Observer
 * - Shows placeholder/blur while loading
 * - Smooth fade-in animation when loaded
 */
export default function LazyImage({
    src,
    alt = '',
    className = '',
    style = {},
    placeholder = null,
    threshold = 0.1,
    rootMargin = '100px',
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    return (
        <div
            ref={imgRef}
            className={`lazy-image-wrapper ${isLoaded ? 'lazy-image--loaded' : ''} ${className}`}
            style={style}
        >
            {/* Placeholder shown while loading */}
            {!isLoaded && (
                <div className="lazy-image__placeholder">
                    {placeholder || (
                        <div className="lazy-image__shimmer">
                            <div className="lazy-image__shimmer-wave"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Actual image - only start loading when in view */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`lazy-image__img ${isLoaded ? 'lazy-image__img--visible' : ''}`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                    decoding="async"
                    {...props}
                />
            )}

            {/* Error state */}
            {hasError && (
                <div className="lazy-image__error">
                    <span>📷</span>
                </div>
            )}
        </div>
    );
}
