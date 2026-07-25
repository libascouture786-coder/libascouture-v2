import type { ReactNode } from 'react';
import { Container } from './Container';

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'ivory' | 'white' | 'navy' | 'grain';
  containerClassName?: string;
};

const backgrounds: Record<NonNullable<SectionProps['background']>, string> = {
  ivory: 'bg-ivory-100',
  white: 'bg-white',
  navy: 'bg-navy-900 text-ivory-100',
  grain: 'bg-ivory-100 bg-grain',
};

export function Section({
  children,
  className = '',
  id,
  background = 'ivory',
  containerClassName = '',
}: SectionProps) {
  return (
    <section id={id} className={`section-spacing ${backgrounds[background]} ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
