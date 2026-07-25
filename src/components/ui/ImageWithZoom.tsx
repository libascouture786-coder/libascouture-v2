import { useState } from 'react';

type ImageWithZoomProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  eager?: boolean;
};

export function ImageWithZoom({
  src,
  alt,
  className = '',
  imgClassName = '',
  aspectRatio = 'aspect-[3/4]',
  sizes = '100vw',
  priority = false,
  zoom = true,
  eager = false,
}: ImageWithZoomProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-ivory-200 ${aspectRatio} ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden />}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority || eager ? 'eager' : 'lazy'}
        decoding={priority || eager ? 'auto' : 'async'}
        {...(priority ? ({ fetchpriority: 'high' } as { fetchpriority: string }) : {})}
        onLoad={() => setLoaded(true)}
        className={`zoom-img ${loaded ? 'opacity-100' : 'opacity-0'} ${zoom ? '' : 'transition-opacity duration-luxury'} ${imgClassName}`}
      />
    </div>
  );
}
