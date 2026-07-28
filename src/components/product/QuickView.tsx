import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, CalendarHeart, ArrowRight } from 'lucide-react';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { useWishlist } from '@/context/WishlistContext';
import { useAppointment } from '@/context/AppointmentContext';
import { site } from '@/config/site';
import type { ProductWithImages } from '@/lib/types';

type QuickViewProps = {
  product: ProductWithImages | null;
  onClose: () => void;
};

export function QuickView({ product, onClose }: QuickViewProps) {
  const [activeImg, setActiveImg] = useState(0);
  const { isSaved, toggle } = useWishlist();
  const { open } = useAppointment();

  useEffect(() => {
    setActiveImg(0);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, product]);

  if (!product) return null;

  const images = product.images ?? [];
  const isWishlisted = isSaved(product.id);
  const whatsappMsg = encodeURIComponent(
    `Hello ${site.name}, I'm interested in the "${product.title}" — could you share more details?`,
  );

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.title}`}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-luxury-lg bg-ivory-100 shadow-soft-lg animate-scale-in no-scrollbar"
      >
        <button
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-charcoal-500 transition-colors hover:bg-ivory-200 hover:text-navy-900"
        >
          <X size={18} />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Gallery */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              {images.length > 0 ? (
                images.map((img, i) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.alt ?? product.title}
                    className={`gallery-img ${i === activeImg ? 'opacity-100' : 'opacity-0'}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                ))
              ) : (
                <div className="gallery-img flex items-center justify-center bg-ivory-200 opacity-100">
                  <span className="text-xs font-light uppercase tracking-[0.2em] text-charcoal-400">
                    Image Coming Soon
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-luxury ${i === activeImg ? 'scale-125 bg-gold-500' : 'bg-white/60 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col p-6 sm:p-8">
            <p className="heading-eyebrow">{product.status === 'signature' ? 'Signature Collection' : 'Made to Order'}</p>
            <h2 className="mt-3 text-h3 font-serif font-medium text-navy-900">{product.title}</h2>
            {product.excerpt && <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-500">{product.excerpt}</p>}

            <div className="mt-5">
              {product.price_type === 'price_on_request' || !product.price ? (
                <span className="text-lg font-medium text-gold-700">Price on Request</span>
              ) : (
                <span className="text-lg font-medium text-navy-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
              )}
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <ul className="mt-5 space-y-1.5">
                {product.highlights.slice(0, 4).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-light text-charcoal-600">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {product.embroidery && product.embroidery.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Embroidery</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.embroidery.map((e, i) => (
                    <span key={i} className="rounded-full bg-ivory-200 px-3 py-1 text-[10px] font-light text-charcoal-600">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3">
              <ButtonAnchor
                href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                variant="gold"
                size="md"
              >
                <MessageCircle size={16} /> Enquire on WhatsApp
              </ButtonAnchor>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={open} className="flex-1">
                  <CalendarHeart size={16} /> Book Appointment
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    toggle({
                      id: product.id,
                      title: product.title,
                      imageKey: 'hero.main',
                      href: `/product/${product.slug}`,
                      addedAt: Date.now(),
                    })
                  }
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={isWishlisted ? 'text-red-500' : ''}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                </Button>
              </div>
              <ButtonLink to={`/product/${product.slug}`} variant="tertiary" size="md" className="w-full">
                View Full Product <ArrowRight size={14} className="ml-1" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
