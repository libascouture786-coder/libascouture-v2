import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { megaMenuCategories, megaMenuHighlights } from '@/config/site';
import { getImage } from '@/config/images';

type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

const quickLinks = [
  { label: 'Create Your Own',      href: '/create-your-own', desc: 'Co-create a one-of-a-kind silhouette' },
  { label: 'Book Appointment',     href: '/contact',         desc: 'Reserve a private consultation' },
  { label: 'Visit Showroom',       href: '/contact',         desc: 'Our Chandni Chowk atelier' },
  { label: 'Real Brides',          href: '/#real-brides',     desc: 'Authentic bridal moments' },
  { label: 'About LIBAS COUTURE',  href: '/about',            desc: 'The house story' },
  { label: 'Contact',              href: '/contact',          desc: 'Reach the atelier' },
];

export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const activeCategory = megaMenuCategories[activeIndex];

  return (
    <div
      className="absolute inset-x-0 top-full z-50 hidden md:block"
      onMouseLeave={onClose}
    >
      <div className="absolute inset-0 -z-10 bg-navy-950/40 backdrop-blur-[3px] animate-fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="menu"
        className="relative mx-auto mt-px max-w-luxury bg-ivory-100 shadow-soft-lg animate-fade-up"
      >
        <div className="grid grid-cols-12 gap-0">
          {/* Left: featured editorial image */}
          <div className="col-span-4 bg-navy-900 p-8">
            <div className="zoom-wrap relative aspect-[3/4] w-full overflow-hidden rounded-luxury-lg bg-navy-800">
              <img
                key={activeCategory.imageKey}
                src={getImage(activeCategory.imageKey)}
                alt={activeCategory.title}
                loading="lazy"
                decoding="async"
                className="zoom-img animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="heading-eyebrow text-gold-300">Seasonal Collection</p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-ivory-100">{activeCategory.title}</h3>
                <p className="mt-1.5 text-sm font-light text-ivory-200/80">
                  Handcrafted masterpieces designed for timeless celebrations.
                </p>
                <Link
                  to={`/collections/${activeCategory.slug}`}
                  onClick={onClose}
                  className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-300 hover:text-gold-200"
                >
                  Explore <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Center: main categories */}
          <div className="col-span-5 bg-ivory-100 p-8">
            <p className="heading-eyebrow mb-5">Collections</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {megaMenuCategories.map((cat, i) => (
                <Link
                  key={cat.slug}
                  to={`/collections/${cat.slug}`}
                  role="menuitem"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={onClose}
                  className={`group flex items-center justify-between rounded-luxury px-3 py-2.5 text-sm transition-colors duration-luxury ${
                    i === activeIndex ? 'bg-white text-navy-900' : 'text-charcoal-700 hover:bg-white/60 hover:text-navy-900'
                  }`}
                >
                  <span className="font-serif font-light">{cat.title}</span>
                  <ChevronRight
                    size={14}
                    className={`text-gold-500 transition-all duration-luxury ${i === activeIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: quick links */}
          <div className="col-span-3 border-l border-gold-100/60 bg-ivory-50 p-8">
            <p className="heading-eyebrow mb-5">Quick Links</p>
            <ul className="space-y-1">
              {quickLinks.map((ql) => (
                <li key={ql.label}>
                  <Link
                    to={ql.href}
                    onClick={onClose}
                    className="group block rounded-luxury px-3 py-2.5 transition-colors duration-luxury hover:bg-white"
                  >
                    <span className="font-serif text-sm font-medium text-navy-900">{ql.label}</span>
                    <span className="mt-0.5 block text-xs font-light text-charcoal-400">{ql.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom: highlights */}
        <div className="flex items-center gap-6 border-t border-gold-100/60 bg-ivory-50 px-8 py-4">
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gold-600">
            <Sparkles size={13} /> Highlights
          </span>
          {megaMenuHighlights.map((h) => (
            <Link
              key={h}
              to="/collections/bridal"
              onClick={onClose}
              className="link-underline text-xs font-light text-charcoal-600 transition-colors hover:text-navy-900"
            >
              {h}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
