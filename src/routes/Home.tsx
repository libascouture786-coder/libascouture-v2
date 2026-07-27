import { Seo } from '@/components/ui/Seo';
import { Reveal } from '@/components/ui/Reveal';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useAppointment } from '@/context/AppointmentContext';
import { organizationSchema, localBusinessSchema, websiteSchema } from '@/lib/seo';
import { TrustBar } from '@/components/sections/TrustBar';
import { SignatureCollections } from '@/components/sections/SignatureCollections';
import { ShopByOccasion } from '@/components/sections/ShopByOccasion';
import { FeaturedBanner } from '@/components/sections/FeaturedBanner';
import { EmbroiderySection } from '@/components/sections/EmbroiderySection';
import { CreateYourOwn } from '@/components/sections/CreateYourOwn';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { RealBridesGallery } from '@/components/sections/RealBridesGallery';
import { VisitAtelier } from '@/components/sections/VisitAtelier';
import { GoogleReviews } from '@/components/sections/GoogleReviews';
import { Newsletter } from '@/components/sections/Newsletter';
import { FinalCta } from '@/components/sections/FinalCta';
import { CalendarHeart, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { getImage } from '@/config/images';

const trustPoints = ['Fully Customisable', 'Hand Embroidery', 'Premium Craftsmanship'];

export function Home() {
  const { open } = useAppointment();

  return (
    <>
      <Seo
        title="Luxury Bridal Couture"
        description="LIBAS COUTURE is a luxury bridal couture house in Delhi specializing in bespoke hand embroidery and handcrafted heirloom-quality bridal wear."
        canonical="https://libascouture.in"
        jsonLd={[organizationSchema(), localBusinessSchema(), websiteSchema()]}
      />

      {/* Hero — 100vh cinematic */}
      <section className="relative flex h-screen min-h-[600px] items-center justify-center overflow-hidden">
        <img
          src={getImage('hero.main')}
          alt="LIBAS COUTURE — luxury bridal couture, hand-embroidered for your forever moments"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/55 via-navy-950/35 to-navy-950/65" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <img
              src={getImage('logo')}
              alt="LIBAS COUTURE"
              className="mx-auto h-16 w-auto object-contain md:h-20"
              loading="eager"
              decoding="auto"
            />
          </Reveal>
          <Reveal delay={200}>
            <h1 className="mx-auto mt-8 max-w-4xl text-hero font-serif font-medium text-ivory-100 text-balance">
              Luxury Bridal Couture
            </h1>
          </Reveal>
          <Reveal delay={350}>
            <p className="mx-auto mt-3 max-w-2xl text-h3 font-serif font-light text-ivory-200/90 text-balance">
              Handcrafted For Your Forever Moments
            </p>
          </Reveal>
          <Reveal delay={500}>
            <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-relaxed text-ivory-200/80 md:text-base">
              Bespoke Hand Embroidery — Designed Exclusively For You
            </p>
          </Reveal>
          <Reveal delay={650}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" onClick={open}>
                <CalendarHeart size={18} /> Book Appointment
              </Button>
              <ButtonLink to="/collections/bridal" variant="secondary" size="lg" className="border-ivory-200/40 text-ivory-100 hover:border-gold-300 hover:text-gold-300">
                Explore Collection <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={800}>
            <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {trustPoints.map((tp) => (
                <li key={tp} className="flex items-center gap-1.5 text-xs font-light text-ivory-200/75">
                  <Check size={14} className="text-gold-300" strokeWidth={2} />
                  {tp}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory-200/50">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="flex h-9 w-5 items-start justify-center rounded-full border border-ivory-200/30 p-1">
            <span className="h-2 w-0.5 animate-pulse-soft rounded-full bg-gold-300" />
          </span>
          <ChevronDown size={14} className="animate-pulse-soft" />
        </div>
      </section>

      <TrustBar />
      <SignatureCollections />
      <ShopByOccasion />
      <FeaturedBanner />
      <EmbroiderySection />
      <CreateYourOwn />
      <WhyChooseUs />
      <RealBridesGallery />
      <VisitAtelier />
      <GoogleReviews />
      <Newsletter />
      <FinalCta />
    </>
  );
}
