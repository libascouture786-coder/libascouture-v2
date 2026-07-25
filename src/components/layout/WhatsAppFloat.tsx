import { MessageCircle } from 'lucide-react';
import { site } from '@/config/site';

export function WhatsAppFloat() {
  return (
    <a
      href={site.contact.whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with LIBAS COUTURE on WhatsApp"
      className="group fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft-lg transition-transform duration-luxury ease-luxury hover:scale-105 md:bottom-7 md:right-7"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden />
      <MessageCircle size={26} strokeWidth={1.75} className="relative" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-luxury bg-navy-900 px-3 py-2 text-xs font-medium text-ivory-100 opacity-0 transition-opacity duration-luxury group-hover:opacity-100 md:block">
        Chat with us
      </span>
    </a>
  );
}
