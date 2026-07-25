import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

type EmptyStateProps = {
  title?: string;
  message?: string;
  children?: ReactNode;
};

export function EmptyState({
  title = 'Nothing here yet',
  message = "We're curating this collection. Please check back shortly.",
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-50 text-gold-500">
        <Compass size={28} strokeWidth={1.25} />
      </span>
      <h2 className="mt-6 font-serif text-2xl font-medium text-navy-900">{title}</h2>
      <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-charcoal-500">{message}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink to="/collections/bridal" variant="primary">
          Explore Bridal Collection
        </ButtonLink>
        <ButtonLink to="/" variant="tertiary">
          Return Home
        </ButtonLink>
      </div>
      {children}
    </div>
  );
}
