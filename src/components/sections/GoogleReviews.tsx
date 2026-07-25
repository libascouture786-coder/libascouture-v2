import { Star, Quote } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { googleReviews } from '@/config/site';

export function GoogleReviews() {
  return (
    <Section background="white">
      <Reveal>
        <SectionHeading
          eyebrow="Client Love"
          title="Stories from Our Brides"
          description="Real experiences from the women who trusted us with their most precious moments."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {googleReviews.map((review, i) => (
          <Reveal key={review.name} delay={i * 80}>
            <div className="card-luxury h-full p-6">
              <div className="flex items-center gap-1 text-gold-500">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <Quote size={20} className="mt-4 text-gold-200" strokeWidth={1} />
              <p className="mt-3 text-sm font-light leading-relaxed text-charcoal-600">{review.text}</p>
              <div className="mt-5 border-t border-navy-50 pt-4">
                <p className="text-sm font-medium text-navy-900">{review.name}</p>
                <p className="mt-0.5 text-xs font-light text-charcoal-400">{review.date}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
