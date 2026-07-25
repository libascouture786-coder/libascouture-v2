import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { embroideryTechniques } from '@/config/site';
import { getImage } from '@/config/images';

export function EmbroiderySection() {
  return (
    <Section background="navy" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-30" aria-hidden />
      <div className="relative">
        <Reveal>
          <SectionHeading
            eyebrow="Hand Embroidery"
            title="Centuries of Craft, Reimagined"
            description="Our master karigars breathe life into fabric using techniques passed down through generations."
            light
          />
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {embroideryTechniques.map((tech, i) => (
            <Reveal key={tech.name} delay={i * 80}>
              <div className="group rounded-luxury-lg border border-ivory-200/10 bg-navy-800/40 p-6 transition-all duration-luxury hover:border-gold-400/30 hover:bg-navy-800/60">
                <h3 className="text-lg font-serif font-medium text-gold-300">{tech.name}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-ivory-200/65">{tech.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={300}>
          <div className="mt-12 overflow-hidden rounded-luxury-lg">
            <img
              src={getImage('craftsmanship.embroidery')}
              alt="Intricate hand embroidery detail"
              loading="lazy"
              decoding="async"
              className="h-[400px] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
