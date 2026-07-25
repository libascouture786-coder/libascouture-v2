import { useState } from 'react';
import {
  Store, Video, Scissors, Upload, Home as HomeIcon,
  ChevronDown, Check, Ruler, ArrowRight,
} from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { site } from '@/config/site';
import { measurementOptions } from '@/config/customisation';

const optionIcons: Record<string, typeof Store> = {
  Store, Video, Scissors, Upload, Home: HomeIcon,
};

type MeasurementGuidanceProps = {
  compact?: boolean;
  customisationRequestId?: string;
};

export function MeasurementGuidance({ compact = false, customisationRequestId }: MeasurementGuidanceProps) {
  const [selected, setSelected] = useState<string>('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { notify } = useToast();

  const handleSubmit = async () => {
    if (!selected) { notify('Please select a measurement method.', 'error'); return; }
    if (!name.trim()) { notify('Please share your name.', 'error'); return; }
    if (!mobile.trim()) { notify('Please share your mobile number.', 'error'); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('measurement_preferences').insert({
        customisation_request_id: customisationRequestId ?? null,
        name,
        mobile,
        measurement_method: selected,
        notes: notes || null,
      });
      if (error) throw error;
      setSubmitted(true);
      notify('Your measurement preference has been saved.');
    } catch {
      notify('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Reveal>
        <div className="mx-auto max-w-xl text-center py-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-600">
            <Check size={32} strokeWidth={1.25} />
          </span>
          <h3 className="mt-6 text-h2 font-serif font-medium text-navy-900">Thank you!</h3>
          <p className="mt-3 text-base font-light leading-relaxed text-charcoal-500">
            Your measurement preference has been recorded. Our atelier will guide you through the next steps on WhatsApp.
          </p>
          <div className="mt-6">
            <ButtonAnchor
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noreferrer"
              variant="gold"
              size="md"
            >
              <ArrowRight size={16} /> Continue on WhatsApp
            </ButtonAnchor>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <div>
      {!compact && (
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Ruler size={26} strokeWidth={1.25} />
            </span>
            <h2 className="mt-5 text-h2 font-serif font-medium text-navy-900">Measurement Guidance</h2>
            <p className="mt-4 text-base font-light leading-relaxed text-charcoal-500">
              Accurate measurements are the foundation of perfect couture. There is no rush — choose the method that feels most comfortable for you. Our team will guide you every step of the way, ensuring your silhouette fits flawlessly.
            </p>
          </div>
        </Reveal>
      )}

      {/* Options */}
      <div className={`${compact ? 'mt-6' : 'mt-12'} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {measurementOptions.map((opt, i) => {
          const Icon = optionIcons[opt.icon] ?? Store;
          const isSelected = selected === opt.value;
          const isExpanded = expanded === opt.value;
          return (
            <Reveal key={opt.value} delay={i * 60}>
              <div
                className={`flex h-full flex-col rounded-luxury-lg border-2 p-5 transition-all duration-luxury ${
                  isSelected ? 'border-gold-500 bg-gold-50 shadow-gold' : 'border-navy-50 bg-white hover:border-gold-300'
                }`}
              >
                <button
                  onClick={() => setSelected(opt.value)}
                  className="flex items-start gap-3 text-left"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-gold-500 text-navy-900' : 'bg-gold-50 text-gold-600'}`}>
                    <Icon size={20} strokeWidth={1.25} />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-serif font-medium text-navy-900">{opt.label}</h3>
                    <p className="mt-1 text-xs font-light leading-relaxed text-charcoal-500">{opt.description}</p>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-900">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setExpanded(isExpanded ? null : opt.value)}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-gold-700 hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Learn more'}
                  <ChevronDown size={12} className={`transition-transform duration-luxury ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {isExpanded && (
                  <p className="mt-3 text-xs font-light leading-relaxed text-charcoal-600 border-t border-navy-50 pt-3">
                    {opt.details}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Contact form for measurement preference */}
      {selected && (
        <Reveal>
          <div className="mt-8 rounded-luxury-lg border border-navy-50 bg-ivory-100 p-6">
            <p className="heading-eyebrow">Save Your Preference</p>
            <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">
              You've chosen: {measurementOptions.find((o) => o.value === selected)?.label}
            </h3>
            <p className="mt-2 text-sm font-light text-charcoal-500">
              Share your contact details so our atelier can guide you through the measurement process.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mg-name" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Name *</label>
                <input id="mg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-luxury" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="mg-mobile" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Mobile *</label>
                <input id="mg-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-luxury" placeholder="+91 ..." />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="mg-notes" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Notes <span className="text-charcoal-300 normal-case tracking-normal">(optional)</span></label>
              <textarea id="mg-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-luxury resize-none" placeholder="Any specific concerns or preferences..." />
            </div>
            <div className="mt-5">
              <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Preference'}
              </Button>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
