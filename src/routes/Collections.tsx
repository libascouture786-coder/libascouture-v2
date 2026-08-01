import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumb, type Crumb } from '@/components/layout/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { FilterBar, FilterSheet, MobileFilterButton, defaultFilters, applyFilters, type FilterState } from '@/components/product/FilterBar';
import { useActiveProducts } from '@/hooks/useProducts';
import { getImage } from '@/config/images';
import { collections, slugLabels } from '@/config/site';
import { breadcrumbSchema, SITE_URL } from '@/lib/seo';
import type { ProductWithImages } from '@/lib/types';

const PAGE_SIZE = 8;

export function Collections() {
  const { slug } = useParams<{ slug?: string }>();
  const { data: products, loading, error: networkError, refetch } = useActiveProducts();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [quickView, setQuickView] = useState<ProductWithImages | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [slug, filters]);

  const collectionSlug = slug ?? '';
  const collectionTitle = slugLabels[collectionSlug] ?? 'All Collections';
  const collectionExcerpt = collections.find((c) => c.slug === collectionSlug)?.excerpt ?? 'Explore our curated collections of hand-embroidered couture.';

  let filtered = products;
  if (collectionSlug) {
    filtered = filtered.filter(
      (p) =>
        p.category_slug === collectionSlug ||
        (p.occasions ?? []).some((o) => o.toLowerCase() === collectionSlug.toLowerCase()) ||
        p.occasion?.toLowerCase() === collectionSlug.toLowerCase(),
    );
  }
  filtered = applyFilters(filtered, filters);

  const activeFilterCount =
    filters.occasions.length + filters.colors.length + filters.fabrics.length + filters.embroidery.length + (filters.new ? 1 : 0) + (filters.featured ? 1 : 0);

  const crumbs: Crumb[] = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    ...(collectionSlug ? [{ label: collectionTitle } as Crumb] : []),
  ];

  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <Seo
        title={collectionTitle}
        description={collectionExcerpt}
        canonical={`https://libascouture.in/collections${collectionSlug ? `/${collectionSlug}` : ''}`}
        jsonLd={breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Collections', url: `${SITE_URL}/collections` },
          ...(collectionSlug ? [{ name: slugLabels[collectionSlug] ?? collectionSlug, url: `${SITE_URL}/collections/${collectionSlug}` }] : []),
        ])}
      />
      <Breadcrumb items={crumbs} />

      {/* Collection header */}
      <section className="relative overflow-hidden bg-navy-900">
        <img
          src={getImage(`category.${collectionSlug || 'bridal'}`)}
          alt={collectionTitle}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/40" aria-hidden />
        <div className="container-luxury relative py-16 text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Collections</p>
            <h1 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">{collectionTitle}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-ivory-200/80">{collectionExcerpt}</p>
          </Reveal>
        </div>
      </section>

      {/* Related categories */}
      <div className="border-b border-navy-50 bg-white">
        <div className="container-luxury flex items-center gap-4 overflow-x-auto py-4 no-scrollbar">
          <Link
            to="/collections"
            className={`shrink-0 text-xs uppercase tracking-[0.1em] transition-colors ${!collectionSlug ? 'text-gold-700' : 'text-charcoal-400 hover:text-gold-700'}`}
          >
            All
          </Link>
          {collections.map((col) => (
            <Link
              key={col.slug}
              to={`/collections/${col.slug}`}
              className={`shrink-0 text-xs uppercase tracking-[0.1em] transition-colors ${collectionSlug === col.slug ? 'text-gold-700' : 'text-charcoal-400 hover:text-gold-700'}`}
            >
              {col.title}
            </Link>
          ))}
        </div>
      </div>

      <Section background="ivory">
        {/* Search + filters */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
            <input
              type="search"
              placeholder="Search collections..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-luxury pl-11"
              aria-label="Search products"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <MobileFilterButton onClick={() => setSheetOpen(true)} activeCount={activeFilterCount} />
            <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-luxury-lg" />
            ))}
          </div>
        ) : networkError ? (
          <EmptyState
            title="Connection issue"
            message="We couldn't load the collection. Please check your connection and try again."
            action={
              <Button variant="primary" onClick={refetch}>
                Try Again
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={filters.search ? 'No matches found' : 'No pieces found'}
            message={filters.search ? `We couldn't find any pieces matching "${filters.search}". Try adjusting your search or filters.` : 'Try adjusting your filters to discover more of our collection.'}
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-12 text-center">
                <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className="btn-secondary">
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} filters={filters} onChange={setFilters} />
      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
