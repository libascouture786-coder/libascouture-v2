import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { collections, navigation, searchFacets, signatureCollections } from '@/config/site';
import { getImage } from '@/config/images';

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

type Suggestion = {
  label: string;
  type: 'Collection' | 'Occasion' | 'Embroidery' | 'Color' | 'Fabric' | 'Page';
  href: string;
};

const allSuggestions: Suggestion[] = [
  ...signatureCollections.map((c) => ({ label: c.title, type: 'Collection' as const, href: `/collections/${c.slug}` })),
  ...searchFacets.occasions.map((o) => ({ label: o, type: 'Occasion' as const, href: `/collections/bridal?occasion=${encodeURIComponent(o)}` })),
  ...searchFacets.embroideryStyles.map((e) => ({ label: e, type: 'Embroidery' as const, href: `/collections/bridal?embroidery=${encodeURIComponent(e)}` })),
  ...searchFacets.colors.map((c) => ({ label: c, type: 'Color' as const, href: `/collections/bridal?color=${encodeURIComponent(c)}` })),
  ...searchFacets.fabrics.map((f) => ({ label: f, type: 'Fabric' as const, href: `/collections/bridal?fabric=${encodeURIComponent(f)}` })),
  ...navigation.map((n) => ({ label: n.label, type: 'Page' as const, href: n.href })),
];

const trendingSearches = ['Bridal Lehenga', 'Zardozi Embroidery', 'Ivory Bridal', 'Reception Gown', 'Walima Outfit'];

const typeColor: Record<Suggestion['type'], string> = {
  Collection: 'text-navy-700 bg-navy-50',
  Occasion: 'text-gold-700 bg-gold-50',
  Embroidery: 'text-gold-700 bg-gold-50',
  Color: 'text-gold-700 bg-gold-50',
  Fabric: 'text-gold-700 bg-gold-50',
  Page: 'text-charcoal-600 bg-ivory-200',
};

const RECENT_KEY = 'libas.recent_searches';

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecent(q: string) {
  const list = getRecent().filter((s) => s.toLowerCase() !== q.toLowerCase());
  list.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    setRecent(getRecent());
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSuggestions.filter((s) => s.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => setActiveIndex(0), [query]);

  const go = (href: string) => {
    if (query.trim()) addRecent(query.trim());
    onClose();
    navigate(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex].href);
    }
  };

  if (!open) return null;

  const showEmpty = query.trim().length > 0 && results.length === 0;

  return (
    <div className="fixed inset-0 z-[105]">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search LIBAS COUTURE"
        className="relative mx-auto mt-0 max-w-2xl bg-ivory-100 shadow-soft-lg animate-fade-up md:mt-20"
      >
        {/* Search field */}
        <div className="flex items-center gap-3 border-b border-gold-100 px-5 py-4 sm:px-7">
          <Search size={20} strokeWidth={1.5} className="text-charcoal-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search collections, occasions, embroidery, fabrics..."
            className="flex-1 bg-transparent text-base text-navy-900 placeholder:text-charcoal-300 focus:outline-none"
            aria-label="Search"
            aria-controls="search-results"
          />
          <button onClick={onClose} aria-label="Close search" className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-500 transition-colors hover:bg-ivory-200 hover:text-navy-900">
            <X size={18} />
          </button>
        </div>

        <div id="search-results" className="max-h-[60vh] overflow-y-auto p-3 no-scrollbar">
          {/* Empty / no results */}
          {showEmpty ? (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full bg-ivory-200">
                <img src={getImage('notFound')} alt="" className="h-full w-full object-cover opacity-70" loading="lazy" />
              </div>
              <p className="font-serif text-xl text-navy-900">No exact matches for "{query}"</p>
              <p className="mt-2 text-sm font-light text-charcoal-500">Explore our signature collections instead, or reach us directly.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {collections.slice(0, 4).map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => go(`/collections/${c.slug}`)}
                    className="rounded-luxury border border-navy-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-navy-900 transition-colors hover:border-gold-400 hover:text-gold-700"
                  >
                    {c.title}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <button onClick={() => go('/contact')} className="btn-secondary mt-2">
                  Contact Us
                </button>
              </div>
            </div>
          ) : query.trim().length === 0 ? (
            /* Default view: trending + recent + collections */
            <div className="space-y-6 p-2">
              {recent.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal-400">
                    <Clock size={12} /> Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => setQuery(r)}
                        className="rounded-luxury bg-ivory-200 px-3 py-1.5 text-xs font-light text-charcoal-600 transition-colors hover:bg-gold-50 hover:text-gold-700"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal-400">
                  <TrendingUp size={12} /> Trending Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="rounded-luxury border border-navy-100 px-3 py-1.5 text-xs font-light text-charcoal-600 transition-colors hover:border-gold-400 hover:text-gold-700"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal-400">Trending Collections</p>
                <div className="grid grid-cols-3 gap-3">
                  {signatureCollections.slice(0, 6).map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => go(`/collections/${c.slug}`)}
                      className="group flex flex-col items-center text-center"
                    >
                      <div className="zoom-wrap relative h-16 w-16 overflow-hidden rounded-full bg-ivory-200 ring-1 ring-transparent transition-all duration-luxury group-hover:ring-gold-300">
                        <img src={getImage(c.imageKey)} alt={c.title} loading="lazy" className="zoom-img" />
                      </div>
                      <span className="mt-1.5 text-[11px] font-light text-charcoal-600 group-hover:text-navy-900">{c.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results */
            <ul role="listbox">
              {results.map((s, i) => (
                <li key={`${s.type}-${s.label}`} role="option" aria-selected={i === activeIndex}>
                  <button
                    onClick={() => go(s.href)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center justify-between rounded-luxury px-4 py-3 text-left transition-colors ${
                      i === activeIndex ? 'bg-white' : 'hover:bg-white/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${typeColor[s.type]}`}>
                        {s.type}
                      </span>
                      <span className="font-serif text-base text-navy-900">{s.label}</span>
                    </span>
                    <ArrowRight size={16} className="text-gold-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-gold-100 px-5 py-3 text-center text-[11px] font-light text-charcoal-400">
          Press <kbd className="rounded bg-ivory-200 px-1.5 py-0.5 font-sans">Esc</kbd> to close · <kbd className="rounded bg-ivory-200 px-1.5 py-0.5 font-sans">/</kbd> to search
        </div>
      </div>
    </div>
  );
}
