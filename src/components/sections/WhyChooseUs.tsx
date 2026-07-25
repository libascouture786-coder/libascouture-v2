import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { whyChooseUs } from '@/config/site';
import { Settings2, Layers, Sparkles, UserCheck, PenTool, Focus } from 'lucide-react';

const icons: Record<string, typeof Settings2> = {
  Settings2,
  Layers,
  Sparkles,
  UserCheck,
  PenTool,
  Focus,
};

export function WhyChooseUs() {
  return (
    <Section background="white">
      <Reveal>
        <SectionHeading
          eyebrow="Why Choose LIBAS"
          title="The LIBAS COUTURE Difference"
          description="Every detail matters — from the first sketch to the final fitting."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {whyChooseUs.map((item, i) => {
          const Icon = icons[item.icon] ?? Sparkles;
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
  );
}
