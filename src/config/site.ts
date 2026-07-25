export const site = {
  name: 'LIBAS COUTURE',
  tagline: 'Bespoke Hand Embroidery',
  shortName: 'LIBAS',
  description:
    'A luxury bridal couture house specializing in bespoke hand embroidery and handcrafted heirloom-quality bridal wear.',
  address: {
    line1: '195/2, First Floor',
    line2: 'Katra Nawab, Chandni Chowk',
    city: 'Delhi',
    pincode: '110006',
    country: 'India',
    full: '195/2, First Floor, Katra Nawab, Chandni Chowk, Delhi - 110006',
  },
  contact: {
    phoneDisplay: '+91 95110 22858',
    phoneRaw: '+919511022858',
    whatsappNumber: '919511022858',
    whatsappLink: 'https://wa.me/919511022858',
    email: 'atelier@libascouture.in',
    mapsLink: 'https://maps.app.goo.gl/Fd3o18QA4chv9zoc8?g_st=ac',
    mapsEmbed:
      'https://maps.google.com/maps?q=Katra+Nawab+Chandni+Chowk+Delhi+110006+India&t=&z=16&ie=UTF8&iwloc=&output=embed',
  },
  social: {
    instagram: 'https://www.instagram.com/libascouture.in',
    youtube: 'https://www.youtube.com/@Libascoutureofficial',
    facebook: 'https://www.facebook.com/share/18CN2GgvtZ/',
    whatsapp: 'https://wa.me/919511022858',
  },
  hours: [{ day: 'Monday — Sunday', time: '11:00 AM — 8:00 PM' }],
  whatsappMessage: "Hello LIBAS COUTURE, I'd love to learn more about your bespoke bridal couture.",
  announcements: [
    '✦ Bespoke Hand Embroidery — Crafted For You',
    '✦ Fully Customisable Bridal Couture',
    '✦ Book Your Personal Bridal Consultation',
    '✦ Visit Our Chandni Chowk Showroom',
    '✦ New Collection — Inquire Today',
  ],
} as const;

export type NavItem    = { label: string; href: string; description?: string; imageKey?: string };
export type NavSection = NavItem & { children?: NavItem[] };

export const navigation: NavSection[] = [
  { label: 'Bridal Collection', href: '/collections/bridal',   description: 'Heirloom bridal couture, hand-embroidered for your once-in-a-lifetime day.', imageKey: 'category.bridal' },
  { label: 'Occasion Wear',     href: '/collections/occasion', description: 'Refined ensembles for engagements, receptions, and milestone celebrations.',  imageKey: 'category.occasion' },
  { label: 'Sarees',            href: '/collections/sarees',   description: 'Handwoven and hand-embroidered sarees in the finest silks and organzas.',     imageKey: 'category.sarees' },
  { label: 'Suits',             href: '/collections/suits',    description: 'Tailored couture suits with exquisite detailing and perfect fit.',            imageKey: 'category.suits' },
  { label: 'Create Your Own',   href: '/create-your-own',      description: 'A bespoke atelier experience — co-create a one-of-a-kind silhouette.',       imageKey: 'category.create' },
  { label: 'About',             href: '/about',                description: 'The story, craftsmanship, and philosophy of the LIBAS COUTURE house.',        imageKey: 'category.about' },
  { label: 'Contact',           href: '/contact',              description: 'Visit our Chandni Chowk atelier or book a private appointment.',              imageKey: 'category.contact' },
];

export const megaMenuCategories = [
  { slug: 'bridal',      title: 'Bridal Collection',    imageKey: 'category.bridal'      },
  { slug: 'reception',   title: 'Reception',            imageKey: 'category.reception'   },
  { slug: 'engagement',  title: 'Engagement',           imageKey: 'category.engagement'  },
  { slug: 'mehendi',     title: 'Mehendi',              imageKey: 'category.mehendi'     },
  { slug: 'haldi',       title: 'Haldi',                imageKey: 'category.haldi'       },
  { slug: 'sangeet',     title: 'Sangeet',              imageKey: 'category.sangeet'     },
  { slug: 'nikah',       title: 'Nikah',                imageKey: 'category.nikah'       },
  { slug: 'walima',      title: 'Walima',               imageKey: 'category.walima'      },
  { slug: 'sarees',      title: 'Luxury Sarees',        imageKey: 'category.sarees'      },
  { slug: 'suits',       title: 'Luxury Suits',         imageKey: 'category.suits'       },
  { slug: 'indo-western',title: 'Indo Western',         imageKey: 'category.indowestern' },
  { slug: 'anarkali',    title: 'Anarkali',             imageKey: 'category.occasion'    },
  { slug: 'sharara',     title: 'Sharara',              imageKey: 'category.mehendi'     },
  { slug: 'gharara',     title: 'Gharara',              imageKey: 'category.haldi'       },
  { slug: 'veil',        title: 'Veil & Trail',         imageKey: 'category.bridal'      },
  { slug: 'dupatta',     title: 'Dupatta',              imageKey: 'category.sarees'      },
] as const;

