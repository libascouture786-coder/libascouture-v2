import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'gold' | 'secondary' | 'tertiary' | 'ghost' | 'outline-light';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  ghost: 'btn-ghost',
  'outline-light': 'btn-outline-light',
};

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-xs',
  md: '',
  lg: 'px-9 py-4 text-sm',
  icon: 'h-11 w-11 p-0',
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  to,
  ...rest
}: BaseProps & Omit<LinkProps, 'to'> & { to: LinkProps['to'] }) {
  return (
    <Link className={`${variants[variant]} ${sizes[size]} ${className}`} to={to} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  ...rest
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      href={href}
      {...rest}
    >
      {children}
    </a>
  );
}
