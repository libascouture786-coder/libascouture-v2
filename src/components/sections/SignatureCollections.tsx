import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { signatureCollections } from '@/config/site';
import { getImage } from '@/config/images';

export function SignatureCollections() {
  return (
    <Section background="ivory">
      <Reveal>
        <SectionHeading
          eyebrow="Signature Collections"
          title="Couture for Every Celebration"
          description="From bridal heirlooms to festive statements — each piece hand-embroidered to tell your unique story."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {signatureCollections.slice(0, 6).map((col, i) => (
          <Reveal key={col.slug} delay={i * 80}>
            <Link to={`/collections/${col.slug}`} className="group block">
              <div className="zoom-wrap relative aspect-[3/4] rounded-luxury-lg overflow-hidden">
                <img
                  src={getImage(col.imageKey)}
                  alt={col.title}
                  loading="lazy"
                  decoding="async"
                  className="zoom-img"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/10 to-transparent" aria-hidden />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-serif font-medium text-ivory-100">{col.title}</h3>
                  <p className="mt-1.5 max-w-xs text-xs font-light leading-relaxed text-ivory-200/75">{col.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-gold-300 transition-colors group-hover:text-gold-200">
                    Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