export const megaMenuHighlights = ['New Arrivals', 'Best Sellers', 'Trending Designs', 'Recently Added'] as const;

export const signatureCollections = [
  { slug: 'bridal',       title: 'Bridal Collection',    excerpt: 'Heirloom couture hand-embroidered for your once-in-a-lifetime day.',         imageKey: 'category.bridal'      },
  { slug: 'reception',    title: 'Reception Collection', excerpt: 'Resplendent silhouettes that command every grand reception hall.',             imageKey: 'category.reception'   },
  { slug: 'engagement',   title: 'Engagement Collection',excerpt: 'Perfectly refined ensembles for the first celebration of your love story.',   imageKey: 'category.engagement'  },
  { slug: 'mehendi',      title: 'Mehendi Collection',   excerpt: 'Vibrant handcrafted ensembles that celebrate the joy of mehendi.',            imageKey: 'category.mehendi'     },
  { slug: 'haldi',        title: 'Haldi Collection',     excerpt: 'Soft, joyful silhouettes crafted for the golden glow of haldi rituals.',      imageKey: 'category.haldi'       },
  { slug: 'sangeet',      title: 'Sangeet Collection',   excerpt: 'Statement pieces designed for you to move, dance, and be adored.',           imageKey: 'category.sangeet'     },
  { slug: 'nikah',        title: 'Nikah Collection',     excerpt: 'Timeless and graceful couture rooted in heritage and modern elegance.',       imageKey: 'category.nikah'       },
  { slug: 'walima',       title: 'Walima Collection',    excerpt: 'Luxurious bridal attire for the celebration that follows the union.',         imageKey: 'category.walima'      },
  { slug: 'sarees',       title: 'Luxury Sarees',        excerpt: 'Handwoven and hand-embroidered sarees in the finest silks and organzas.',     imageKey: 'category.sarees'      },
  { slug: 'suits',        title: 'Luxury Suits',         excerpt: 'Bespoke tailored suits with exquisite hand embroidery and perfect fit.',      imageKey: 'category.suits'       },
  { slug: 'indo-western', title: 'Indo Western',         excerpt: 'Contemporary silhouettes that honour heritage while embracing modernity.',    imageKey: 'category.indowestern' },
] as const;

export const collections = [
  { slug: 'bridal',         title: 'Bridal Collection', excerpt: 'Heirloom bridal couture, hand-embroidered for your once-in-a-lifetime day.', imageKey: 'category.bridal'   },
  { slug: 'occasion',       title: 'Occasion Wear',     excerpt: 'Refined ensembles for engagements, receptions, and milestone celebrations.',  imageKey: 'category.occasion' },
  { slug: 'sarees',         title: 'Sarees',            excerpt: 'Handwoven and hand-embroidered sarees in the finest silks and organzas.',     imageKey: 'category.sarees'   },
  { slug: 'suits',          title: 'Suits',             excerpt: 'Tailored couture suits with exquisite detailing and perfect fit.',            imageKey: 'category.suits'    },
  { slug: 'create-your-own',title: 'Create Your Own',  excerpt: 'A bespoke atelier experience — co-create a one-of-a-kind silhouette.',       imageKey: 'category.create'   },
] as const;

export const occasions = [
  { label: 'Bridal',      slug: 'bridal',      imageKey: 'category.bridal'     },
  { label: 'Reception',   slug: 'reception',   imageKey: 'category.reception'  },
  { label: 'Engagement',  slug: 'engagement',  imageKey: 'category.engagement' },
  { label: 'Haldi',       slug: 'haldi',       imageKey: 'category.haldi'      },
  { label: 'Mehendi',     slug: 'mehendi',     imageKey: 'category.mehendi'    },
  { label: 'Sangeet',     slug: 'sangeet',      imageKey: 'category.sangeet'    },
  { label: 'Nikah',       slug: 'nikah',       imageKey: 'category.nikah'      },
  { label: 'Walima',      slug: 'walima',      imageKey: 'category.walima'     },
  { label: 'Party Wear',  slug: 'party',       imageKey: 'category.occasion'   },
  { label: 'Festive Wear',slug: 'festive',     imageKey: 'category.indowestern'},
] as const;

