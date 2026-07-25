import { useState, useCallback } from 'react';
import {
  Store, MessageCircle, Video, Phone, Crown, MapPin, Clock, Train, Car, Navigation,
  ArrowRight,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ButtonLink } from '@/components/ui/Button';
import { AppointmentForm, type AppointmentFormState } from '@/components/appointment/AppointmentForm';
import { AppointmentConfirmation } from '@/components/appointment/AppointmentConfirmation';
import { site } from '@/config/site';
import { consultationTypes, businessHours, atelierAccessInfo } from '@/config/customisation';

const consultationIcons: Record<string, typeof Store> = {
  Store, MessageCircle, Video, Phone, Crown,
};

const accessIcons: Record<string, typeof Store> = {
  Train, Car, Navigation,
};

type SubmittedData = AppointmentFormState | null;

export function Appointments() {
  const [submitted, setSubmitted] = useState<SubmittedData>(null);

  const handleComplete = useCallback((data: AppointmentFormState) => {
    setSubmitted(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReset = useCallback(() => {
    setSubmitted(null);
  }, []);

  return (
    <>
      <Seo
        title="Book Appointment"
        description="Book a private consultation at the LIBAS COUTURE atelier in Chandni Chowk, Delhi. Showroom visits, WhatsApp, video, and premium bridal consultations available."
        canonical="https://libascouture.in/appointments"
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Appointments' }]} />

      {/* Hero */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden bg-navy-900">
        <img
          src={site.contact.mapsEmbed ? '/assets/images/branding/20260619_122046.jpg.jpeg' : ''}
          alt="Book a private consultation at LIBAS COUTURE"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/50" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Private Consultation</p>
            <h1 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
              Book Your Private Consultation
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-ivory-200/85">
              Reserve a private appointment at our Chandni Chowk atelier, or consult with us via WhatsApp, video, or phone — wherever you are.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Consultation Types */}
      <Section background="ivory">
        <Reveal>
          <div className="text-center">
            <p className="heading-eyebrow">Consultation Types</p>
            <h2 className="mt-4 text-h2 font-serif font-medium text-navy-900">Choose Your Experience</h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-500">
              Five ways to begin your couture journey with LIBAS COUTURE.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {consultationTypes.map((ct, i) => {
            const Icon = consultationIcons[ct.icon] ?? Store;
            return (
              <Reveal key={ct.value} delay={i * 80}>
                <div className="card-luxury h-full p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                    <Icon size={24} strokeWidth={1.25} />
                  </span>
                  <h3 className="mt-5 text-base font-serif font-medium text-navy-900">{ct.label}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-500">{ct.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Atelier Info + Map */}
      <Section background="white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Address & hours */}
          <Reveal>
            <p className="heading-eyebrow">Visit the Atelier</p>
            <h2 className="mt-3 text-h2 font-serif font-medium text-navy-900">LIBAS COUTURE</h2>
            <div className="mt-5 flex items-start gap-3 rounded-luxury border border-navy-50 bg-ivory-100 p-5">
              <MapPin size={20} className="mt-0.5 shrink-0 text-gold-600" />
              <div className="text-sm font-light leading-relaxed text-navy-900">
                <p>{site.address.line1}</p>
                <p>{site.address.line2}</p>
                <p>{site.address.city} - {site.address.pincode}</p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3">
              <Clock size={20} className="mt-0.5 shrink-0 text-gold-600" />
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Business Hours</p>
                <p className="mt-1 text-sm font-light text-navy-900">{businessHours.days}</p>
                <p className="text-sm font-light text-navy-900">{businessHours.display}</p>
              </div>
            </div>

            {/* Metro & Parking */}
            <div className="mt-6 space-y-4">
              {atelierAccessInfo.map((info, i) => {
                const Icon = accessIcons[info.icon] ?? Store;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <Icon size={18} className="mt-0.5 shrink-0 text-gold-500" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">{info.title}</p>
                      <p className="mt-0.5 text-sm font-light leading-relaxed text-charcoal-600">{info.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <a href={site.contact.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-gold-700 hover:underline">
                <Navigation size={14} /> Get Directions <ArrowRight size={12} />
              </a>
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

      {/* Appointment Form / Confirmation */}
      <Section background="ivory">
        {submitted ? (
          <AppointmentConfirmation data={submitted} onReset={handleReset} />
        ) : (
          <>
            <Reveal>
              <div className="mb-10 text-center">
                <p className="heading-eyebrow">Schedule Your Visit</p>
                <h2 className="mt-4 text-h2 font-serif font-medium text-navy-900">Appointment Form</h2>
                <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-500">
                  Fill in your details and our atelier will confirm your booking shortly.
                </p>
              </div>
            </Reveal>
            <div className="mx-auto max-w-2xl">
              <AppointmentForm onComplete={handleComplete} />
            </div>
          </>
        )}
      </Section>

      {/* CTA */}
      <Section background="navy" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
        <div className="relative text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-h2 font-serif font-medium text-ivory-100 text-balance">
              Prefer to explore first?
            </h2>
            <div className="mt-7">
              <ButtonLink to="/collections/bridal" variant="gold" size="lg">
                Explore Bridal Collection <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
