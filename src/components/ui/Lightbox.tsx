import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

type LightboxProps = {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(index > 0 ? index - 1 : images.length - 1);
      if (e.key === 'ArrowRight') onNavigate(index < images.length - 1 ? index + 1 : 0);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [index, images.length, onClose, onNavigate]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-navy-950/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery viewer"
    >
      <button
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-ivory-200/20 text-ivory-100 transition-colors hover:bg-navy-800"
      >
        <X size={20} />
      </button>

      <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <img
          src={current.src}
          alt={current.alt}
          className={`max-h-full max-w-full object-contain transition-transform duration-luxury ease-luxury ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
          onClick={() => setZoomed((z) => !z)}
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index > 0 ? index - 1 : images.length - 1);
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory-200/20 text-ivory-100 transition-colors hover:bg-navy-800"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index < images.length - 1 ? index + 1 : 0);
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ivory-200/20 text-ivory-100 transition-colors hover:bg-navy-800"
          >
            ›
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-light text-ivory-200/60">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
