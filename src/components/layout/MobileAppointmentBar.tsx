import { CalendarHeart, MessageCircle, MapPin } from 'lucide-react';
import { site } from '@/config/site';
import { useAppointment } from '@/context/AppointmentContext';

export function MobileAppointmentBar() {
  const { open } = useAppointment();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] md:hidden">
      <div className="flex items-stretch border-t border-gold-200/50 bg-ivory-100/95 backdrop-blur-md shadow-soft-lg">
        <button
          onClick={open}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-navy-900 transition-colors hover:bg-ivory-200"
        >
          <CalendarHeart size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">Book</span>
        </button>
        <a
          href={site.contact.whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-1 border-l border-gold-200/50 text-[#25D366] transition-colors hover:bg-ivory-200"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">WhatsApp</span>
        </a>
        <a
          href={site.contact.mapsLink}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-1 border-l border-gold-200/50 text-navy-900 transition-colors hover:bg-ivory-200"
          aria-label="Get directions to our atelier"
        >
          <MapPin size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.12em]">Directions</span>
        </a>
      </div>
    </div>
  );
}
