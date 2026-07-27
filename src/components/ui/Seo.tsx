import { useEffect } from 'react';
import { SITE_URL, type Schema } from '@/lib/seo';
import { site } from '@/config/site';

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  jsonLd?: Schema | Schema[];
};

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ID = 'seo-jsonld';

function setJsonLd(schemas: Schema[] | undefined) {
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (!schemas || schemas.length === 0) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = JSONLD_ID;
  script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  document.head.appendChild(script);
}

const DEFAULT_TITLE = `${site.name} | ${site.tagline} — Luxury Bridal Couture`;
const DEFAULT_DESC = site.description;
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/logo.png`;

export function Seo({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : DEFAULT_TITLE;
    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', ogTitle ?? fullTitle);
    setMeta('property', 'og:description', ogDescription ?? description);
    setMeta('property', 'og:site_name', site.name);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:image', ogImage);
    if (canonical) {
      setLink('canonical', canonical);
      setMeta('property', 'og:url', canonical);
    }

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', ogTitle ?? fullTitle);
    setMeta('name', 'twitter:description', ogDescription ?? description);
    setMeta('name', 'twitter:image', ogImage);

    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');

    const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : undefined;
    setJsonLd(schemas);

    return () => {
      document.title = DEFAULT_TITLE;
      setJsonLd(undefined);
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, ogType, noindex, jsonLd]);

  return null;
}
