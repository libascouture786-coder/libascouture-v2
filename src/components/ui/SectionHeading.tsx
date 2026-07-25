import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  className = '',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const titleColor = light ? 'text-ivory-100' : 'text-navy-900';
  const descColor = light ? 'text-ivory-200/80' : 'text-charcoal-500';

  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <p className="heading-eyebrow mb-4" style={align === 'center' ? { marginInline: 'auto' } : undefined}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-h2 font-serif font-medium text-balance ${titleColor}`}>{title}</h2>
      {description && (
        <p className={`mt-4 text-base leading-relaxed font-sans font-light ${descColor}`}>
          {description}
        </p>
      )}
    </div>
  );
}
