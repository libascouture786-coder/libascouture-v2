import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, ChevronRight, ChevronDown, Instagram, Youtube, Facebook,
  CalendarHeart, MessageCircle, Phone, MapPin,
} from 'lucide-react';
import { site } from '@/config/site';
import { Logo } from './Logo';
import { useAppointment } from '@/context/AppointmentContext';

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

const mainLinks = [
  { label: 'Home',             href: '/' },
  { label: 'All Collections',  href: '/collections' },
  { label: 'Bridal Collection',href: '/collections/bridal' },
  { label: 'Sarees',           href: '/collections/sarees' },
  { label: 'Suits',            href: '/collections/suits' },
  { label: 'Indo Western',     href: '/collections/indo-western' },
  { label: 'Create Your Own',  href: '/create-your-own' },
  { label: 'Real Brides',      href: '/#real-brides' },
  { label: 'About',            href: '/about' },
  { label: 'Contact',          href: '/contact' },
];

const occasionSubLinks = [
  { label: 'Bridal',     href: '/collections/bridal' },
  { label: 'Reception',  href: '/collections/reception' },
  { label: 'Engagement', href: '/collections/engagement' },
  { label: 'Mehendi',    href: '/collections/mehendi' },
  { label: 'Haldi',      href: '/collections/haldi' },
  { label: 'Sangeet',    href: '/collections/sangeet' },
  { label: 'Nikah',      href: '/collections/nikah' },
  { label: 'Walima',     href: '/collections/walima' },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const { open: openAppointment } = useAppointment();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-ivory-100 shadow-soft-lg animate-slide-in-right"
      >
        {/* Top: logo + close */}
        <div className="flex items-center justify-between border-b border-gold-100 px-5 py-4">
          <Logo size="sm" to="/" onClick={onClose} />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-600 transition-colors hover:bg-ivory-200 hover:text-navy-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 no-scrollbar">
          <ul className="space-y-0.5">
            {mainLinks.slice(0, 3).map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className="group flex items-center justify-between rounded-luxury px-4 py-3.5 text-navy-900 transition-colors duration-luxury hover:bg-white"
                >
                  <span className="font-serif text-base font-medium">{item.label}</span>
                  <ChevronRight size={16} className="text-gold-500 transition-transform duration-luxury group-hover:translate-x-1" />
                </Link>
              </li>
            ))}

            {/* Expandable: Occasion Wear */}
            <li>
              <button
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="group flex w-full items-center justify-between rounded-luxury px-4 py-3.5 text-navy-900 transition-colors duration-luxury hover:bg-white"
              >
                <span className="font-serif text-base font-medium">Occasion Wear</span>
                <ChevronDown
                  size={16}
                  className={`text-gold-500 transition-transform duration-luxury ${expanded ? 'rotate-180' : ''}`}
                />
              </button>
              {expanded && (
                <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-gold-100 pl-3 animate-fade-in">
                  {occasionSubLinks.map((sub) => (
                    <li key={sub.href}>
                      <Link
                        to={sub.href}
                        onClick={onClose}
                        className="flex items-center justify-between rounded-luxury px-3 py-2.5 text-sm font-light text-charcoal-600 transition-colors hover:bg-white hover:text-navy-900"
                      >
                        {sub.label}
                        <ChevronRight size={13} className="text-gold-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {mainLinks.slice(3).map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  className="group flex items-center justify-between rounded-luxury px-4 py-3.5 text-navy-900 transition-colors duration-luxury hover:bg-white"
                >
                  <span className="font-serif text-base font-medium">{item.label}</span>
                  <ChevronRight size={16} className="text-gold-500 transition-transform duration-luxury group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: fixed actions */}
        <div className="border-t border-gold-100 bg-ivory-50 px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); openAppointment(); }}
              className="flex items-center justify-center gap-2 rounded-luxury bg-navy-900 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-ivory-100 transition-colors hover:bg-navy-800"
            >
              <CalendarHeart size={15} /> Book
            </button>
            <a
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-luxury bg-[#25D366] px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a
              href={`tel:${site.contact.phoneRaw}`}
              className="flex items-center justify-center gap-2 rounded-luxury border border-navy-100 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-navy-900 transition-colors hover:border-gold-400 hover:text-gold-700"
            >
              <Phone size={15} /> Call
            </a>
            <a
              href={site.contact.mapsLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-luxury border border-navy-100 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-navy-900 transition-colors hover:border-gold-400 hover:text-gold-700"
            >
              <MapPin size={15} /> Directions
            </a>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-900 transition-colors hover:border-gold-400 hover:text-gold-700">
              <Instagram size={16} strokeWidth={1.5} />
            </a>
            <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-900 transition-colors hover:border-gold-400 hover:text-gold-700">
              <Youtube size={16} strokeWidth={1.5} />
            </a>
            <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-900 transition-colors hover:border-gold-400 hover:text-gold-700">
              <Facebook size={16} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
