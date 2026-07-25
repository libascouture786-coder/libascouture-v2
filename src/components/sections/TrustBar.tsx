import { Sparkles, Scissors, Crown, HeartHandshake } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { trustPillars } from '@/config/site';

const icons: Record<string, typeof Sparkles> = {
  Sparkles,
  Scissors,
  Crown,
  HeartHandshake,
};

export function TrustBar() {
  return (
    <Section background="white" className="!py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustPillars.map((pillar, i) => {
          const Icon = icons[pillar.icon] ?? Sparkles;
          return (
            <Reveal key={pillar.title} delay={i * 100}>
              <div className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Icon size={22} strokeWidth={1.25} />
                </span>
                <h3 className="mt-4 text-sm font-medium uppercase tracking-[0.1em] text-navy-900">{pillar.title}</h3>
                <p className="mt-2 max-w-xs text-xs font-light leading-relaxed text-charcoal-500">{pillar.body}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
