import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { storage, type WishlistItem } from '@/lib/storage';
import { getImage } from '@/config/images';

export function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const update = () => setItems(storage.getWishlist());
    update();
    window.addEventListener('libas:wishlist-change', update);
    return () => window.removeEventListener('libas:wishlist-change', update);
  }, []);

  return (
    <>
      <Seo title="Wishlist" description="Your saved couture pieces at LIBAS COUTURE." canonical="https://libascouture.in/wishlist" />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />

      <Section background="ivory">
        <Reveal>
          <p className="heading-eyebrow">Your Collection</p>
          <h1 className="mt-3 text-h1 font-serif font-medium text-navy-900">Wishlist</h1>
        </Reveal>

        {items.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="Your wishlist is empty"
              message="Save your favourite couture pieces here by tapping the heart icon on any product."
            />
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-light text-charcoal-500">
                {items.length} {items.length === 1 ? 'piece' : 'pieces'} saved
              </p>
              <button
                onClick={() => {
                  storage.clearWishlist();
                  window.dispatchEvent(new Event('libas:wishlist-change'));
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-charcoal-400 transition-colors hover:text-red-500"
              >
                <Trash2 size={14} /> Clear all
              </button>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, i) => (
                <Reveal key={item.id} delay={i * 60}>
                  <div className="card-luxury group overflow-hidden">
                    <div className="zoom-wrap relative aspect-[3/4] overflow-hidden rounded-t-luxury-lg">
                      <img src={getImage(item.imageKey)} alt={item.title} loading="lazy" decoding="async" className="zoom-img" />
                      <button
                        onClick={() => {
                          storage.toggleWishlist(item);
                          window.dispatchEvent(new Event('libas:wishlist-change'));
                        }}
                        aria-label="Remove from wishlist"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-soft transition-transform hover:scale-110"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-serif font-medium text-navy-900">{item.title}</h3>
                      <Link to={item.href} className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-gold-700 hover:text-gold-600">
                        View Product <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
