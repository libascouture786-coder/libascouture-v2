import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { X, CalendarHeart, Loader2 } from 'lucide-react';
import { site } from '@/config/site';
import { storage } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';

type AppointmentContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const AppointmentContext = createContext<AppointmentContextValue | null>(null);

const occasions = ['Bridal', 'Engagement', 'Reception', 'Mehendi', 'Sangeet', 'Cocktail', 'Other'];

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { notify } = useToast();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const validate = (data: FormData) => {
    const errs: Record<string, string> = {};
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const date = String(data.get('date') ?? '').trim();
    if (!name) errs.name = 'Please share your name.';
    if (!email) errs.email = 'Please share your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.';
    if (!phone) errs.phone = 'Please share a contact number.';
    if (!date) errs.date = 'Please choose a preferred date.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (!validate(data)) return;
    setSubmitting(true);
    const draft = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      date: String(data.get('date') ?? '').trim(),
      occasion: String(data.get('occasion') ?? '').trim(),
      notes: String(data.get('notes') ?? '').trim(),
      createdAt: Date.now(),
    };
    try {
      storage.saveAppointment(draft);
      window.setTimeout(() => {
        setSubmitting(false);
        setIsOpen(false);
        notify('Your appointment request has been received. Our atelier will be in touch shortly.');
        form.reset();
      }, 700);
    } catch {
      setSubmitting(false);
      notify('Something went wrong. Please try again or reach us on WhatsApp.', 'error');
    }
  };

  const value = useMemo<AppointmentContextValue>(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <AppointmentContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
            onClick={close}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-title"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-luxury-lg bg-ivory-100 shadow-soft-lg animate-scale-in no-scrollbar"
          >
            <button
              onClick={close}
              aria-label="Close appointment form"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-charcoal-500 transition-colors hover:bg-ivory-200 hover:text-navy-900"
            >
              <X size={18} />
            </button>

            <div className="px-6 pt-10 pb-8 sm:px-10">
              <div className="mb-6 text-center">
                <span className="heading-eyebrow">Private Atelier</span>
                <h2 id="appointment-title" className="mt-3 text-h3 font-serif font-medium text-navy-900">
                  Book an Appointment
                </h2>
                <p className="mt-2 text-sm font-light text-charcoal-500">
                  Reserve a private consultation at our Chandni Chowk atelier.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="appt-name" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-charcoal-600">
                    Full Name
                  </label>
                  <input
                    id="appt-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`input-luxury ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="appt-email" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-charcoal-600">
                      Email
                    </label>
                    <input
                      id="appt-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`input-luxury ${errors.email ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                      placeholder="you@email.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="appt-phone" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-charcoal-600">
                      Phone
                    </label>
                    <input
                      id="appt-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`input-luxury ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                      placeholder="+91 ..."
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="appt-date" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-charcoal-600">
                      Preferred Date
                    </label>
                    <input
                      id="appt-date"
                      name="date"
                      type="date"
                      className={`input-luxury ${errors.date ? 'border-red-400 ring-2 ring-red-100' : ''}`}
                    />
                    {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
                  </div>
                  <div>
                    <label htmlFor="appt-occasion" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-charcoal-600">
                      Occasion
                    </label>
                    <select id="appt-occasion" name="occasion" className="input-luxury appearance-none">
                      {occasions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="appt-notes" className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-charcoal-600">
                    Notes <span className="text-charcoal-300 normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    id="appt-notes"
                    name="notes"
                    rows={3}
                    className="input-luxury resize-none"
                    placeholder="Share your vision, references, or any special requests..."
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <CalendarHeart size={16} /> Request Appointment
                    </>
                  )}
                </button>

                <p className="text-center text-xs font-light text-charcoal-400">
                  Or reach us directly on{' '}
                  <a href={site.contact.whatsappLink} target="_blank" rel="noreferrer" className="text-gold-700 underline-offset-2 hover:underline">
                    WhatsApp
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppointmentContext.Provider>
  );
}

export function useAppointment() {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointment must be used within AppointmentProvider');
  return ctx;
}
