import { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Clock, Navigation } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { site } from '@/config/site';
import { getImage } from '@/config/images';
import { useAppointment } from '@/context/AppointmentContext';
import { useToast } from '@/context/ToastContext';
import { submitEnquiry } from '@/lib/api';
import { validateRequired, validatePhone, validateEmail } from '@/lib/validation';
import { localBusinessSchema, breadcrumbSchema, SITE_URL } from '@/lib/seo';

type ContactForm = {
  name: string;
  mobile: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof ContactForm, string>>;

const initialForm: ContactForm = { name: '', mobile: '', email: '', message: '' };

export function Contact() {
  const { open } = useAppointment();
  const { notify } = useToast();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const nameResult = validateRequired(form.name, 'Name');
    if (!nameResult.valid) errs.name = nameResult.error;
    const phoneResult = validatePhone(form.mobile);
    if (!phoneResult.valid) errs.mobile = phoneResult.error;
    if (form.email) {
      const emailResult = validateEmail(form.email);
      if (!emailResult.valid) errs.email = emailResult.error;
    }
    const messageResult = validateRequired(form.message, 'Message');
    if (!messageResult.valid) errs.message = messageResult.error;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!validate()) return;
    setSubmitting(true);
    const res = await submitEnquiry({
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim() || null,
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (res.error) {
      notify('Something went wrong. Please try again or call us directly.', 'error');
    } else {
      notify('Thank you for reaching out. Our atelier will be in touch shortly.');
      setForm(initialForm);
    }
  };

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Visit the LIBAS COUTURE atelier in Chandni Chowk, Delhi, or book a private appointment for bespoke bridal couture."
        canonical="https://libascouture.in/contact"
        jsonLd={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Contact', url: `${SITE_URL}/contact` },
          ]),
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      {/* Hero */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-navy-900">
        <img
          src={getImage('category.contact')}
          alt="LIBAS COUTURE atelier"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/40" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Visit the Atelier</p>
            <h1 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
              We look forward to welcoming you
            </h1>
          </Reveal>
        </div>
      </section>

      <Section background="ivory">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact info */}
          <Reveal>
            <h2 className="text-h2 font-serif font-medium text-navy-900">Reach the house</h2>
            <p className="mt-4 text-base font-light leading-relaxed text-charcoal-600">
              Whether you wish to book a private consultation, commission a bespoke silhouette, or simply learn more, our atelier is at your service.
            </p>

            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <MapPin size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Atelier</p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-navy-900">{site.address.full}</p>
                  <a href={site.contact.mapsLink} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gold-700 hover:underline">
                    <Navigation size={12} /> Get Directions
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Phone size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Phone</p>
                  <a href={`tel:${site.contact.phoneRaw}`} className="mt-1 block text-sm font-light text-navy-900 hover:text-gold-700">
                    {site.contact.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Mail size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Email</p>
                  <a href={`mailto:${site.contact.email}`} className="mt-1 block text-sm font-light text-navy-900 hover:text-gold-700">
                    {site.contact.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Clock size={20} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-charcoal-500">Hours</p>
                  <ul className="mt-1 space-y-1">
                    {site.hours.map((h) => (
                      <li key={h.day} className="text-sm font-light text-navy-900">
                        <span className="text-charcoal-500">{h.day}:</span> {h.time}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink to="/appointments" variant="gold" size="md">
                Book Appointment
              </ButtonLink>
              <Button variant="secondary" size="md" onClick={open}>
                Quick Book
              </Button>
              <ButtonAnchor href={site.contact.whatsappLink} target="_blank" rel="noreferrer" variant="secondary" size="md">
                <MessageCircle size={16} /> WhatsApp
              </ButtonAnchor>
            </div>
          </Reveal>

          {/* Map */}
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-luxury-lg border border-navy-100 bg-ivory-200 shadow-soft">
              <iframe
                title="LIBAS COUTURE location on Google Maps"
                src={site.contact.mapsEmbed}
                className="h-[420px] w-full lg:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, minHeight: '420px' }}
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Enquiry form */}
      <Section background="ivory" className="pt-0">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <p className="label-editorial mb-3">Send Us a Message</p>
              <h2 className="font-serif text-3xl font-medium text-navy-900 sm:text-4xl">
                We'd Love to Hear From You
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-charcoal-500">
                Have a question about a piece, a custom request, or your visit? Share a few details and our atelier will respond personally.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
              <input
                type="text"
                name="company"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="label-luxury">
                    Full Name <span className="text-gold-600">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`input-luxury ${errors.name ? 'input-error' : ''}`}
                    placeholder="Your name"
                    aria-invalid={errors.name ? 'true' : undefined}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-mobile" className="label-luxury">
                    Mobile <span className="text-gold-600">*</span>
                  </label>
                  <input
                    id="contact-mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => updateField('mobile', e.target.value)}
                    className={`input-luxury ${errors.mobile ? 'input-error' : ''}`}
                    placeholder="10-digit mobile number"
                    aria-invalid={errors.mobile ? 'true' : undefined}
                  />
                  {errors.mobile && <p className="error-text">{errors.mobile}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="contact-email" className="label-luxury">
                  Email <span className="text-charcoal-300">(optional)</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`input-luxury ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? 'true' : undefined}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="contact-message" className="label-luxury">
                  Message <span className="text-gold-600">*</span>
                </label>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className={`textarea-luxury ${errors.message ? 'input-error' : ''}`}
                  placeholder="How can we help you?"
                  rows={5}
                  aria-invalid={errors.message ? 'true' : undefined}
                />
                {errors.message && <p className="error-text">{errors.message}</p>}
              </div>
              <div className="flex justify-center pt-2">
                <Button type="submit" variant="primary" size="lg" loading={submitting} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
