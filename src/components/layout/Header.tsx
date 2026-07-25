import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ChevronDown, Phone, MessageCircle, CalendarHeart } from 'lucide-react';
import { site, navigation, megaMenuCategories, megaMenuHighlights } from '@/config/site';
import { getImage } from '@/config/images';
import { useWishlist } from '@/context/WishlistContext';
import { useAppointment } from '@/context/AppointmentContext';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const location = useLocation();
  const { count } = useWishlist();
  const { open } = useAppointment();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-[60] overflow-hidden bg-navy-950 text-ivory-200/70">
        <div className="flex animate-marquee whitespace-nowrap py-2 text-[10px] uppercase tracking-[0.25em]">
          {site.announcements.map((a, i) => (
            <span key={i} className="mx-6 inline-block">
              {a}
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-[55] transition-all duration-luxury ease-luxury ${
          scrolled
            ? 'bg-ivory-100/95 backdrop-blur-md shadow-soft'
            : 'bg-ivory-100/80 backdrop-blur-sm'
        }`}
      >
        <div className="container-luxury flex items-center justify-between gap-4 py-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-luxury text-navy-900 transition-colors hover:bg-ivory-200 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label={site.name}>
            <img src={getImage('logo')} alt={site.name} className="h-9 w-auto object-contain md:h-11" loading="eager" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button className="flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-navy-900 transition-colors hover:text-gold-700">
                Collections <ChevronDown size={12} className={`transition-transform duration-luxury ${megaOpen ? 'rotate-180' : ''}`} />
              </button>
              {megaOpen && (
                <div className="absolute left-1/2 top-full z-10 w-[640px] -translate-x-1/2 pt-4">
                  <div className="grid grid-cols-3 gap-6 rounded-luxury-lg border border-navy-100 bg-ivory-100 p-6 shadow-soft-lg">
                    <div className="col-span-2 grid grid-cols-2 gap-x-5 gap-y-2">
                      {megaMenuCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/collections/${cat.slug}`}
                          className="group flex items-center gap-3 rounded-luxury p-2 transition-colors hover:bg-ivory-200"
                        >
                          <img src={getImage(cat.imageKey)} alt={cat.title} className="h-12 w-12 rounded-luxury object-cover" loading="lazy" />
                          <span className="text-sm font-light text-navy-900 group-hover:text-gold-700">{cat.title}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-l border-navy-100 pl-5">
                      <p className="heading-eyebrow mb-3">Highlights</p>
                      <ul className="space-y-2">
                        {megaMenuHighlights.map((h) => (
                          <li key={h}>
                            <Link to="/collections" className="text-sm font-light text-charcoal-600 hover:text-gold-700">
                              {h}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {navigation
              .filter((n) => n.href.startsWith('/collections') === false || n.href === '/collections')
              .filter((n) => !['Bridal Collection', 'Occasion Wear', 'Sarees', 'Suits'].includes(n.label))
              .map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-[0.15em] transition-colors hover:text-gold-700 ${
                      isActive ? 'text-gold-700' : 'text-navy-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-luxury text-navy-900 transition-colors hover:bg-ivory-200"
            >
              <Heart size={18} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-navy-900">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={open}
              className="hidden items-center gap-2 rounded-luxury bg-navy-900 px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-ivory-100 transition-colors hover:bg-navy-800 sm:flex"
            >
              <CalendarHeart size={14} /> Book
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-ivory-100 shadow-soft-lg animate-slide-in-right no-scrollbar">
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <img src={getImage('logo')} alt={site.name} className="h-8 w-auto" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-luxury text-navy-900 hover:bg-ivory-200">
                <X size={20} />
              </button>
            </div>
            <nav className="px-5 py-6" aria-label="Mobile">
              <p className="heading-eyebrow mb-3">Collections</p>
              <div className="grid grid-cols-2 gap-2">
                {megaMenuCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/collections/${cat.slug}`}
                    className="flex items-center gap-2.5 rounded-luxury p-2 hover:bg-ivory-200"
                  >
                    <img src={getImage(cat.imageKey)} alt={cat.title} className="h-10 w-10 rounded-luxury object-cover" loading="lazy" />
                    <span className="text-xs font-light text-navy-900">{cat.title}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-1 border-t border-navy-100 pt-4">
                {navigation
                  .filter((n) => !['Bridal Collection', 'Occasion Wear', 'Sarees', 'Suits'].includes(n.label))
                  .map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block py-2.5 text-sm font-light text-navy-900 hover:text-gold-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                <Link to="/appointments" className="block py-2.5 text-sm font-light text-navy-900 hover:text-gold-700">
                  Book Appointment
                </Link>
              </div>
              <div className="mt-6 flex flex-col gap-3 border-t border-navy-100 pt-4">
                <a href={site.contact.whatsappLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <a href={`tel:${site.contact.phoneRaw}`} className="btn-tertiary text-xs">
                  <Phone size={14} /> {site.contact.phoneDisplay}
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
