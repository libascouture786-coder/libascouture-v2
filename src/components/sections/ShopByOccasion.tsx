import { Link } from 'react-router-dom';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { occasions } from '@/config/site';
import { getImage } from '@/config/images';

export function ShopByOccasion() {
  return (
    <Section background="white">
      <Reveal>
        <SectionHeading
          eyebrow="Shop by Occasion"
          title="Find Your Perfect Moment"
          description="Whether it's your wedding day or a celebration of love — discover couture crafted for every occasion."
        />
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {occasions.map((occ, i) => (
          <Reveal key={occ.slug} delay={i * 60}>
            <Link to={`/collections/${occ.slug}`} className="group block">
              <div className="zoom-wrap relative aspect-square rounded-luxury-lg overflow-hidden">
                <img
                  src={getImage(occ.imageKey)}
                  alt={occ.label}
                  loading="lazy"
                  decoding="async"
                  className="zoom-img"
                />
                <div className="absolute inset-0 bg-navy-950/30 transition-colors duration-luxury group-hover:bg-navy-950/45" aria-hidden />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-center text-sm font-serif font-medium text-ivory-100">{occ.label}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
