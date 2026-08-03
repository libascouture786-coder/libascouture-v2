import { fabricOptions, colorSwatches } from '@/config/customisation';

export type QuickProduct = {
  id: string;
  imageUrl: string;
  name: string;
  code: string;
  price: string;
  product_type: string;
  color: string;
  fabric: string;
  work_type: string;
  savedProductId: string | null;
};

export const occasionOptions = ['Wedding', 'Engagement', 'Other Functions'] as const;

export const workTypeOptions = ['Hand Work', 'Machine Work', 'Mix Work'] as const;

export const productTypeOptions = [
  'Lehenga', 'Farshi', 'Veil', 'Saree', 'Suit', 'Gown',
  'Trail Dress', 'Dupatta', 'Blouse', 'Skirt', 'Kurti',
  'Jacket', 'Cape', 'Shrug', 'Anarkali', 'Sharara',
] as const;

/* Database CHECK constraint only allows these values for work_type */
const ALLOWED_WORK_TYPES = new Set([
  'Handwork', 'Machine Work', 'Mixed Work', 'Custom Couture', 'Ready Piece',
  'handwork', 'machine_work', 'mixed', 'Hand Work', 'Mix Work',
]);

export function sanitizeWorkType(value: string): string {
  if (!value) return 'handwork';
  if (ALLOWED_WORK_TYPES.has(value)) return value;
  const lower = value.toLowerCase();
  if (lower.includes('machine')) return 'Machine Work';
  if (lower.includes('mixed') || lower.includes('mix')) return 'Mix Work';
  if (lower.includes('custom') || lower.includes('couture')) return 'Custom Couture';
  if (lower.includes('ready')) return 'Ready Piece';
  if (lower.includes('hand')) return 'Hand Work';
  return 'handwork';
}

function uniqueSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/* Shared product payload builder — eliminates 4x duplication and fixes CHECK constraint violations */
export function buildProductData(
  product: QuickProduct,
  occasions: string[],
  isActive: boolean,
  index: number,
  status: string,
  isUpdate: boolean = false,
): Record<string, unknown> {
  const title = safeTrim(product.name) || safeTrim(product.code);
  const priceStr = safeTrim(product.price);
  const priceVal = priceStr ? parseFloat(priceStr) : null;

  const data: Record<string, unknown> = {
    title,
    code: safeTrim(product.code),
    excerpt: '',
    description: null,
    category_id: null,
    category_slug: 'bridal',
    price: priceVal,
    price_on_request: !priceVal,
    price_type: priceVal ? 'fixed' : 'price_on_request',
    status,
    work_type: sanitizeWorkType(product.work_type),
    occasion: occasions[0] ?? null,
    occasions,
    colors: product.color ? [product.color] : [],
    color: product.color || null,
    color_main: product.color || null,
    fabric: product.fabric || null,
    fabric_main: product.fabric || null,
    product_type: product.product_type || null,
    embroidery: [],
    includes: [],
    accessories: [],
    hand_work_details: [],
    customisation_options: [],
    customisation_level: 'Fully Customisable',
    customisable: true,
    highlights: [],
    care_instructions: null,
    website_placement: [],
    visibility: 'website',
    priority: 'Medium',
    related_product_ids: [],
    image_keys: [],
    is_active: isActive,
    is_featured: false,
    is_new: true,
    is_best_seller: false,
    sort_order: index,
    thumbnail_index: 0,
    video_url: null,
    seo_title: title,
    seo_description: null,
    image_alt_text: title,
  };

  if (!isUpdate) {
    data.slug = uniqueSlug(title);
  }

  return data;
}

export function makeProduct(imageUrl: string, code: string): QuickProduct {
  return {
    id: crypto.randomUUID(),
    imageUrl,
    name: '',
    code,
    price: '',
    product_type: '',
    color: '',
    fabric: '',
    work_type: '',
    savedProductId: null,
  };
}

export function safeTrim(value: string | undefined | null): string {
  return (value ?? '').trim();
}

export function extractErrorMessage(err: unknown): string {
  if (!err) return 'No error details available';
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string' && e.message) return e.message;
    if (typeof e.error === 'string' && e.error) return e.error;
    if (typeof e.details === 'string' && e.details) return e.details;
  }
  if (typeof err === 'string' && err) return err;
  try { return JSON.stringify(err); } catch { return 'No error details available'; }
}

export { fabricOptions, colorSwatches };
