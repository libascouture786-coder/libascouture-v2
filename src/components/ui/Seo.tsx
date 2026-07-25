import { useEffect } from 'react';

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
};

const SITE_NAME = 'LIBAS COUTURE';

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

export function Seo({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  noindex = false,
}: SeoProps) {
  useEffect(() => {
    if (title) document.title = `${title} | ${SITE_NAME}`;
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', ogDescription ?? description);
    }
    if (ogTitle || title) {
      setMeta('property', 'og:title', ogTitle ?? `${title ?? ''} | ${SITE_NAME}`);
    }
    setMeta('property', 'og:site_name', SITE_NAME);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    if (canonical) {
      setLink('canonical', canonical);
      setMeta('property', 'og:url', canonical);
    }
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    return () => {
      document.title = `${SITE_NAME} | Bespoke Hand Embroidery — Luxury Bridal Couture`;
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noindex]);

  return null;
}
