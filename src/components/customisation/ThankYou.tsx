import { Check, MessageCircle, CalendarHeart, Home } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { useAppointment } from '@/context/AppointmentContext';
import { site } from '@/config/site';

type ThankYouProps = {
  formData: {
    name: string;
    mobile: string;
    whatsapp?: string;
    email?: string;
    outfitCategory?: string;
    occasion?: string;
    budget?: string;
    designStyle?: string;
    fabrics: string[];
    colors: string[];
    embroidery: string[];
    customisation: string[];
    additionalNotes?: string;
  };
  onReset: () => void;
};

export function ThankYou({ formData, onReset }: ThankYouProps) {
  const { open } = useAppointment();

  const whatsappMsg = encodeURIComponent(
    [
      `Hello ${site.name}, I've submitted a custom design request.`,
      '',
      `Name: ${formData.name}`,
      `Mobile: ${formData.mobile}`,
      ...(formData.outfitCategory ? [`Outfit: ${formData.outfitCategory}`] : []),
      ...(formData.occasion ? [`Occasion: ${formData.occasion}`] : []),
      ...(formData.budget ? [`Budget: ${formData.budget}`] : []),
      ...(formData.designStyle ? [`Style: ${formData.designStyle}`] : []),
      ...(formData.fabrics.length > 0 ? [`Fabrics: ${formData.fabrics.join(', ')}`] : []),
      ...(formData.colors.length > 0 ? [`Colours: ${formData.colors.join(', ')}`] : []),
      ...(formData.embroidery.length > 0 ? [`Embroidery: ${formData.embroidery.join(', ')}`] : []),
      ...(formData.customisation.length > 0 ? [`Customisation: ${formData.customisation.join(', ')}`] : []),
    ].join('\n'),
  );

  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <Reveal>
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-50 text-gold-600">
          <Check size={40} strokeWidth={1.25} />
        </span>
        <h2 className="mt-8 text-display font-serif font-medium text-navy-900 text-balance">
          Thank you for sharing your vision
        </h2>
        <p className="mt-5 text-lg font-light leading-relaxed text-charcoal-500">
          Our couture specialists will contact you shortly on WhatsApp.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ButtonAnchor
            href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noreferrer"
            variant="gold"
            size="lg"
          >
            <MessageCircle size={18} /> Continue to WhatsApp
          </ButtonAnchor>
          <Button variant="secondary" size="lg" onClick={open}>
            <CalendarHeart size={18} /> Book Appointment
          </Button>
          <ButtonLink to="/" variant="tertiary" size="lg" onClick={onReset}>
            <Home size={18} /> Return Home
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
