import { useState } from 'react';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { Mail, Loader2 } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('Please enter a valid email address.', 'error');
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      notify('Thank you for subscribing. Stay inspired with LIBAS COUTURE.');
      setEmail('');
    }, 700);
  };

  return (
    <Section background="navy" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
      <Reveal>
        <div className="relative mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/30 text-gold-300">
            <Mail size={24} strokeWidth={1.25} />
          </span>
          <h2 className="mt-6 text-h2 font-serif font-medium text-ivory-100 text-balance">Stay Inspired</h2>
          <p className="mt-3 text-base font-light leading-relaxed text-ivory-200/70">
            Receive updates about new collections and bridal inspirations.
          </p>
          <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
              className="input-luxury border-ivory-200/20 bg-navy-800/50 text-ivory-100 placeholder:text-ivory-200/40 focus:border-gold-400"
            />
            <Button type="submit" variant="gold" size="md" disabled={submitting} className="shrink-0">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Subscribe'}
            </Button>
          </form>
          <p className="mt-3 text-xs font-light text-ivory-200/40">No spam, only inspiration. Unsubscribe anytime.</p>
        </div>
      </Reveal>
    </Section>
  );
}
