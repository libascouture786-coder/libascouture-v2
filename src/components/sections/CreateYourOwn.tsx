import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonLink } from '@/components/ui/Button';
import { getImage } from '@/config/images';
import { useAppointment } from '@/context/AppointmentContext';
import { Wand2 } from 'lucide-react';

export function CreateYourOwn() {
  const { open } = useAppointment();

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[60vh] min-h-[420px]">
        <img
          src={getImage('home.createYourOwn')}
          alt="Create your dream outfit with LIBAS COUTURE bespoke atelier"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/65" aria-hidden />
        <div className="container-luxury relative flex h-full items-center justify-center text-center">
          <Reveal>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/40 text-gold-300">
              <Wand2 size={26} strokeWidth={1.25} />
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-display font-serif font-medium text-ivory-100 text-balance">
              Create Your Dream Outfit
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base font-light leading-relaxed text-ivory-200/85">
              Share your inspiration and let LIBAS COUTURE transform your vision into reality — a one-of-a-kind silhouette, hand-embroidered exclusively for you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink to="/create-your-own" variant="gold" size="lg">
                Start Custom Design
              </ButtonLink>
              <Button variant="secondary" size="lg" onClick={open} className="border-ivory-200/30 text-ivory-100 hover:border-gold-300 hover:text-gold-300">
                Book Consultation
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
