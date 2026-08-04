import { ExternalLink } from 'lucide-react';

type Props = {
  /** Path on the public site, e.g. '/collections' or '/product/some-slug' */
  to: string;
  /** Optional label override */
  label?: string;
};

/**
 * Opens the public-facing site in a new tab. Never publishes or mutates data.
 */
export function PreviewButton({ to, label = 'Preview' }: Props) {
  const href = to.startsWith('http') ? to : to;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-charcoal-600 transition-colors hover:bg-ivory-200 hover:text-navy-900"
    >
      <ExternalLink size={14} /> {label}
    </a>
  );
}
