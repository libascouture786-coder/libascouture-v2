import { MapPin, Navigation, CalendarHeart, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { site } from '@/config/site';
import { getImage } from '@/config/images';
import { useAppointment } from '@/context/AppointmentContext';

export function VisitAtelier() {
  const { open } = useAppointment();

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[520px]">
        <img
          src={getImage('home.atelierBanner')}
          alt="Visit the LIBAS COUTURE atelier in Chandni Chowk, Delhi"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/70" aria-hidden />
        <div className="container-luxury relative flex min-h-[520px] items-center">
          <div className="max-w-xl py-16">
            <Reveal>
              <p className="heading-eyebrow text-gold-300">Visit Our Atelier</p>
              <h2 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
                Experience Luxury In Person
              </h2>
              <p className="mt-5 max-w-md text-base font-light leading-relaxed text-ivory-200/85">
                Visit our Chandni Chowk showroom and experience handcrafted couture with a personal consultation.
              </p>
              <div className="mt-7 flex items-start gap-3 rounded-luxury border border-ivory-200/15 bg-navy-900/40 p-5">
                <MapPin size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold-400" />
                <div className="text-sm font-light text-ivory-200/80">
                  <p className="font-serif text-base font-medium text-ivory-100">{site.name}</p>
                  <p className="mt-1">{site.address.line1}</p>
                  <p>{site.address.line2}</p>
                  <p>{site.address.city} - {site.address.pincode}</p>
                </div>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonAnchor href={site.contact.mapsLink} target="_blank" rel="noreferrer" variant="gold" size="md">
                  <Navigation size={16} /> Get Directions
                </ButtonAnchor>
                <Button variant="secondary" size="md" onClick={open} className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300">
                  <CalendarHeart size={16} /> Book Appointment
                </Button>
                <ButtonAnchor href={site.contact.whatsappLink} target="_blank" rel="noreferrer" variant="secondary" size="md" className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300">
                  <MessageCircle size={16} /> Chat on WhatsApp
                </ButtonAnchor>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
