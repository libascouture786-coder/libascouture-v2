import { useState, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Check, Loader2, Upload, X,
  Palette, Sparkles, Scissors,
  User, MessageSquare, Image as ImageIcon,
} from 'lucide-react';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { site } from '@/config/site';
import {
  outfitCategories, occasionOptions, budgetRanges, designStyles,
  fabricOptions, colorSwatches, embroideryOptions, customisationOptions,
} from '@/config/customisation';
import { validateEmail, validatePhone, validateRequired, validateFiles, sanitizeText } from '@/lib/validation';

const P = 'cf';

type FormState = {
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  country: string;
  outfitCategory: string;
  occasion: string;
  eventDate: string;
  budget: string;
  designStyle: string;
  fabrics: string[];
  colors: string[];
  embroidery: string[];
  customisation: string[];
  inspirationNotes: string;
  additionalNotes: string;
};

const initialForm: FormState = {
  name: '', mobile: '', whatsapp: '', email: '', city: '', state: '', country: '',
  outfitCategory: '', occasion: '', eventDate: '', budget: '', designStyle: '',
  fabrics: [], colors: [], embroidery: [], customisation: [],
  inspirationNotes: '', additionalNotes: '',
};

const steps = [
  { label: 'Personal', icon: User },
  { label: 'Outfit', icon: Scissors },
  { label: 'Design', icon: Palette },
  { label: 'Details', icon: Sparkles },
  { label: 'Inspiration', icon: ImageIcon },
  { label: 'Review', icon: Check },
];

type CustomisationFormProps = {
  onComplete: (formData: FormState) => void;
};

