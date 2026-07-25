import { CalendarHeart, MessageCircle } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonAnchor, Button } from '@/components/ui/Button';
import { site } from '@/config/site';
import { useAppointment } from '@/context/AppointmentContext';

export function CtaSection() {
  const { open } = useAppointment();
  return (
    <Section background="navy" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-40" aria-hidden />
      <div className="relative text-center">
        <Reveal>
          <p className="heading-eyebrow text-gold-400">Begin Your Couture Journey</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-display font-serif font-medium text-ivory-100 text-balance">
            Your dream silhouette awaits a private audience
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-ivory-200/70">
            Reserve a private appointment at our Chandni Chowk atelier, or reach us instantly on WhatsApp. Every couture journey begins with a conversation.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="gold" size="lg" onClick={open}>
              <CalendarHeart size={18} /> Book Appointment
            </Button>
            <ButtonAnchor
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="lg"
              className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </ButtonAnchor>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
