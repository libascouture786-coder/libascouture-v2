import { ArrowRight, CalendarHeart, MessageCircle } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button, ButtonLink, ButtonAnchor } from '@/components/ui/Button';
import { MeasurementGuidance } from '@/components/measurement/MeasurementGuidance';
import { useAppointment } from '@/context/AppointmentContext';
import { site } from '@/config/site';

export function Measurements() {
  const { open } = useAppointment();

  return (
    <>
      <Seo
        title="Measurements"
        description="Luxury measurement guidance at LIBAS COUTURE — choose from showroom, video call, tailor, upload, or self-measurement options for perfect couture fit."
        canonical="https://libascouture.in/measurements"
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Measurements' }]} />

      {/* Hero */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-navy-900">
        <img
          src="/assets/images/embroidery/file_000000001c5871f49f2644bd4f567126.png"
          alt="Measurement guidance at LIBAS COUTURE"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/50" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Precision & Care</p>
            <h1 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
              Measurement Guidance
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-ivory-200/85">
              The foundation of perfect couture begins with accurate measurements. Choose the method that feels right for you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Introduction */}
      <Section background="ivory">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="heading-eyebrow">Why Measurements Matter</p>
            <h2 className="mt-4 text-h2 font-serif font-medium text-navy-900 text-balance">
              The Art of the Perfect Fit
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-charcoal-500">
              Every body is unique, and every silhouette should honour that uniqueness. Accurate measurements ensure your couture piece drapes, moves, and feels exactly as it should. There is no need to feel anxious — our experienced team will guide you through every step, making the process comfortable and reassuring.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Measurement Options */}
      <Section background="white">
        <MeasurementGuidance />
      </Section>

      {/* CTA */}
      <Section background="navy" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
        <div className="relative text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-h2 font-serif font-medium text-ivory-100 text-balance">
              Ready to begin your couture journey?
            </h2>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" onClick={open}>
                <CalendarHeart size={18} /> Book Appointment
              </Button>
              <ButtonAnchor href={site.contact.whatsappLink} target="_blank" rel="noreferrer" variant="secondary" size="lg" className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300">
                <MessageCircle size={18} /> Chat on WhatsApp
              </ButtonAnchor>
              <ButtonLink to="/create-your-own" variant="tertiary" size="lg" className="text-ivory-100 hover:text-gold-300">
                Create Your Own <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
