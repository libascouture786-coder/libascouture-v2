import { Seo } from '@/components/ui/Seo';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ButtonLink } from '@/components/ui/Button';
import { getImage } from '@/config/images';
import { trustPillars, whyChooseUs } from '@/config/site';
import { localBusinessSchema, breadcrumbSchema, SITE_URL } from '@/lib/seo';
import { Sparkles, Scissors, Crown, HeartHandshake, Settings2, Layers, UserCheck, PenTool, Focus, ArrowRight } from 'lucide-react';

const trustIcons: Record<string, typeof Sparkles> = { Sparkles, Scissors, Crown, HeartHandshake };
const whyIcons: Record<string, typeof Sparkles> = { Settings2, Layers, Sparkles, UserCheck, PenTool, Focus };

export function About() {
  return (
    <>
      <Seo
        title="About"
        description="The story, craftsmanship, and philosophy of LIBAS COUTURE — a luxury bridal couture house in Chandni Chowk, Delhi."
        canonical="https://libascouture.in/about"
        jsonLd={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'About', url: `${SITE_URL}/about` },
          ]),
        ]}
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      {/* Hero */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden bg-navy-900">
        <img src={getImage('about.story')} alt="LIBAS COUTURE atelier" className="absolute inset-0 h-full w-full object-cover opacity-35" fetchPriority="high" />
        <div className="absolute inset-0 bg-navy-950/40" aria-hidden />
        <div className="container-luxury relative text-center">
          <Reveal>
            <p className="heading-eyebrow text-gold-300">Our Story</p>
            <h1 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
              The House of LIBAS COUTURE
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <Section background="ivory">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <Reveal>
            <img src={getImage('about.story')} alt="LIBAS COUTURE craftsmanship" loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-luxury-lg object-cover" />
          </Reveal>
          <Reveal delay={120}>
            <h2 className="text-h2 font-serif font-medium text-navy-900">A Legacy of Hand Embroidery</h2>
            <p className="mt-5 text-base font-light leading-relaxed text-charcoal-600">
              LIBAS COUTURE was born from a passion for preserving the centuries-old art of hand embroidery. In the heart of Chandni Chowk, Delhi, our atelier brings together master karigars whose skills have been passed down through generations.
            </p>
            <p className="mt-4 text-base font-light leading-relaxed text-charcoal-600">
              Every silhouette we create is a testament to the power of craftsmanship — a celebration of the individuality of each bride who entrusts us with her most precious moments.
            </p>
            <p className="mt-4 text-base font-light leading-relaxed text-charcoal-600">
              From the first sketch to the final fitting, we believe couture is not just about clothing — it is about creating heirlooms that carry stories, emotions, and love across generations.
            </p>
            <div className="mt-8">
              <ButtonLink to="/collections/bridal" variant="primary" size="md">
                Explore Collection <ArrowRight size={16} className="ml-1" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Trust pillars */}
      <Section background="white">
        <Reveal>
          <SectionHeading eyebrow="Our Promise" title="What Sets Us Apart" description="Four pillars that define every LIBAS COUTURE creation." />
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((p, i) => {
            const Icon = trustIcons[p.icon] ?? Sparkles;
            return (
              <Reveal key={p.title} delay={i * 80}>
                <div className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                    <Icon size={24} strokeWidth={1.25} />
                  </span>
                  <h3 className="mt-5 text-base font-serif font-medium text-navy-900">{p.title}</h3>
                  <p className="mt-2 max-w-xs mx-auto text-sm font-light leading-relaxed text-charcoal-500">{p.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Atelier image */}
      <section className="relative overflow-hidden">
        <div className="relative h-[50vh] min-h-[360px]">
          <img src={getImage('about.atelier')} alt="Inside the LIBAS COUTURE atelier" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-navy-950/40" aria-hidden />
        </div>
      </section>

      {/* Why choose us */}
      <Section background="ivory">
        <Reveal>
          <SectionHeading eyebrow="The Difference" title="Why Brides Choose LIBAS" />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, i) => {
            const Icon = whyIcons[item.icon] ?? Sparkles;
            return (
              <Reveal key={item.title} delay={i * 70}>
                <div className="card-luxury p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                    <Icon size={20} strokeWidth={1.25} />
                  </span>
                  <h3 className="mt-4 text-base font-serif font-medium text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-charcoal-500">{item.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
