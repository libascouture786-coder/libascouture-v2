import {
  Check, MessageCircle, ArrowRight, Calendar, Clock, MapPin, Phone, Mail,
  Store, Video, Crown, RotateCcw, XCircle,
} from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { site } from '@/config/site';
import type { AppointmentFormState } from './AppointmentForm';

const consultationLabels: Record<string, string> = {
  showroom_visit: 'Showroom Visit',
  whatsapp: 'WhatsApp Consultation',
  video: 'Video Consultation',
  phone: 'Phone Consultation',
  premium_bridal: 'Premium Bridal Consultation',
};

const consultationIcons: Record<string, typeof Store> = {
  showroom_visit: Store,
  whatsapp: MessageCircle,
  video: Video,
  phone: Phone,
  premium_bridal: Crown,
};

type AppointmentConfirmationProps = {
  data: AppointmentFormState;
  onReset: () => void;
};

export function AppointmentConfirmation({ data, onReset }: AppointmentConfirmationProps) {
  const consultationLabel = consultationLabels[data.consultationType] ?? data.consultationType;
  const ConsultationIcon = consultationIcons[data.consultationType] ?? Check;

  const whatsappMsg = encodeURIComponent(
    [
      `Hello ${site.name}, I've booked an appointment.`,
      '',
      `Name: ${data.name}`,
      `Mobile: ${data.mobile}`,
      `Consultation: ${consultationLabel}`,
      `Date: ${data.preferredDate}`,
      `Time: ${data.preferredTime}`,
      ...(data.occasion ? [`Occasion: ${data.occasion}`] : []),
      ...(data.budget ? [`Budget: ${data.budget}`] : []),
      ...(data.notes ? [`Notes: ${data.notes}`] : []),
    ].join('\n'),
  );

  const isShowroom = data.consultationType === 'showroom_visit' || data.consultationType === 'premium_bridal';

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Reveal>
        {/* Success icon */}
        <div className="text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-50 text-gold-600">
            <Check size={40} strokeWidth={1.25} />
          </span>
          <h2 className="mt-8 text-display font-serif font-medium text-navy-900 text-balance">
            Appointment Requested
          </h2>
          <p className="mt-4 text-base font-light leading-relaxed text-charcoal-500">
            Thank you, {data.name}. Your appointment request has been received. Our atelier will confirm your booking shortly on WhatsApp.
          </p>
        </div>

        {/* Appointment summary card */}
        <div className="mt-8 rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-4 border-b border-navy-50 pb-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <ConsultationIcon size={24} strokeWidth={1.25} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Consultation Type</p>
              <p className="mt-0.5 text-base font-serif font-medium text-navy-900">{consultationLabel}</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="shrink-0 text-gold-500" />
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Date</dt>
                <dd className="text-sm font-light text-navy-900">{data.preferredDate}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="shrink-0 text-gold-500" />
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Time</dt>
                <dd className="text-sm font-light text-navy-900">{data.preferredTime}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="shrink-0 text-gold-500" />
              <div>
                <dt className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Mobile</dt>
                <dd className="text-sm font-light text-navy-900">{data.mobile}</dd>
              </div>
            </div>
            {data.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-gold-500" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Email</dt>
                  <dd className="text-sm font-light text-navy-900">{data.email}</dd>
                </div>
              </div>
            )}
            {data.occasion && (
              <div className="flex items-center gap-3">
                <Crown size={16} className="shrink-0 text-gold-500" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Occasion</dt>
                  <dd className="text-sm font-light text-navy-900">{data.occasion}</dd>
                </div>
              </div>
            )}
            {data.budget && (
              <div className="flex items-center gap-3">
                <Check size={16} className="shrink-0 text-gold-500" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Budget</dt>
                  <dd className="text-sm font-light text-navy-900">{data.budget}</dd>
                </div>
              </div>
            )}
          </dl>

          {isShowroom && (
            <div className="mt-5 rounded-luxury border border-gold-100 bg-gold-50 p-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-600" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-gold-800">Visit Our Atelier</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-charcoal-700">{site.address.full}</p>
                  <a href={site.contact.mapsLink} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-gold-700 hover:underline">
                    Get Directions <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {data.notes && (
            <div className="mt-5 border-t border-navy-50 pt-4">
              <p className="text-xs uppercase tracking-[0.1em] text-charcoal-400">Notes</p>
              <p className="mt-1 text-sm font-light text-charcoal-600">{data.notes}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <ButtonAnchor
            href={`https://wa.me/${site.contact.whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noreferrer"
            variant="gold"
            size="lg"
          >
            <MessageCircle size={18} /> Continue to WhatsApp
          </ButtonAnchor>
          <ButtonLink to="/collections/bridal" variant="secondary" size="lg">
            Explore Collections <ArrowRight size={16} className="ml-1" />
          </ButtonLink>
          <ButtonLink to="/" variant="tertiary" size="lg" onClick={onReset}>
            Return Home
          </ButtonLink>
        </div>

        {/* Reschedule & Cancel */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <button className="flex items-center gap-1.5 text-xs font-light text-charcoal-400 transition-colors hover:text-gold-700">
            <RotateCcw size={12} /> Reschedule
          </button>
          <button className="flex items-center gap-1.5 text-xs font-light text-charcoal-400 transition-colors hover:text-red-500">
            <XCircle size={12} /> Cancel Appointment
          </button>
        </div>

        {/* Email confirmation note */}
        {data.email && (
          <p className="mt-6 text-center text-xs font-light text-charcoal-400">
            A confirmation email will be sent to {data.email} once your appointment is confirmed.
          </p>
        )}
      </Reveal>
    </div>
  );
}
