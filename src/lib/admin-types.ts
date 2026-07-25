import type { ProductWithImages } from './types';

export type AdminStats = {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  totalCollections: number;
  newEnquiries: number;
  pendingAppointments: number;
  completedAppointments: number;
  recentCustomDesignRequests: number;
  websiteVisitors: number;
};

export type AdminActivity = {
  id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  admin_email: string | null;
  created_at: string;
};

export type AdminNotification = {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type AdminEnquiry = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  enquiry_type: string;
  product_code: string | null;
  category: string | null;
  occasion: string | null;
  budget: string | null;
  event_date: string | null;
  customisation: string | null;
  measurement_status: string | null;
  lead_priority: 'high' | 'medium' | 'low';
  notes: string | null;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  follow_up_status: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type HomepageSection = {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  sort_order: number;
  content: Record<string, unknown>;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  folder: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  usage_type: string | null;
  created_at: string;
};

export type WebsitePage = {
  id: string;
  page_key: string;
  title: string;
  content: unknown[];
  hero_image: string | null;
  is_visible: boolean;
  is_published: boolean;
  updated_at: string;
};

export type SeoSetting = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  url_slug: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card_image: string | null;
  is_indexed: boolean;
  created_at: string;
  updated_at: string;
};

export type AnalyticsEvent = {
  id: string;
  event_type: string;
  entity_id: string | null;
  source: string | null;
  search_term: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminRole = 'super_admin' | 'store_manager' | 'sales_team' | 'designer' | 'content_manager';

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
};

export type ProductFormData = {
  title: string;
  slug: string;
  code: string;
  excerpt: string;
  description: string;
  story: string;
  styling_notes: string;
  event_suitability: string;
  category_id: string;
  category_slug: string;
  occasion: string;
  occasions: string[];
  price: string;
  price_type: string;
  status: string;
  work_type: string;
  fabric_main: string;
  fabric_blouse: string;
  fabric_dupatta: string;
  fabric_lining: string;
  colors: string[];
  embroidery: string[];
  includes: string[];
  customisation_options: string[];
  customisable: boolean;
  delivery_time: string;
  measurement_notes: string;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
  image_alt_text: string;
  images: { url: string; alt: string; view_type: string }[];
  videos: { url: string; title: string }[];
};

export type { ProductWithImages };