export function CustomisationForm({ onComplete }: CustomisationFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; preview: string }[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const toggleArray = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      const nameRes = validateRequired(form.name, 'Name');
      if (!nameRes.valid) errs.name = nameRes.error!;
      const phoneRes = validatePhone(form.mobile);
      if (!phoneRes.valid) errs.mobile = phoneRes.error!;
      if (form.email) { const e = validateEmail(form.email); if (!e.valid) errs.email = e.error!; }
    }
    if (step === 1) {
      if (!form.outfitCategory) errs.outfitCategory = 'Please select an outfit category.';
      if (!form.occasion) errs.occasion = 'Please select an occasion.';
    }
    if (step === 2) {
      if (!form.designStyle) errs.designStyle = 'Please select a design style.';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please complete the required fields.', 'error');
    }
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (target: number) => {
    if (target <= step || validateStep()) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const remaining = 6 - uploadedFiles.length;
    if (remaining <= 0) {
      notify('You can upload a maximum of 6 reference images.', 'error');
      return;
    }
    const result = validateFiles(incoming.slice(0, remaining));
    if (!result.valid) {
      notify(result.error ?? 'Invalid file.', 'error');
      return;
    }
    const newFiles = incoming.slice(0, remaining).map((file) => ({
      name: file.name,
      preview: URL.createObjectURL(file),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (honeypot) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('customisation_requests').insert({
        name: sanitizeText(form.name, 100),
        mobile: sanitizeText(form.mobile, 20),
        whatsapp: form.whatsapp ? sanitizeText(form.whatsapp, 20) : null,
        email: form.email || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        outfit_category: form.outfitCategory || null,
        occasion: form.occasion || null,
        event_date: form.eventDate || null,
        budget: form.budget || null,
        design_style: form.designStyle || null,
        fabrics: form.fabrics.length > 0 ? form.fabrics : null,
        colors: form.colors.length > 0 ? form.colors : null,
        embroidery: form.embroidery.length > 0 ? form.embroidery : null,
        customisation: form.customisation.length > 0 ? form.customisation : null,
        inspiration_notes: form.inspirationNotes ? sanitizeText(form.inspirationNotes, 2000) : null,
        additional_notes: form.additionalNotes ? sanitizeText(form.additionalNotes, 2000) : null,
      });
      if (error) throw error;
      onComplete(form);
    } catch {
      notify('Something went wrong. Please try again or reach us on WhatsApp.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsAppMessage = useCallback(() => {
    const lines = [
      `Hello ${site.name}, I'd like to create a custom outfit.`,
      '',
      `Name: ${form.name}`,
      `Mobile: ${form.mobile}`,
    ];
    if (form.whatsapp) lines.push(`WhatsApp: ${form.whatsapp}`);
    if (form.email) lines.push(`Email: ${form.email}`);
    if (form.city) lines.push(`City: ${form.city}${form.state ? ', ' + form.state : ''}${form.country ? ', ' + form.country : ''}`);
    if (form.outfitCategory) lines.push(`Outfit: ${form.outfitCategory}`);
    if (form.occasion) lines.push(`Occasion: ${form.occasion}`);
    if (form.eventDate) lines.push(`Event Date: ${form.eventDate}`);
    if (form.budget) lines.push(`Budget: ${form.budget}`);
    if (form.designStyle) lines.push(`Design Style: ${form.designStyle}`);
    if (form.fabrics.length > 0) lines.push(`Fabrics: ${form.fabrics.join(', ')}`);
    if (form.colors.length > 0) lines.push(`Colours: ${form.colors.join(', ')}`);
    if (form.embroidery.length > 0) lines.push(`Embroidery: ${form.embroidery.join(', ')}`);
    if (form.customisation.length > 0) lines.push(`Customisation: ${form.customisation.join(', ')}`);
    if (form.inspirationNotes) lines.push(`Inspiration: ${form.inspirationNotes}`);
    if (form.additionalNotes) lines.push(`Notes: ${form.additionalNotes}`);
    return encodeURIComponent(lines.join('\n'));
  }, [form]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div className={`h-0.5 flex-1 transition-colors duration-luxury ${i <= step ? 'bg-gold-500' : 'bg-navy-100'}`} />
                  )}
                  <button
                    onClick={() => goToStep(i)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-luxury ${
                      isCompleted
                        ? 'border-gold-500 bg-gold-500 text-navy-900'
                        : isCurrent
                          ? 'border-gold-500 bg-white text-gold-600 shadow-gold'
                          : 'border-navy-100 bg-white text-charcoal-300'
                    }`}
                    aria-label={`Step ${i + 1}: ${s.label}`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={1.5} />}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 transition-colors duration-luxury ${i < step ? 'bg-gold-500' : 'bg-navy-100'}`} />
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.1em] ${isCurrent ? 'font-medium text-navy-900' : 'text-charcoal-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
        <div className="hidden" aria-hidden>
          <label htmlFor="cf-website">Website</label>
          <input id="cf-website" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>
        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <p className="heading-eyebrow">Step 1</p>
              <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">Personal Information</h3>
              <p className="mt-1 text-sm font-light text-charcoal-500">Let's start with your details so we can reach you.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Name *</label>
                <input id="cf-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} aria-invalid={errors.name ? 'true' : undefined} aria-describedby={errors.name ? `${P}-name-error` : undefined} className={`input-luxury ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="Your full name" />
                {errors.name && <p id={`${P}-name-error`} className="mt-1 text-xs text-red-500" role="alert">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="cf-mobile" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Mobile *</label>
                <input id="cf-mobile" type="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value)} aria-invalid={errors.mobile ? 'true' : undefined} aria-describedby={errors.mobile ? `${P}-mobile-error` : undefined} className={`input-luxury ${errors.mobile ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="+91 ..." />
                {errors.mobile && <p id={`${P}-mobile-error`} className="mt-1 text-xs text-red-500" role="alert">{errors.mobile}</p>}
              </div>
              <div>
                <label htmlFor="cf-whatsapp" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">WhatsApp <span className="text-charcoal-300 normal-case tracking-normal">(if different)</span></label>
                <input id="cf-whatsapp" type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="input-luxury" placeholder="+91 ..." />
              </div>
              <div>
                <label htmlFor="cf-email" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Email <span className="text-charcoal-300 normal-case tracking-normal">(optional)</span></label>
                <input id="cf-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} aria-invalid={errors.email ? 'true' : undefined} aria-describedby={errors.email ? `${P}-email-error` : undefined} className={`input-luxury ${errors.email ? 'border-red-400 ring-2 ring-red-100' : ''}`} placeholder="you@email.com" />
                {errors.email && <p id={`${P}-email-error`} className="mt-1 text-xs text-red-500" role="alert">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="cf-city" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">City</label>
                <input id="cf-city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input-luxury" placeholder="Your city" />
              </div>
              <div>
                <label htmlFor="cf-state" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">State</label>
                <input id="cf-state" type="text" value={form.state} onChange={(e) => update('state', e.target.value)} className="input-luxury" placeholder="Your state" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cf-country" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Country</label>
                <input id="cf-country" type="text" value={form.country} onChange={(e) => update('country', e.target.value)} className="input-luxury" placeholder="Your country" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Outfit Category + Occasion + Event Date + Budget */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="heading-eyebrow">Step 2</p>
              <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">Outfit & Occasion</h3>
              <p className="mt-1 text-sm font-light text-charcoal-500">What are you dreaming of, and for what occasion?</p>
            </div>
            {/* Outfit Category */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Outfit Category *</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {outfitCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => update('outfitCategory', cat)}
                    className={`rounded-luxury border p-3 text-center text-xs font-light transition-all duration-luxury ${
                      form.outfitCategory === cat
                        ? 'border-gold-500 bg-gold-50 text-gold-800 shadow-gold'
                        : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.outfitCategory && <p className="mt-1 text-xs text-red-500">{errors.outfitCategory}</p>}
            </div>
            {/* Occasion */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Occasion *</p>
              <select value={form.occasion} onChange={(e) => update('occasion', e.target.value)} className={`input-luxury ${errors.occasion ? 'border-red-400' : ''}`}>
                <option value="">Select an occasion</option>
                {occasionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {errors.occasion && <p className="mt-1 text-xs text-red-500">{errors.occasion}</p>}
            </div>
            {/* Event Date */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Event Date <span className="text-charcoal-300 normal-case tracking-normal">(if known)</span></p>
              <input type="date" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} className="input-luxury" />
            </div>
            {/* Budget */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Budget</p>
              <div className="flex flex-wrap gap-2">
                {budgetRanges.map((b) => (
                  <button
                    key={b}
                    onClick={() => update('budget', b)}
                    className={`rounded-full border px-4 py-2 text-xs font-light transition-all duration-luxury ${
                      form.budget === b
                        ? 'border-gold-500 bg-gold-500 text-navy-900'
                        : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Design Style + Fabric + Colour */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="heading-eyebrow">Step 3</p>
              <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">Design Preferences</h3>
              <p className="mt-1 text-sm font-light text-charcoal-500">Choose your style, fabrics, and colours.</p>
            </div>
            {/* Design Style */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Design Style *</p>
              <div className="flex flex-wrap gap-2">
                {designStyles.map((s) => (
                  <button
                    key={s}
                    onClick={() => update('designStyle', s)}
                    className={`rounded-full border px-4 py-2 text-xs font-light transition-all duration-luxury ${
                      form.designStyle === s
                        ? 'border-gold-500 bg-gold-500 text-navy-900'
                        : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.designStyle && <p className="mt-1 text-xs text-red-500">{errors.designStyle}</p>}
            </div>
            {/* Fabric */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Fabric Selection <span className="text-charcoal-300 normal-case tracking-normal">(select all that apply)</span></p>
              <div className="flex flex-wrap gap-2">
                {fabricOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleArray('fabrics', f)}
                    className={`rounded-full border px-4 py-2 text-xs font-light transition-all duration-luxury ${
                      form.fabrics.includes(f)
                        ? 'border-gold-500 bg-gold-50 text-gold-800'
                        : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {/* Colour swatches */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Colour Selection <span className="text-charcoal-300 normal-case tracking-normal">(select all that apply)</span></p>
              <div className="flex flex-wrap gap-3">
                {colorSwatches.map((c) => {
                  const selected = form.colors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleArray('colors', c.name)}
                      aria-label={c.name}
                      className={`flex items-center gap-2 rounded-luxury border p-2 transition-all duration-luxury ${
                        selected ? 'border-gold-500 shadow-gold' : 'border-navy-50 hover:border-gold-300'
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-navy-100"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs font-light text-charcoal-600">{c.name}</span>
                      {selected && <Check size={12} className="text-gold-600" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Embroidery + Customisation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="heading-eyebrow">Step 4</p>
              <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">Embroidery & Customisation</h3>
              <p className="mt-1 text-sm font-light text-charcoal-500">Tell us about the details that matter to you.</p>
            </div>
            {/* Embroidery */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Embroidery Preferences <span className="text-charcoal-300 normal-case tracking-normal">(select all that apply)</span></p>
              <div className="flex flex-wrap gap-2">
                {embroideryOptions.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleArray('embroidery', e)}
                    className={`rounded-full border px-4 py-2 text-xs font-light transition-all duration-luxury ${
                      form.embroidery.includes(e)
                        ? 'border-gold-500 bg-gold-50 text-gold-800'
                        : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            {/* Customisation */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Customisation Options <span className="text-charcoal-300 normal-case tracking-normal">(select all that apply)</span></p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {customisationOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleArray('customisation', c)}
                    className={`flex items-center gap-2 rounded-luxury border p-3 text-xs font-light transition-all duration-luxury ${
                      form.customisation.includes(c)
                        ? 'border-gold-500 bg-gold-50 text-gold-800'
                        : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'
                    }`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${form.customisation.includes(c) ? 'border-gold-500 bg-gold-500' : 'border-navy-200'}`}>
                      {form.customisation.includes(c) && <Check size={10} className="text-navy-900" strokeWidth={3} />}
                    </span>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Inspiration Upload + Notes */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <p className="heading-eyebrow">Step 5</p>
              <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">Inspiration & Notes</h3>
              <p className="mt-1 text-sm font-light text-charcoal-500">Share your vision — references, links, and any special requests.</p>
            </div>
            {/* Upload */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Reference Images <span className="text-charcoal-300 normal-case tracking-normal">(up to 6)</span></p>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-luxury border-2 border-dashed border-navy-100 p-8 text-center transition-colors hover:border-gold-400"
              >
                <Upload size={28} strokeWidth={1.25} className="text-gold-500" />
                <p className="mt-3 text-sm font-light text-charcoal-500">Click or drag images here</p>
                <p className="mt-1 text-xs font-light text-charcoal-300">PNG, JPG up to 5MB each</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {uploadedFiles.map((file, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-luxury border border-navy-50">
                      <img src={file.preview} alt={file.name} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        aria-label="Remove image"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-soft transition-transform hover:scale-110"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Inspiration notes */}
            <div>
              <label htmlFor="cf-inspiration" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Pinterest / Instagram / Mood Board Links</label>
              <textarea id="cf-inspiration" rows={3} value={form.inspirationNotes} onChange={(e) => update('inspirationNotes', e.target.value)} className="input-luxury resize-none" placeholder="Share your Pinterest boards, Instagram references, or mood board descriptions..." />
            </div>
            {/* Additional notes */}
            <div>
              <label htmlFor="cf-notes" className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">Additional Notes</label>
              <textarea id="cf-notes" rows={3} value={form.additionalNotes} onChange={(e) => update('additionalNotes', e.target.value)} className="input-luxury resize-none" placeholder="Anything else you'd like us to know..." />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <p className="heading-eyebrow">Step 6</p>
              <h3 className="mt-2 text-h3 font-serif font-medium text-navy-900">Review & Submit</h3>
              <p className="mt-1 text-sm font-light text-charcoal-500">Please review your design brief before submitting.</p>
            </div>
            <div className="space-y-3">
              <ReviewSection title="Personal Information" onEdit={() => goToStep(0)}>
                <p className="text-sm font-light text-charcoal-600">{form.name} — {form.mobile}{form.whatsapp ? ` (WhatsApp: ${form.whatsapp})` : ''}</p>
                {form.email && <p className="text-sm font-light text-charcoal-600">{form.email}</p>}
                {(form.city || form.state || form.country) && <p className="text-sm font-light text-charcoal-600">{[form.city, form.state, form.country].filter(Boolean).join(', ')}</p>}
              </ReviewSection>
              <ReviewSection title="Outfit & Occasion" onEdit={() => goToStep(1)}>
                <p className="text-sm font-light text-charcoal-600">{form.outfitCategory} for {form.occasion}</p>
                {form.eventDate && <p className="text-sm font-light text-charcoal-600">Event Date: {form.eventDate}</p>}
                {form.budget && <p className="text-sm font-light text-charcoal-600">Budget: {form.budget}</p>}
              </ReviewSection>
              <ReviewSection title="Design Preferences" onEdit={() => goToStep(2)}>
                {form.designStyle && <p className="text-sm font-light text-charcoal-600">Style: {form.designStyle}</p>}
                {form.fabrics.length > 0 && <p className="text-sm font-light text-charcoal-600">Fabrics: {form.fabrics.join(', ')}</p>}
                {form.colors.length > 0 && <p className="text-sm font-light text-charcoal-600">Colours: {form.colors.join(', ')}</p>}
              </ReviewSection>
              <ReviewSection title="Embroidery & Customisation" onEdit={() => goToStep(3)}>
                {form.embroidery.length > 0 && <p className="text-sm font-light text-charcoal-600">Embroidery: {form.embroidery.join(', ')}</p>}
                {form.customisation.length > 0 && <p className="text-sm font-light text-charcoal-600">Customisation: {form.customisation.join(', ')}</p>}
              </ReviewSection>
              <ReviewSection title="Inspiration & Notes" onEdit={() => goToStep(4)}>
                {uploadedFiles.length > 0 && <p className="text-sm font-light text-charcoal-600">{uploadedFiles.length} reference image(s) uploaded</p>}
                {form.inspirationNotes && <p className="text-sm font-light text-charcoal-600">Inspiration: {form.inspirationNotes}</p>}
                {form.additionalNotes && <p className="text-sm font-light text-charcoal-600">Notes: {form.additionalNotes}</p>}
              </ReviewSection>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-navy-50 pt-6">
          <Button variant="ghost" size="md" onClick={prev} disabled={step === 0}>
            <ChevronLeft size={16} /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="primary" size="md" onClick={next}>
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <div className="flex gap-3">
              <ButtonAnchor
                href={`https://wa.me/${site.contact.whatsappNumber}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                size="md"
              >
                <MessageSquare size={16} /> WhatsApp
              </ButtonAnchor>
              <Button variant="gold" size="md" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Submit Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-luxury border border-navy-50 bg-ivory-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">{title}</p>
        <button onClick={onEdit} className="text-xs font-medium text-gold-700 hover:underline">Edit</button>
      </div>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}
