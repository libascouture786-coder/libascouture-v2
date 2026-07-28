import { useState, useMemo } from 'react';
import {
  Store, MessageCircle, Video, Phone, Crown,
  Calendar, Loader2, Check, AlertCircle, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { validatePhone } from '@/lib/validation';
import {
  consultationTypes, timeSlots,
  budgetRanges, occasionOptions,
} from '@/config/customisation';

const consultationIcons: Record<string, typeof Store> = {
  Store, MessageCircle, Video, Phone, Crown,
};

type AppointmentFormState = {
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  city: string;
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  occasion: string;
  budget: string;
  notes: string;
};

const initialState: AppointmentFormState = {
  name: '', mobile: '', whatsapp: '', email: '', city: '', consultationType: '',
  preferredDate: '', preferredTime: '', occasion: '', budget: '', notes: '',
};

type AppointmentFormProps = {
  onComplete: (data: AppointmentFormState) => void;
};

export function AppointmentForm({ onComplete }: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const update = (field: keyof AppointmentFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  // Smart logic recommendations
  const recommendations = useMemo(() => {
    const recs: { icon: typeof Info; text: string; variant: 'info' | 'warning' | 'success' }[] = [];

    if (form.occasion === 'Wedding' || form.occasion === 'Bridal') {
      recs.push({
        icon: Crown,
        text: 'We recommend our Premium Bridal Consultation for a dedicated 2-hour experience with our master designer.',
        variant: 'info',
      });
    }

    if (form.city && !form.city.toLowerCase().includes('delhi') && !form.city.toLowerCase().includes('new delhi')) {
      recs.push({
        icon: Video,
        text: 'Video Consultation recommended for outstation clients — enjoy a full couture experience from the comfort of your home.',
        variant: 'info',
      });
    }

    if (form.preferredDate) {
      const selected = new Date(form.preferredDate);
      const diffDays = Math.ceil((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        recs.push({
          icon: AlertCircle,
          text: 'This is a short timeline — our atelier will prioritize your request. For complex bespoke pieces, we recommend allowing 6–8 weeks.',
          variant: 'warning',
        });
      }
      if (diffDays > 90) {
        recs.push({
          icon: Check,
          text: 'Wonderful — early planning allows for full bespoke customisation and multiple fitting sessions.',
          variant: 'success',
        });
      }
    }

    return recs;
  }, [form.occasion, form.city, form.preferredDate, today]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please share your name.';
    if (!form.mobile.trim()) {
      errs.mobile = 'Please share your mobile number.';
    } else {
      const phoneResult = validatePhone(form.mobile);
      if (!phoneResult.valid) errs.mobile = phoneResult.error!;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email.';
    if (!form.consultationType) errs.consultationType = 'Please select a consultation type.';
    if (!form.preferredDate) errs.preferredDate = 'Please choose a preferred date.';
    if (!form.preferredTime) errs.preferredTime = 'Please choose a preferred time.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) notify('Please complete the required fields.', 'error');
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = crypto.randomUUID();
      const { error } = await supabase.from('appointments').insert({
        name: form.name,
        email: form.email || null,
        phone: form.mobile,
        whatsapp: form.whatsapp || null,
        consultation_type: form.consultationType || null,
        preferred_date: form.preferredDate,
        preferred_time: form.preferredTime || null,
        occasion: form.occasion || null,
        budget: form.budget || null,
        notes: form.notes || null,
        reschedule_token: token,
        cancellation_token: token,
      });
      if (error) throw error;
      onComplete(form);
    } catch {
      notify('Something went wrong. Please try again or reach us on WhatsApp.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const variantStyles = {
    info: 'border-navy-100 bg-navy-50 text-navy-800',
    warning: 'border-gold-200 bg-gold-50 text-gold-800',
    success: 'border-green-100 bg-green-50 text-green-800',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Smart recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-luxury border p-4 ${variantStyles[rec.variant]}`}>
                <Icon size={16} className="mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="text-xs font-light leading-relaxed">{rec.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Personal info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="af-name" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Name *</label>
          <input id="af-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={`input-luxury ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="Your full name" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="af-mobile" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Mobile *</label>
          <input id="af-mobile" type="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value)} className={`input-luxury ${errors.mobile ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="+91 ..." />
          {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
        </div>
        <div>
          <label htmlFor="af-whatsapp" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">WhatsApp <span className="text-charcoal-300 normal-case tracking-normal">(if different)</span></label>
          <input id="af-whatsapp" type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="input-luxury" placeholder="+91 ..." />
        </div>
        <div>
          <label htmlFor="af-email" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Email</label>
          <input id="af-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={`input-luxury ${errors.email ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="you@email.com" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="af-city" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">City</label>
          <input id="af-city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input-luxury" placeholder="Your city" />
        </div>
      </div>

      {/* Consultation Type */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Consultation Type *</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {consultationTypes.map((ct) => {
            const Icon = consultationIcons[ct.icon] ?? Store;
            const selected = form.consultationType === ct.value;
            return (
              <button
                key={ct.value}
                type="button"
                onClick={() => update('consultationType', ct.value)}
                className={`flex flex-col items-start gap-2 rounded-luxury border p-4 text-left transition-all duration-luxury ${
                  selected ? 'border-gold-500 bg-gold-50 shadow-gold' : 'border-navy-50 bg-white hover:border-gold-300'
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-gold-500 text-navy-900' : 'bg-gold-50 text-gold-600'}`}>
                  <Icon size={20} strokeWidth={1.25} />
                </span>
                <span className="text-sm font-medium text-navy-900">{ct.label}</span>
                <span className="text-xs font-light leading-relaxed text-charcoal-500">{ct.description}</span>
              </button>
            );
          })}
        </div>
        {errors.consultationType && <p className="mt-1 text-xs text-red-500">{errors.consultationType}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="af-date" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Preferred Date *</label>
          <input
            id="af-date"
            type="date"
            min={todayStr}
            value={form.preferredDate}
            onChange={(e) => update('preferredDate', e.target.value)}
            className={`input-luxury ${errors.preferredDate ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          />
          {errors.preferredDate && <p className="mt-1 text-xs text-red-500">{errors.preferredDate}</p>}
        </div>
        <div>
          <label htmlFor="af-time" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Preferred Time *</label>
          <select
            id="af-time"
            value={form.preferredTime}
            onChange={(e) => update('preferredTime', e.target.value)}
            className={`input-luxury appearance-none ${errors.preferredTime ? 'border-red-400' : ''}`}
          >
            <option value="">Select a time slot</option>
            {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.preferredTime && <p className="mt-1 text-xs text-red-500">{errors.preferredTime}</p>}
        </div>
      </div>

      {/* Occasion & Budget */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="af-occasion" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Occasion</label>
          <select id="af-occasion" value={form.occasion} onChange={(e) => update('occasion', e.target.value)} className="input-luxury appearance-none">
            <option value="">Select an occasion</option>
            {occasionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-[0.1em] text-charcoal-600">Budget</p>
          <div className="flex flex-wrap gap-2">
            {budgetRanges.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => update('budget', form.budget === b ? '' : b)}
                className={`rounded-full border px-3 py-1.5 text-xs font-light transition-all duration-luxury ${
                  form.budget === b ? 'border-gold-500 bg-gold-500 text-navy-900' : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="af-notes" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Notes <span className="text-charcoal-300 normal-case tracking-normal">(optional)</span></label>
        <textarea id="af-notes" rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-luxury resize-none" placeholder="Share any special requests or details..." />
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
        {submitting ? 'Sending...' : 'Request Appointment'}
      </Button>
    </form>
  );
}

export { type AppointmentFormState };
