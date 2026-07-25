import { MapPin, Phone, Mail, MessageCircle, Clock, Navigation } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { site } from '@/config/site';
import { getImage } from '@/config/images';
import { useAppointment } from '@/context/AppointmentContext';

export function Contact() {
  const { open } = useAppointment();

  return (
    <>
      <Seo
        title="Contact"
        description="Visit the LIBAS COUTURE atelier in Chandni Chowk, Delhi, or book a private appointment for bespoke bridal couture."
        canonical="https://libascouture.in/contact"
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      {/* Hero */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-navy-900">
        <img
          src={getImage('category.contact')}
          alt="LIBAS COUTURE atelier"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/40" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Visit the Atelier</p>
            <h1 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
              We look forward to welcoming you
            </h1>
          </Reveal>
        </div>
      </section>

      <Section background="ivory">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact info */}
          <Reveal>
            <h2 className="text-h2 font-serif font-medium text-navy-900">Reach the house</h2>
            <p className="mt-4 text-base font-light leading-relaxed text-charcoal-600">
              Whether you wish to book a private consultation, commission a bespoke silhouette, or simply learn more, our atelier is at your service.
            </p>

            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <MapPin size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Atelier</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-navy-900">{site.address.full}</p>
                  <a href={site.contact.mapsLink} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gold-700 hover:underline">
                    <Navigation size={12} /> Get Directions
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Phone size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Phone</p>
                  <a href={`tel:${site.contact.phoneRaw}`} className="mt-1 block text-sm font-light text-navy-900 hover:text-gold-700">
                    {site.contact.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Mail size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Email</p>
                  <a href={`mailto:${site.contact.email}`} className="mt-1 block text-sm font-light text-navy-900 hover:text-gold-700">
                    {site.contact.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Clock size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Hours</p>
                  <ul className="mt-1 space-y-1">
                    {site.hours.map((h) => (
                      <li key={h.day} className="text-sm font-light text-navy-900">
                        <span className="text-charcoal-500">{h.day}:</span> {h.time}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink to="/appointments" variant="gold" size="md">
                Book Appointment
              </ButtonLink>
              <Button variant="secondary" size="md" onClick={open}>
                Quick Book
              </Button>
              <ButtonAnchor href={site.contact.whatsappLink} target="_blank" rel="noreferrer" variant="secondary" size="md">
                <MessageCircle size={16} /> WhatsApp
              </ButtonAnchor>
            </div>
          </Reveal>

          {/* Map */}
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-luxury-lg border border-navy-100 bg-ivory-200 shadow-soft">
              <iframe
                title="LIBAS COUTURE location on Google Maps"
                src={site.contact.mapsEmbed}
                className="h-[420px] w-full lg:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, minHeight: '420px' }}
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
