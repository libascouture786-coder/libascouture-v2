import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { getImage } from '@/config/images';

type LogoProps = {
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  to?: string | null;
  onClick?: () => void;
};

const sizeMap = {
  sm: { img: 'h-10 md:h-11',  tagline: 'text-[7px]',  name: 'text-sm',   gap: 'gap-2.5' },
  md: { img: 'h-14 md:h-16',  tagline: 'text-[8px]',  name: 'text-lg',   gap: 'gap-3'   },
  lg: { img: 'h-20 md:h-24',  tagline: 'text-[10px]', name: 'text-2xl',  gap: 'gap-3.5' },
};

export function Logo({
  variant = 'dark',
  showTagline = true,
  className = '',
  size = 'md',
  to = '/',
  onClick,
}: LogoProps) {
  const s = sizeMap[size];
  const nameColor = variant === 'dark' ? 'text-navy-900' : 'text-ivory-100';
  const taglineColor = variant === 'dark' ? 'text-gold-600' : 'text-gold-300';

  const content = (
    <span className={`flex items-center ${s.gap} transition-opacity duration-luxury ease-luxury hover:opacity-90`}>
      <img
        src={getImage('logo')}
        alt={`${site.name} — ${site.tagline}`}
        className={`${s.img} w-auto shrink-0 object-contain`}
        loading="eager"
        decoding="auto"
        draggable={false}
      />
      <span className="flex flex-col items-start leading-none">
        <span className={`font-serif font-semibold tracking-[0.14em] ${s.name} ${nameColor}`}>
          {site.name}
        </span>
        {showTagline && (
          <span className={`mt-1 font-sans uppercase ${s.tagline} tracking-[0.3em] ${taglineColor}`}>
            {site.tagline}
          </span>
        )}
      </span>
    </span>
  );

  if (to === null) {
    return <span className={className}>{content}</span>;
  }
  return (
    <Link to={to} className={className} aria-label={`${site.name} — ${site.tagline}`} onClick={onClick}>
      {content}
    </Link>
  );
}
