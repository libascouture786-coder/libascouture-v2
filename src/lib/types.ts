export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
  view_type: string | null;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  category_id: string | null;
  price: number | null;
  price_on_request: boolean;
  occasion: string | null;
  embroidery_style: string | null;
  fabric: string | null;
  color: string | null;
  image_keys: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  code: string | null;
  category_slug: string | null;
  story: string | null;
  price_type: string | null;
  status: string | null;
  work_type: string | null;
  fabric_main: string | null;
  fabric_blouse: string | null;
  fabric_dupatta: string | null;
  occasions: string[] | null;
  embroidery: string[] | null;
  includes: string[] | null;
  highlights: string[] | null;
  colors: string[] | null;
  tags: string[] | null;
  is_new: boolean;
  is_best_seller: boolean;
  customisable: boolean;
};

export type ProductWithImages = Product & {
  images: ProductImage[];
};

export const statusLabels: Record<string, string> = {
  signature: 'Signature Piece',
  made_on_order: 'Made to Order',
  ready_to_ship: 'Ready to Ship',
};

export const priceTypeLabels: Record<string, string> = {
  price_on_request: 'Price on Request',
  fixed: 'Fixed Price',
  range: 'Price Range',
};

export const workTypeLabels: Record<string, string> = {
  handwork: 'Handwork',
  machine: 'Machine Work',
  mixed: 'Mixed Work',
};

export function formatPrice(price: number | null): string {
  if (!price) return 'Price on Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}
