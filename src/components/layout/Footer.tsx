import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, MessageCircle, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { site, navigation, megaMenuCategories } from '@/config/site';
import { getImage } from '@/config/images';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-ivory-200/70">
      <div className="container-luxury py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={getImage('logo')} alt={site.name} className="h-10 w-auto object-contain brightness-0 invert" loading="lazy" />
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-ivory-200/60">
              {site.description}
            </p>
            <div className="mt-6 flex gap-3">
              <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory-200/15 text-ivory-200/60 transition-colors hover:border-gold-400 hover:text-gold-300">
                <Instagram size={15} />
              </a>
              <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory-200/15 text-ivory-200/60 transition-colors hover:border-gold-400 hover:text-gold-300">
                <Youtube size={15} />
              </a>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory-200/15 text-ivory-200/60 transition-colors hover:border-gold-400 hover:text-gold-300">
                <Facebook size={15} />
              </a>
              <a href={site.social.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory-200/15 text-ivory-200/60 transition-colors hover:border-gold-400 hover:text-gold-300">
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <p className="heading-eyebrow text-gold-400">Collections</p>
            <ul className="mt-4 space-y-2.5">
              {megaMenuCategories.slice(0, 8).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/collections/${cat.slug}`} className="text-sm font-light text-ivory-200/60 transition-colors hover:text-gold-300">
                    {cat.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="heading-eyebrow text-gold-400">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {navigation.filter((n) => !['Bridal Collection', 'Occasion Wear', 'Sarees', 'Suits'].includes(n.label)).map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm font-light text-ivory-200/60 transition-colors hover:text-gold-300">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/appointments" className="text-sm font-light text-ivory-200/60 transition-colors hover:text-gold-300">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm font-light text-ivory-200/60 transition-colors hover:text-gold-300">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="heading-eyebrow text-gold-400">Visit the Atelier</p>
            <ul className="mt-4 space-y-3.5">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
                <span className="text-sm font-light leading-relaxed text-ivory-200/60">{site.address.full}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold-400" />
                <a href={`tel:${site.contact.phoneRaw}`} className="text-sm font-light text-ivory-200/60 hover:text-gold-300">{site.contact.phoneDisplay}</a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold-400" />
                <a href={`mailto:${site.contact.email}`} className="text-sm font-light text-ivory-200/60 hover:text-gold-300">{site.contact.email}</a>
              </li>
            </ul>
            <div className="mt-5">
              <a href={site.contact.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-gold-400 hover:text-gold-300">
                Get Directions <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-ivory-200/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs font-light text-ivory-200/40">
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <p className="text-xs font-light text-ivory-200/40">
              Handcrafted with care in Chandni Chowk, Delhi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