export const trustPillars = [
  { title: 'Handcrafted Heirlooms',  body: 'Every silhouette is hand-embroidered by master karigars over hundreds of hours.',    icon: 'Sparkles'       },
  { title: 'Bespoke Atelier',        body: 'A private co-creation journey — from first sketch to final fitting.',                 icon: 'Scissors'       },
  { title: 'Royal Craftsmanship',    body: 'Centuries-old techniques — zardozi, gota, resham — reimagined for the modern bride.', icon: 'Crown'          },
  { title: 'Personalised Service',   body: 'Dedicated couture consultants guiding you from consultation to delivery.',            icon: 'HeartHandshake' },
] as const;

export const whyChooseUs = [
  { title: '100% Customisation',    body: 'Every detail personalised to your vision.',               icon: 'Settings2'  },
  { title: 'Premium Fabrics',       body: 'Raw silk, organza, velvet — sourced for perfection.',     icon: 'Layers'     },
  { title: 'Hand Embroidery',       body: 'Master karigars, centuries-old techniques.',              icon: 'Sparkles'   },
  { title: 'Personal Consultation', body: 'Dedicated stylist from first stitch to final fitting.',   icon: 'UserCheck'  },
  { title: 'Expert Designers',      body: 'Creative visionaries who understand your dream.',         icon: 'PenTool'    },
  { title: 'Attention To Detail',   body: 'Every bead, every border — crafted with precision.',     icon: 'Focus'      },
] as const;

export const embroideryTechniques = [
  { name: 'Zardozi',    desc: 'Metallic thread work woven into intricate floral patterns.' },
  { name: 'Dabka',      desc: 'Wire couching creating raised architectural embroidery.'    },
  { name: 'Cutdana',    desc: 'Tiny cut crystals catching light with every movement.'      },
  { name: 'Pearl Work', desc: 'Freshwater pearls hand-set for timeless luminosity.'        },
  { name: 'Sequins',    desc: 'Precision-placed sequins for a cinematic shimmer.'          },
  { name: 'Thread Work',desc: 'Fine resham threads woven into painterly motifs.'           },
] as const;

export const googleReviews = [
  { name: 'Aisha Rahman',    rating: 5, text: 'The craftsmanship is truly extraordinary. My bridal lehenga was everything I dreamed of — every detail hand-embroidered to perfection.', date: 'October 2024' },
  { name: 'Priya Sharma',    rating: 5, text: 'LIBAS COUTURE gave me the most beautiful experience. From the consultation to the final fitting, every moment felt special. Unmatched quality.', date: 'November 2024' },
  { name: 'Fatima Al-Sayed', rating: 5, text: 'I ordered a bespoke walima outfit and was blown away by the results. The zardozi work is breathtaking. My guests were in awe.', date: 'September 2024' },
  { name: 'Meera Kapoor',    rating: 5, text: 'Exceptional service and stunning workmanship. The team understood my vision perfectly and created something even more beautiful than I imagined.', date: 'December 2024' },
] as const;

export const searchFacets = {
  occasions:        ['Bridal', 'Engagement', 'Reception', 'Mehendi', 'Sangeet', 'Cocktail', 'Festive'],
  embroideryStyles: ['Zardozi', 'Gota Patti', 'Resham', 'Aari', 'Mirror Work', 'Cutdana', 'Dabka'],
  colors:           ['Ivory', 'Gold', 'Deep Red', 'Maroon', 'Emerald', 'Navy', 'Blush', 'Champagne'],
  fabrics:          ['Raw Silk', 'Organza', 'Velvet', 'Georgette', 'Chiffon', 'Brocade', 'Tissue'],
} as const;

export const slugLabels: Record<string, string> = {
  collections:    'Collections',
  bridal:         'Bridal Collection',
  reception:      'Reception',
  engagement:     'Engagement',
  mehendi:        'Mehendi',
  haldi:          'Haldi',
  sangeet:        'Sangeet',
  nikah:          'Nikah',
  walima:         'Walima',
  sarees:         'Luxury Sarees',
  suits:          'Luxury Suits',
  'indo-western': 'Indo Western',
  anarkali:       'Anarkali',
  sharara:        'Sharara',
  gharara:        'Gharara',
  veil:           'Veil & Trail',
  dupatta:        'Dupatta',
  occasion:       'Occasion Wear',
  party:          'Party Wear',
  festive:        'Festive Wear',
  'create-your-own': 'Create Your Own',
  about:          'About',
  contact:        'Contact',
  wishlist:       'Wishlist',
  appointments:   'Appointments',
  measurements:   'Measurements',
};
