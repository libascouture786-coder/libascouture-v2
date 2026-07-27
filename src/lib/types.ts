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
  video_url: string | null;
  color_main: string | null;
  color_dupatta1: string | null;
  fabric_dupatta1: string | null;
  color_dupatta2: string | null;
  fabric_dupatta2: string | null;
  thumbnail_index: number;
  product_type: string | null;
  accessories: string[] | null;
  hand_work_details: string[] | null;
  customisation_level: string | null;
  care_instructions: string | null;
  website_placement: string[] | null;
  visibility: string | null;
  priority: string | null;
  related_product_ids: string[] | null;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  collection_type: string | null;
  cover_product_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CollectionProduct = {
  id: string;
  collection_id: string;
  product_id: string;
  sort_order: number;
  created_at: string;
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
