import type { ReactNode } from 'react';

type BadgeVariant = 'gold' | 'navy' | 'neutral' | 'success' | 'error';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variants: Record<BadgeVariant, string> = {
  gold: 'badge-gold',
  navy: 'badge-navy',
  neutral: 'badge-neutral',
  success: 'badge-success',
  error: 'badge-error',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return <span className={`${variants[variant]} ${className}`}>{children}</span>;
}
