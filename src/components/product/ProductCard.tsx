import { Link } from 'react-router-dom';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { useWishlist } from '@/context/WishlistContext';
import { site } from '@/config/site';
import { getImage } from '@/config/images';
import type { ProductWithImages } from '@/lib/types';

type ProductCardProps = {
  product: ProductWithImages;
  onQuickView?: (product: ProductWithImages) => void;
};

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { isSaved, toggle } = useWishlist();

  const heroImage = product.images?.[0];
  const hoverImage = product.images?.[1] ?? heroImage;
  const isWishlisted = isSaved(product.id);

  const badges: string[] = [];
  if (product.is_new) badges.push('New');
  if (product.is_featured) badges.push('Featured');
  if (product.is_best_seller) badges.push('Best Seller');

  const handleWishlist = () => {
    toggle({
      id: product.id,
      title: product.title,
      imageKey: heroImage?.url ? '' : 'hero.main',
      href: `/product/${product.slug}`,
      addedAt: Date.now(),
    });
  };

  const whatsappMsg = encodeURIComponent(
    `Hello ${site.name}, I'm interested in the "${product.title}" — could you share more details?`,
  );

  return (
    <Reveal>
      <div className="card-editorial group">
        {/* Image */}
        <div className="zoom-wrap relative aspect-[3/4] overflow-hidden rounded-t-luxury-lg">
          <img
            src={heroImage?.url ?? getImage('hero.main')}
            alt={heroImage?.alt ?? product.title}
            loading="lazy"
            decoding="async"
            className="zoom-img"
          />
          {hoverImage && hoverImage.url !== heroImage?.url && (
            <img
              src={hoverImage.url}
              alt={hoverImage.alt ?? product.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-luxury ease-luxury group-hover:opacity-100"
            />
          )}

          {/* Editorial overlay gradient for depth */}
          <div className="pointer-events-none absolute inset-0 overlay-editorial opacity-0 transition-opacity duration-luxury group-hover:opacity-100" aria-hidden />

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] backdrop-blur-sm ${
                    badge === 'New'
                      ? 'bg-gold-500/95 text-navy-900'
                      : badge === 'Featured'
                        ? 'bg-navy-900/90 text-ivory-100'
                        : 'bg-ivory-100/90 text-navy-900'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Status badge */}
          {product.status && (
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-navy-900 shadow-soft backdrop-blur-sm">
                {product.status === 'signature' ? 'Signature' : product.status === 'made_on_order' ? 'Made to Order' : product.status}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-all duration-luxury ease-luxury translate-y-2 group-hover:translate-y-0 group-hover:opacity-100">
            {onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                aria-label="Quick view"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-soft-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
              >
                <Eye size={16} />
              </button>
            )}
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white ${
                isWishlisted ? 'text-red-500' : 'text-navy-900'
              }`}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {product.code && (
            <p className="label-editorial mb-1.5">{product.code}</p>
          )}
          <h3 className="text-lg font-serif font-medium text-navy-900 leading-snug">
            <Link to={`/product/${product.slug}`} className="link-underline transition-colors hover:text-gold-700">
              {product.title}
            </Link>
          </h3>
          {product.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-charcoal-500">{product.excerpt}</p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {product.price_type === 'price_on_request' || !product.price ? (
                <span className="text-sm font-medium tracking-wide text-gold-700">Price on Request</span>
              ) : (
                <span className="text-sm font-medium tracking-wide text-navy-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
              )}
            </div>
            <a
              href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Enquire on WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-50 text-gold-600 transition-all duration-luxury hover:bg-gold-100 hover:shadow-gold"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
