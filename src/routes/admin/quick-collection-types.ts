import { fabricOptions, colorSwatches } from '@/config/customisation';

export type QuickProduct = {
  id: string;
  imageUrl: string;
  name: string;
  code: string;
  color: string;
  expanded: boolean;
  fabric_main: string;
  work_type: string;
  product_type: string;
  components: string[];
  accessories: string[];
  customisation_options: string[];
  customisation_level: string;
  description: string;
  seo_title: string;
  seo_description: string;
};

export type CollectionDefaults = {
  fabric_main: string;
  work_type: string;
  product_type: string;
  components: string[];
  accessories: string[];
  customisation_options: string[];
  customisation_level: string;
  description: string;
  seo_title: string;
  seo_description: string;
};

export type CollectionForm = {
  name: string;
  slug: string;
  banner_image: string;
  occasion: string;
  description: string;
  defaults: CollectionDefaults;
};

export const emptyDefaults: CollectionDefaults = {
  fabric_main: '',
  work_type: 'Hand Work',
  product_type: '',
  components: [],
  accessories: [],
  customisation_options: [],
  customisation_level: 'Fully Customisable',
  description: '',
  seo_title: '',
  seo_description: '',
};

export const emptyCollection: CollectionForm = {
  name: '', slug: '', banner_image: '', occasion: 'Wedding', description: '',
  defaults: { ...emptyDefaults },
};

export const occasionOptions = ['Wedding', 'Engagement', 'Other Functions'] as const;

export const productTypeOptions = [
  'Bridal Lehenga', 'Reception', 'Engagement', 'Nikah', 'Walima',
  'Mehendi', 'Haldi', 'Sangeet', 'Saree', 'Suit', 'Sharara',
  'Gharara', 'Anarkali', 'Indo Western',
] as const;

export const accessoryOptions = [
  'Potli', 'Tassels (Latkan)', 'Extra Belt', 'Second Dupatta',
  'Veil Dupatta', 'Cape', 'Jacket', 'Can Can',
] as const;

export const workTypeOptions = ['Hand Work', 'Machine Work', 'Mix Work'] as const;

export const customisationLevelOptions = [
  'Fully Customisable', 'Partially Customisable', 'Not Customisable',
] as const;

export const componentOptions = [
  'Lehenga', 'Choli / Blouse', 'Dupatta', 'Second Dupatta',
  'Veil', 'Cape', 'Jacket', 'Belt',
] as const;

export const customisationOptionList = [
  'Colour Change', 'Fabric Change', 'Blouse', 'Sleeves', 'Neckline',
  'Double Dupatta', 'Veil', 'Trail', 'Potli', 'Heavy Embroidery',
  'Light Embroidery', 'Other Requests',
] as const;

export function makeProduct(imageUrl: string, code: string, name: string): QuickProduct {
  return {
    id: crypto.randomUUID(),
    imageUrl,
    name,
    code,
    color: '',
    expanded: false,
    fabric_main: '',
    work_type: '',
    product_type: '',
    components: [],
    accessories: [],
    customisation_options: [],
    customisation_level: '',
    description: '',
    seo_title: '',
    seo_description: '',
  };
}

export function resolveProduct(p: QuickProduct, defaults: CollectionDefaults) {
  return {
    fabric_main: p.fabric_main || defaults.fabric_main,
    work_type: p.work_type || defaults.work_type,
    product_type: p.product_type || defaults.product_type,
    components: p.components.length > 0 ? p.components : defaults.components,
    accessories: p.accessories.length > 0 ? p.accessories : defaults.accessories,
    customisation_options: p.customisation_options.length > 0 ? p.customisation_options : defaults.customisation_options,
    customisation_level: p.customisation_level || defaults.customisation_level,
    description: p.description || defaults.description,
    seo_title: p.seo_title || defaults.seo_title,
    seo_description: p.seo_description || defaults.seo_description,
  };
}

export { fabricOptions, colorSwatches };
