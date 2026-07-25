import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { getImage } from '@/config/images';

export function FeaturedBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[70vh] min-h-[480px]">
        <img
          src={getImage('home.featuredBanner')}
          alt="Featured bridal couture collection"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/40 to-transparent" aria-hidden />
        <div className="container-luxury relative flex h-full items-center">
          <div className="max-w-lg py-16">
            <Reveal>
              <p className="heading-eyebrow text-gold-300">Featured Collection</p>
              <h2 className="mt-4 text-display font-serif font-medium text-ivory-100 text-balance">
                The Art of Hand Embroidery
              </h2>
              <p className="mt-5 max-w-md text-base font-light leading-relaxed text-ivory-200/80">
                Every stitch tells a story. Discover the centuries-old techniques that make each LIBAS COUTURE piece an heirloom in the making.
              </p>
              <div className="mt-8">
                <ButtonLink to="/collections/bridal" variant="gold" size="lg">
                  Explore Bridal Collection <ArrowRight size={16} className="ml-1" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
