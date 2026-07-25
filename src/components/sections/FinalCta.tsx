import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { site } from '@/config/site';
import { getImage } from '@/config/images';
import { useAppointment } from '@/context/AppointmentContext';
import { CalendarHeart, MessageCircle, ArrowRight } from 'lucide-react';

export function FinalCta() {
  const { open } = useAppointment();

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[65vh] min-h-[440px]">
        <img
          src={getImage('hero.secondary')}
          alt="Begin your couture journey with LIBAS COUTURE"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/70" aria-hidden />
        <div className="container-luxury relative flex h-full items-center justify-center text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Your Couture Journey Awaits</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-display font-serif font-medium text-ivory-100 text-balance">
              Let's Create Your Dream Bridal Look
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-ivory-200/85">
              Schedule a personal consultation with LIBAS COUTURE and begin your couture journey.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" onClick={open}>
                <CalendarHeart size={18} /> Book Appointment
              </Button>
              <ButtonAnchor href={site.contact.whatsappLink} target="_blank" rel="noreferrer" variant="secondary" size="lg" className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300">
                <MessageCircle size={18} /> Chat on WhatsApp
              </ButtonAnchor>
              <ButtonLink to="/collections/bridal" variant="tertiary" size="lg" className="text-ivory-100 hover:text-gold-300">
                Explore Collection <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
