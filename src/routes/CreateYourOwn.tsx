import { useState, useCallback } from 'react';
import {
  Lightbulb, Upload, Palette, Ruler, Send, MessageCircle,
  Sparkles, ArrowRight, CalendarHeart,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Button, ButtonLink } from '@/components/ui/Button';
import { CustomisationForm } from '@/components/customisation/CustomisationForm';
import { ThankYou } from '@/components/customisation/ThankYou';
import { useAppointment } from '@/context/AppointmentContext';
import { getImage } from '@/config/images';
import { consultationJourneySteps } from '@/config/customisation';

const journeyIcons = [Lightbulb, Upload, Palette, Ruler, Send, MessageCircle];

type SubmittedData = {
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
} | null;

export function CreateYourOwn() {
  const [submitted, setSubmitted] = useState<SubmittedData>(null);
  const { open } = useAppointment();

  const handleComplete = useCallback((formData: SubmittedData) => {
    setSubmitted(formData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReset = useCallback(() => {
    setSubmitted(null);
  }, []);

  return (
    <>
      <Seo
        title="Create Your Own"
        description="Share your inspiration and let LIBAS COUTURE craft a bespoke silhouette exclusively for you. A private couture consultation experience."
        canonical="https://libascouture.in/create-your-own"
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Create Your Own' }]} />

      {/* Luxury Hero */}
      <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden bg-navy-900">
        <img
          src={getImage('home.createYourOwn')}
          alt="Create your dream outfit with LIBAS COUTURE bespoke atelier"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-navy-950/50" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-300/40 text-gold-300">
              <Sparkles size={26} strokeWidth={1.25} />
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-hero font-serif font-medium text-ivory-100 text-balance">
              Create Your Dream Outfit
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg font-light leading-relaxed text-ivory-200/85">
              Share your inspiration and let LIBAS COUTURE craft it exclusively for you.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink to="#customisation-form" variant="gold" size="lg">
                Start Custom Design <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
              <Button variant="secondary" size="lg" onClick={open} className="border-ivory-200/30 text-ivory-100 hover:border-gold-300 hover:text-gold-300">
                <CalendarHeart size={18} /> Book Consultation
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Introduction */}
      <Section background="ivory">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="heading-eyebrow">A Private Couture Consultation</p>
            <h2 className="mt-4 text-h2 font-serif font-medium text-navy-900 text-balance">
              Your Vision, Our Craftsmanship
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-charcoal-500">
              Every great couture piece begins with a conversation. This is not a form — it is your private consultation with our atelier. Share your dreams, your references, your colours, and we will transform them into a one-of-a-kind silhouette, hand-embroidered exclusively for you.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Consultation Journey */}
      <Section background="white">
        <Reveal>
          <div className="text-center">
            <p className="heading-eyebrow">The Journey</p>
            <h2 className="mt-4 text-h2 font-serif font-medium text-navy-900">Your Consultation Pathway</h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-500">
              Six simple steps from inspiration to creation.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {consultationJourneySteps.map((s, i) => {
            const Icon = journeyIcons[i] ?? Sparkles;
            return (
              <Reveal key={s.step} delay={i * 80}>
                <div className="card-luxury h-full p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                      <Icon size={22} strokeWidth={1.25} />
                    </span>
                    <span className="text-3xl font-serif font-light text-gold-200">
                      {String(s.step).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-serif font-medium text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-500">{s.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Customisation Form / Thank You */}
      <Section background="ivory" id="customisation-form">
        {submitted ? (
          <ThankYou formData={submitted} onReset={handleReset} />
        ) : (
          <>
            <Reveal>
              <div className="mb-10 text-center">
                <p className="heading-eyebrow">Begin Your Design</p>
                <h2 className="mt-4 text-h2 font-serif font-medium text-navy-900">Customisation Form</h2>
                <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-500">
                  Take your time — every detail helps us understand your vision more clearly.
                </p>
              </div>
            </Reveal>
            <CustomisationForm onComplete={handleComplete} />
          </>
        )}
      </Section>

      {/* Measurement Options teaser */}
      <Section background="white">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Ruler size={24} strokeWidth={1.25} />
            </span>
            <h2 className="mt-5 text-h2 font-serif font-medium text-navy-900">Measurement Options</h2>
            <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-charcoal-500">
              Once your design is submitted, we'll guide you through the measurement process. Explore our measurement options to find what works best for you.
            </p>
            <ButtonLink to="/measurements" variant="primary" size="md" className="mt-6">
              Explore Measurement Options <ArrowRight size={16} className="ml-1" />
            </ButtonLink>
          </div>
        </Reveal>
      </Section>

      {/* Final CTA */}
      <Section background="navy" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
        <div className="relative text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-h2 font-serif font-medium text-ivory-100 text-balance">
              Prefer to talk first?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base font-light leading-relaxed text-ivory-200/70">
              Book a private consultation at our Chandni Chowk atelier or reach us instantly on WhatsApp.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" onClick={open}>
                <CalendarHeart size={18} /> Book Appointment
              </Button>
              <ButtonLink to="/contact" variant="secondary" size="lg" className="border-ivory-200/30 text-ivory-100 hover:border-gold-400 hover:text-gold-300">
                Contact Us <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
