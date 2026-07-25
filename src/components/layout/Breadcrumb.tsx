import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { slugLabels } from '@/config/site';

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: Crumb[];
  light?: boolean;
};

export function Breadcrumb({ items, light = false }: BreadcrumbProps) {
  const baseColor = light ? 'text-ivory-200/60' : 'text-charcoal-400';
  const activeColor = light ? 'text-gold-300' : 'text-navy-900';
  const linkColor = light ? 'text-ivory-200/70 hover:text-gold-300' : 'text-charcoal-500 hover:text-gold-700';

  return (
    <nav aria-label="Breadcrumb" className="container-luxury pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-light tracking-wide">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link to={item.href} className={`transition-colors duration-luxury ${linkColor}`}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? activeColor : baseColor} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={12} className={light ? 'text-ivory-200/30' : 'text-charcoal-300'} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Helper: build crumbs from a slug route like /collections/bridal */
export function crumbsFromPath(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  let accumulated = '';
  segments.forEach((seg, i) => {
    accumulated += `/${seg}`;
    const isLast = i === segments.length - 1;
    const label = slugLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push(isLast ? { label } : { label, href: accumulated });
  });
  return crumbs;
}
