/* Official LIBAS COUTURE local assets */
const LOGO            = '/assets/images/logo.png';
const HERO_STORE      = '/assets/images/hero/file_00000000ecbc71f59f5f073bacc41d4d_-_Copy.png';
const COLLECTION_F1   = '/assets/images/collections/file_00000000f2d871f5b71308ef542e5beb.png';
const COLLECTION_F2   = '/assets/images/collections/file_00000000f7b47243b9ffc545aece98f3.png';
const EMBROIDERY_F1   = '/assets/images/embroidery/file_000000001c5871f49f2644bd4f567126.png';

/* Product images (local assets) */
const RED_LEHENGA_FRONT  = '/assets/images/products/IMG_0993.JPG.jpeg';
const RED_LEHENGA_BACK   = '/assets/images/products/IMG_1020.JPG.jpeg';
const IVORY_LEHENGA_FRONT = '/assets/images/products/file_00000000115872308d563035b6a96341.png';
const IVORY_LEHENGA_BACK  = '/assets/images/products/file_000000004e9c71fab1a26edda7f4c29e.png';

export const images = {
  logo: LOGO,

  hero: {
    main:      RED_LEHENGA_FRONT,
    secondary: IVORY_LEHENGA_FRONT,
    editorial: RED_LEHENGA_BACK,
    store:     HERO_STORE,
  },

  category: {
    bridal:      IVORY_LEHENGA_FRONT,
    reception:   RED_LEHENGA_FRONT,
    engagement:  COLLECTION_F2,
    mehendi:     'https://images.pexels.com/photos/2058720/pexels-photo-2058720.jpeg?auto=compress&cs=tinysrgb&w=900',
    haldi:       'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=900',
    sangeet:     RED_LEHENGA_BACK,
    nikah:       EMBROIDERY_F1,
    walima:      IVORY_LEHENGA_BACK,
    sarees:      COLLECTION_F1,
    suits:       HERO_STORE,
    indowestern: 'https://images.pexels.com/photos/2843951/pexels-photo-2843951.jpeg?auto=compress&cs=tinysrgb&w=900',
    occasion:    RED_LEHENGA_FRONT,
    create:      EMBROIDERY_F1,
    about:       IVORY_LEHENGA_FRONT,
    contact:     IVORY_LEHENGA_BACK,
  },

  craftsmanship: {
    embroidery: EMBROIDERY_F1,
    fabric:     'https://images.pexels.com/photos/631292/pexels-photo-631292.jpeg?auto=compress&cs=tinysrgb&w=1200',
    atelier:    HERO_STORE,
    detail:     COLLECTION_F2,
  },

  about: {
    story:   IVORY_LEHENGA_FRONT,
    atelier: HERO_STORE,
    detail:  EMBROIDERY_F1,
  },

  home: {
    featuredBanner:  RED_LEHENGA_BACK,
    createYourOwn:   EMBROIDERY_F1,
    atelierBanner:   HERO_STORE,
    editorial1:      IVORY_LEHENGA_FRONT,
    editorial2:      RED_LEHENGA_FRONT,
    editorial3:      IVORY_LEHENGA_BACK,
    editorial4:      RED_LEHENGA_BACK,
    editorial5:      COLLECTION_F1,
    editorial6:      COLLECTION_F2,
  },

  gallery: {
    bride1: RED_LEHENGA_FRONT,
    bride2: IVORY_LEHENGA_FRONT,
    bride3: EMBROIDERY_F1,
    bride4: RED_LEHENGA_BACK,
    bride5: IVORY_LEHENGA_BACK,
    bride6: COLLECTION_F1,
  },

  notFound: IVORY_LEHENGA_FRONT,
} as const;

export type ImageKey = keyof typeof images;

/** Resolve a dotted image key (e.g. "hero.main") to its URL. */
export function getImage(key: string): string {
  const parts = key.split('.');
  let node: unknown = images;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return images.hero.main;
    }
  }
  return typeof node === 'string' ? node : images.hero.main;
}
