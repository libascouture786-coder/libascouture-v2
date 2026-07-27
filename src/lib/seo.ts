import { site } from '@/config/site';

export const SITE_URL = 'https://libascouture.in';

export type Schema = Record<string, unknown>;

function compact<T extends Schema>(obj: T): T {
  const out: Schema = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

export function organizationSchema(): Schema {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/logo.png`,
    description: site.description,
    email: site.contact.email,
    telephone: site.contact.phoneRaw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      postalCode: site.address.pincode,
      addressCountry: site.address.country,
    },
    sameAs: [
      site.social.instagram,
      site.social.youtube,
      site.social.facebook,
    ],
  });
}

export function localBusinessSchema(): Schema {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: site.name,
    description: site.description,
    url: SITE_URL,
    telephone: site.contact.phoneRaw,
    email: site.contact.email,
    image: `${SITE_URL}/assets/images/logo.png`,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      postalCode: site.address.pincode,
      addressCountry: site.address.country,
    },
    geo: site.contact.mapsLink ? { '@type': 'Place', hasMap: site.contact.mapsLink } : undefined,
    hasMap: site.contact.mapsLink || undefined,
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.day,
      opens: h.time.split('—')[0]?.trim() || '11:00',
      closes: h.time.split('—')[1]?.trim() || '20:00',
    })),
    sameAs: [site.social.instagram, site.social.youtube, site.social.facebook],
  });
}

export function websiteSchema(): Schema {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: SITE_URL,
    description: site.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/collections?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });
}

export type BreadcrumbItem = { name: string; url: string };

export function breadcrumbSchema(items: BreadcrumbItem[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type ProductSchemaInput = {
  title: string;
  description: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  price?: number | null;
  currency?: string;
  category?: string;
  customisable?: boolean;
  sku?: string | null;
};

export function productSchema(input: ProductSchemaInput): Schema {
  const url = `${SITE_URL}/product/${input.slug}`;
  const hasPrice = input.price != null && input.price > 0;
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.title,
    description: input.description,
    url,
    sku: input.sku || input.slug,
    category: input.category,
    brand: { '@type': 'Brand', name: site.name },
    image: input.image ? [input.image] : undefined,
    offers: hasPrice
      ? {
          '@type': 'Offer',
          price: String(input.price),
          priceCurrency: input.currency || 'INR',
          availability: 'https://schema.org/InStock',
          url,
          seller: { '@type': 'Organization', name: site.name },
        }
      : {
          '@type': 'Offer',
          priceCurrency: input.currency || 'INR',
          availability: 'https://schema.org/InStock',
          url,
          seller: { '@type': 'Organization', name: site.name },
        },
  });
}

export function faqSchema(faqs: { q: string; a: string }[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
