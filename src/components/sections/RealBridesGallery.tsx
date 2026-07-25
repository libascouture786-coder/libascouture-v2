import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { getImage } from '@/config/images';

const galleryImages = [
  { key: 'gallery.bride1', alt: 'Real bride in LIBAS COUTURE bridal lehenga' },
  { key: 'gallery.bride2', alt: 'Real bride in ivory couture gown' },
  { key: 'gallery.bride3', alt: 'Embroidery detail on bridal couture' },
  { key: 'gallery.bride4', alt: 'Real bride in red bridal lehenga' },
  { key: 'gallery.bride5', alt: 'Real bride in ivory bridal ensemble' },
  { key: 'gallery.bride6', alt: 'Real bride in couture collection' },
];

export function RealBridesGallery() {
  return (
    <Section background="ivory">
      <Reveal>
        <p className="heading-eyebrow text-center">Real Brides</p>
        <h2 className="mt-4 text-center text-h2 font-serif font-medium text-navy-900 text-balance">
          Loved by Brides Across India
        </h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {galleryImages.map((img, i) => (
          <Reveal key={img.key} delay={i * 50}>
            <div className="zoom-wrap relative aspect-[3/4] rounded-luxury overflow-hidden">
              <img
                src={getImage(img.key)}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="zoom-img"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
