import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
  showDivider?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  showDivider = true,
  className = '',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const titleColor = light ? 'text-ivory-100' : 'text-navy-900';
  const descColor = light ? 'text-ivory-200/80' : 'text-charcoal-500';
  const dividerClass = align === 'center' ? 'divider-gold' : 'divider-gold-left';

  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <p className={`mb-5 ${light ? 'heading-eyebrow-light' : 'heading-eyebrow'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-h2 font-serif font-medium text-balance ${titleColor}`}>{title}</h2>
      {showDivider && <div className={dividerClass} aria-hidden />}
      {description && (
        <p className={`mt-6 text-base leading-[1.7] font-sans font-light ${descColor} text-pretty`}>
          {description}
        </p>
      )}
    </div>
  );
}
