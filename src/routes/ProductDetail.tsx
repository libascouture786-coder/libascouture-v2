import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Heart, MessageCircle, CalendarHeart, Phone, Navigation,
  Plus, Minus, Check, Truck, ShieldCheck, Sparkles, Ruler,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Lightbox, type LightboxImage } from '@/components/ui/Lightbox';
import { ProductCard } from '@/components/product/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import { useAppointment } from '@/context/AppointmentContext';
import { supabase } from '@/lib/supabase';
import { site, slugLabels } from '@/config/site';
import { storage } from '@/lib/storage';
import { productSchema, breadcrumbSchema, faqSchema, SITE_URL } from '@/lib/seo';
import type { ProductWithImages } from '@/lib/types';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [related, setRelated] = useState<ProductWithImages[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { isSaved, toggle } = useWishlist();
  const { open } = useAppointment();

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const { data: prod, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      if (!prod) { setProduct(null); return; }

      const { data: imgs } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', prod.id)
        .order('sort_order', { ascending: true });

      const withImages: ProductWithImages = { ...prod, images: imgs ?? [] };
      setProduct(withImages);
      storage.addRecentlyViewed(slug);

      const { data: relData } = await supabase
        .from('products')
        .select('*')
        .neq('id', prod.id)
        .eq('is_active', true)
        .limit(4);
      const { data: relImgs } = await supabase
        .from('product_images')
        .select('*')
        .order('sort_order', { ascending: true });
      const relWithImages: ProductWithImages[] = (relData ?? []).map((p) => ({
        ...p,
        images: (relImgs ?? []).filter((img) => img.product_id === p.id),
      }));
      setRelated(relWithImages);

      const viewed = storage.getRecentlyViewed().filter((s) => s !== slug);
      if (viewed.length > 0) {
        const { data: rvData } = await supabase
          .from('products')
          .select('*')
          .in('slug', viewed)
          .limit(4);
        const rvWithImages: ProductWithImages[] = (rvData ?? []).map((p) => ({
          ...p,
          images: (relImgs ?? []).filter((img) => img.product_id === p.id),
        }));
        setRecentlyViewed(rvWithImages);
      }
    } catch {
      setNetworkError(true);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
    setActiveImg(0);
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="skeleton aspect-[4/5] rounded-luxury-lg" />
          <div className="mt-4 flex gap-3">
            <div className="skeleton aspect-[3/4] w-20 rounded-luxury" />
            <div className="skeleton aspect-[3/4] w-20 rounded-luxury" />
            <div className="skeleton aspect-[3/4] w-20 rounded-luxury" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-luxury" />
          <div className="skeleton h-4 w-full rounded-luxury" />
          <div className="skeleton h-4 w-2/3 rounded-luxury" />
          <div className="skeleton h-12 w-full rounded-luxury" />
          <div className="skeleton h-12 w-full rounded-luxury" />
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-h2 font-serif font-medium text-navy-900">Connection Issue</h1>
        <p className="mt-3 text-sm font-light text-charcoal-500">We couldn't load this piece. Please check your connection and try again.</p>
        <ButtonLink to="/collections" variant="primary" size="md" className="mt-6">Explore Collections</ButtonLink>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-h2 font-serif font-medium text-navy-900">Product Not Found</h1>
        <p className="mt-3 text-sm font-light text-charcoal-500">This piece may no longer be available.</p>
        <ButtonLink to="/collections" variant="primary" size="md" className="mt-6">Explore Collections</ButtonLink>
      </div>
    );
  }

  const images = product.images ?? [];
  const isWishlisted = isSaved(product.id);
  const whatsappMsg = encodeURIComponent(
    `Hello ${site.name}, I'm interested in the "${product.title}" — could you share more details?`,
  );

  const lightboxImages: LightboxImage[] = images.map((img) => ({
    src: img.url,
    alt: img.alt ?? product.title,
  }));

  const faqs = [
    { q: 'Is this piece customisable?', a: product.customisable ? 'Yes, this piece is fully customisable. Our atelier can adjust colours, fabrics, embroidery, and silhouette details to your preference.' : 'This is a signature piece. Please contact us to discuss any customisation requests.' },
    { q: 'How long does it take to create?', a: product.status === 'made_on_order' ? 'Made-to-order pieces typically take 6–8 weeks. Bridal couture may take 10–12 weeks depending on embroidery complexity.' : 'Signature pieces are available for fitting and dispatch within 2–3 weeks.' },
    { q: 'Do you offer measurement services?', a: 'Yes — we offer showroom measurements, video call measurements, and self-measurement guides. Visit our Measurements page for details.' },
    { q: 'Can I visit the atelier?', a: `Absolutely. Visit us at ${site.address.full} or book a private appointment for a dedicated consultation.` },
  ];

  const heroImage = images[0]?.url;
  const seoDescription = product.excerpt ?? product.description ?? `${product.title} — bespoke hand-embroidered couture by ${site.name}.`;
  const canonical = `https://libascouture.in/product/${product.slug}`;
  const crumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Collections', url: `${SITE_URL}/collections` },
    ...(product.category_slug ? [{ name: slugLabels[product.category_slug] ?? product.category_slug, url: `${SITE_URL}/collections/${product.category_slug}` }] : []),
    { name: product.title, url: canonical },
  ];

  return (
    <>
      <Seo
        title={product.title}
        description={seoDescription}
        canonical={canonical}
        ogType="product"
        ogImage={heroImage}
        jsonLd={[
          productSchema({
            title: product.title,
            description: seoDescription,
            slug: product.slug,
            image: heroImage ?? undefined,
            imageAlt: images[0]?.alt ?? product.title,
            price: product.price ?? null,
            category: product.product_type ?? product.category_slug ?? undefined,
            customisable: product.customisable,
            sku: product.code,
          }),
          breadcrumbSchema(crumbItems),
          faqSchema(faqs),
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          ...(product.category_slug ? [{ label: slugLabels[product.category_slug] ?? product.category_slug, href: `/collections/${product.category_slug}` } as const] : []),
          { label: product.title },
        ]}
      />

      {/* Hero gallery + summary */}
      <Section background="ivory" className="!pt-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            <div
              className="zoom-wrap relative aspect-[4/5] cursor-pointer overflow-hidden rounded-luxury-lg"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={images[activeImg]?.url ?? images[0]?.url}
                alt={images[activeImg]?.alt ?? product.title}
                className="zoom-img"
                fetchPriority="high"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-luxury border-2 transition-colors ${
                      i === activeImg ? 'border-gold-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt={img.alt ?? product.title} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary panel */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {product.is_new && <span className="rounded-full bg-gold-500 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-navy-900">New</span>}
              {product.is_featured && <span className="rounded-full bg-navy-900 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ivory-100">Featured</span>}
              {product.is_best_seller && <span className="rounded-full bg-ivory-200 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-navy-900">Best Seller</span>}
            </div>
            <h1 className="mt-4 text-h1 font-serif font-medium text-navy-900 text-balance">{product.title}</h1>
            {product.excerpt && <p className="mt-3 text-base font-light leading-relaxed text-charcoal-500">{product.excerpt}</p>}

            <div className="mt-5">
              {product.price_type === 'price_on_request' || !product.price ? (
                <span className="text-lg font-medium text-gold-700">Price on Request</span>
              ) : (
                <span className="text-lg font-medium text-navy-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Trust signals */}
            <div className="mt-6 flex flex-wrap gap-4 border-y border-navy-50 py-4">
              <span className="flex items-center gap-1.5 text-xs font-light text-charcoal-600">
                <Sparkles size={14} className="text-gold-500" /> Hand Embroidered
              </span>
              <span className="flex items-center gap-1.5 text-xs font-light text-charcoal-600">
                <ShieldCheck size={14} className="text-gold-500" /> Premium Quality
              </span>
              <span className="flex items-center gap-1.5 text-xs font-light text-charcoal-600">
                <Truck size={14} className="text-gold-500" /> Pan-India Delivery
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3">
              <ButtonAnchor
                href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                variant="gold"
                size="lg"
              >
                <MessageCircle size={18} /> Enquire on WhatsApp
              </ButtonAnchor>
              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={open} className="flex-1">
                  <CalendarHeart size={18} /> Book Appointment
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
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
                  <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </Button>
              </div>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mt-7">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Highlights</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-light text-charcoal-600">
                      <Check size={14} className="mt-0.5 shrink-0 text-gold-500" strokeWidth={2} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Customisation */}
      {product.customisable && (
        <Section background="white">
          <Reveal>
            <p className="heading-eyebrow">Bespoke Service</p>
            <h2 className="mt-3 text-h2 font-serif font-medium text-navy-900">Make It Yours</h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-charcoal-500">
              This piece is fully customisable. From colour changes to fabric swaps, neckline adjustments to double dupattas — our atelier brings your vision to life.
            </p>
            <div className="mt-6">
              <ButtonLink to="/create-your-own" variant="primary" size="md">
                Start Custom Design
              </ButtonLink>
            </div>
          </Reveal>
        </Section>
      )}

      {/* Included items */}
      {product.includes && product.includes.length > 0 && (
        <Section background="ivory">
          <Reveal>
            <p className="heading-eyebrow">What's Included</p>
            <h2 className="mt-3 text-h2 font-serif font-medium text-navy-900">In This Ensemble</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.includes.map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-luxury border border-navy-50 bg-white p-4">
                  <Check size={16} className="shrink-0 text-gold-500" strokeWidth={2} />
                  <span className="text-sm font-light text-charcoal-700">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>
      )}

      {/* Fabric & embroidery */}
      {(product.fabric_main || (product.embroidery && product.embroidery.length > 0)) && (
        <Section background="white">
          <div className="grid gap-8 lg:grid-cols-2">
            {product.fabric_main && (
              <Reveal>
                <p className="heading-eyebrow">Fabric</p>
                <h3 className="mt-3 text-h3 font-serif font-medium text-navy-900">Premium Materials</h3>
                <ul className="mt-4 space-y-2">
                  {product.fabric_main && <li className="text-sm font-light text-charcoal-600">Main: {product.fabric_main}</li>}
                  {product.fabric_blouse && <li className="text-sm font-light text-charcoal-600">Blouse: {product.fabric_blouse}</li>}
                  {product.fabric_dupatta && <li className="text-sm font-light text-charcoal-600">Dupatta: {product.fabric_dupatta}</li>}
                </ul>
              </Reveal>
            )}
            {product.embroidery && product.embroidery.length > 0 && (
              <Reveal delay={120}>
                <p className="heading-eyebrow">Embroidery</p>
                <h3 className="mt-3 text-h3 font-serif font-medium text-navy-900">Hand Crafted Details</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.embroidery.map((e, i) => (
                    <span key={i} className="rounded-full bg-ivory-200 px-4 py-2 text-xs font-light text-charcoal-700">{e}</span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </Section>
      )}

      {/* Product story */}
      {product.story && (
        <Section background="navy" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="heading-eyebrow text-gold-300">The Story</p>
              <p className="mt-5 text-base font-light leading-relaxed text-ivory-200/80">{product.story}</p>
            </Reveal>
          </div>
        </Section>
      )}

      {/* Measurement guidance */}
      <Section background="ivory">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Ruler size={24} strokeWidth={1.25} />
            </span>
            <h2 className="mt-5 text-h2 font-serif font-medium text-navy-900">Measurement Guidance</h2>
            <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-500">
              Accurate measurements are the foundation of perfect couture. Explore our measurement options to ensure your piece fits flawlessly.
            </p>
            <ButtonLink to="/measurements" variant="primary" size="md" className="mt-6">
              Explore Measurement Options
            </ButtonLink>
          </div>
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section background="white">
        <Reveal>
          <p className="heading-eyebrow">Questions</p>
          <h2 className="mt-3 text-h2 font-serif font-medium text-navy-900">Frequently Asked</h2>
        </Reveal>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-luxury border border-navy-50 bg-ivory-100">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
                aria-expanded={openFaq === i}
              >
                <span className="text-sm font-medium text-navy-900">{faq.q}</span>
                {openFaq === i ? <Minus size={16} className="text-gold-600" /> : <Plus size={16} className="text-gold-600" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm font-light leading-relaxed text-charcoal-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Related products */}
      {related.length > 0 && (
        <Section background="ivory">
          <Reveal>
            <p className="heading-eyebrow">You May Also Love</p>
            <h2 className="mt-3 text-h2 font-serif font-medium text-navy-900">Related Pieces</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <Section background="white">
          <Reveal>
            <p className="heading-eyebrow">Recently Viewed</p>
            <h2 className="mt-3 text-h2 font-serif font-medium text-navy-900">Your Browsing History</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {/* Final CTA */}
      <Section background="navy" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
        <div className="relative text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-h2 font-serif font-medium text-ivory-100 text-balance">
              Ready to make this yours?
            </h2>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonAnchor
                href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
                target="_blank"
                rel="noreferrer"
                variant="gold"
                size="lg"
              >
                <MessageCircle size={18} /> Enquire on WhatsApp
              </ButtonAnchor>
              <Button variant="secondary" size="lg" onClick={open} className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300">
                <CalendarHeart size={18} /> Book Appointment
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Sticky mobile bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[85] flex items-center gap-2 border-t border-navy-50 bg-ivory-100/95 px-4 py-3 pb-safe backdrop-blur-md lg:hidden">
        <ButtonAnchor
          href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noreferrer"
          variant="gold"
          size="md"
          className="flex-1"
        >
          <MessageCircle size={16} /> WhatsApp
        </ButtonAnchor>
        <Button variant="secondary" size="md" onClick={open} className="flex-1">
          <CalendarHeart size={16} /> Book
        </Button>
        <a
          href={`tel:${site.contact.phoneRaw}`}
          aria-label="Call us"
          className="flex h-11 w-11 items-center justify-center rounded-luxury border border-navy-100 bg-white text-navy-900"
        >
          <Phone size={16} />
        </a>
        <a
          href={site.contact.mapsLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Get directions"
          className="flex h-11 w-11 items-center justify-center rounded-luxury border border-navy-100 bg-white text-navy-900"
        >
          <Navigation size={16} />
        </a>
      </div>

      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          index={activeImg}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActiveImg}
        />
      )}
    </>
  );
}
