/**
 * Future entity type definitions.
 *
 * These types describe data shapes for features that are NOT yet implemented.
 * Defining them now lets the database schema, service interfaces, and UI
 * scaffolding reference stable types from day one — so when a feature is
 * activated it can be wired in without redefining contracts across the
 * codebase.
 *
 * No tables, API calls, or UI should be created for these types yet.
 * They exist purely as architectural contracts.
 */

/* ---------- Customer & Personalization ---------- */

export type CustomerProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: string | null;
  preferred_currency: string | null;
  style_preferences: StylePreference[] | null;
  created_at: string;
  updated_at: string;
};

export type StylePreference = {
  occasion: string;
  color_palette: string[];
  fabric_preferences: string[];
  embroidery_preferences: string[];
  silhouette_preferences: string[];
};

export type Lookbook = {
  id: string;
  customer_id: string;
  title: string;
  description: string | null;
  product_ids: string[];
  cover_image: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type MoodBoard = {
  id: string;
  customer_id: string;
  title: string;
  items: MoodBoardItem[];
  created_at: string;
  updated_at: string;
};

export type MoodBoardItem = {
  id: string;
  type: 'product' | 'image' | 'color' | 'note';
  ref_id: string | null;
  image_url: string | null;
  text: string | null;
  position_x: number;
  position_y: number;
};

export type SavedMeasurement = {
  id: string;
  customer_id: string;
  label: string;
  measurements: Record<string, number>;
  unit: 'cm' | 'inch';
  created_at: string;
  updated_at: string;
};

export type SavedConsultation = {
  id: string;
  customer_id: string;
  appointment_id: string;
  notes: string | null;
  stylist_id: string | null;
  created_at: string;
};

export type RecentlyViewedEntry = {
  product_slug: string;
  viewed_at: string;
};

/* ---------- AI Ecosystem ---------- */

export type StylingAssistantSession = {
  id: string;
  customer_id: string | null;
  occasion: string;
  budget_range: string | null;
  color_preferences: string[];
  style_preferences: string[];
  recommended_product_ids: string[];
  conversation_history: AIConversationTurn[];
  created_at: string;
  updated_at: string;
};

export type AIConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type ProductRecommendation = {
  product_id: string;
  score: number;
  reason: string | null;
  source: 'ai' | 'trending' | 'similar' | 'collection';
};

export type SmartSearchResult = {
  product_id: string;
  score: number;
  matched_fields: string[];
  query: string;
};

export type PersonalizedHomepageConfig = {
  customer_id: string;
  hero_variant: string;
  featured_collection_slugs: string[];
  recommended_product_ids: string[];
  campaign_id: string | null;
};

export type CollectionDiscoveryResult = {
  collection_slug: string;
  score: number;
  reason: string | null;
};

/* ---------- Business Expansion ---------- */

export type Order = {
  id: string;
  customer_id: string;
  product_id: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentRecord = {
  id: string;
  order_id: string;
  provider: 'stripe' | 'razorpay' | 'manual';
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: 'initiated' | 'succeeded' | 'failed' | 'refunded';
  created_at: string;
};

export type CRMContact = {
  id: string;
  customer_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  tags: string[];
  lead_score: number | null;
  last_contacted_at: string | null;
  created_at: string;
};

/* ---------- Content & Campaigns ---------- */

export type Campaign = {
  id: string;
  title: string;
  slug: string;
  type: 'seasonal' | 'limited_edition' | 'promotion' | 'editorial' | 'guide' | 'inspiration';
  status: 'draft' | 'scheduled' | 'active' | 'archived';
  start_date: string | null;
  end_date: string | null;
  hero_image: string | null;
  content: Record<string, unknown>;
  product_ids: string[];
  collection_ids: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type EditorialArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: unknown[];
  cover_image: string | null;
  author: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/* ---------- Brand Storytelling & Content Modules ---------- */

export type ContentModuleType =
  | 'real_brides_gallery'
  | 'testimonials'
  | 'editorial_journal'
  | 'designer_stories'
  | 'craftsmanship_showcase'
  | 'brand_values'
  | 'press_media'
  | 'event_gallery';

export type ContentModule = {
  id: string;
  module_type: ContentModuleType;
  title: string;
  subtitle: string | null;
  is_visible: boolean;
  sort_order: number;
  cover_image: string | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type RealBrideEntry = {
  id: string;
  bride_name: string;
  occasion: string | null;
  location: string | null;
  image_url: string;
  image_alt: string;
  story: string | null;
  wedding_date: string | null;
  product_ids: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  bride_name: string | null;
  rating: number;
  text: string;
  occasion: string | null;
  location: string | null;
  image_url: string | null;
  video_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type DesignerStory = {
  id: string;
  designer_name: string;
  role: string;
  bio: string;
  portrait_image: string | null;
  craft_specialty: string[];
  years_of_experience: number | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CraftsmanshipShowcase = {
  id: string;
  technique_name: string;
  description: string;
  image_url: string;
  image_alt: string;
  process_steps: { title: string; description: string; image_url?: string }[];
  hours_to_create: number | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BrandValue = {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
};

export type PressMediaItem = {
  id: string;
  publication: string;
  headline: string;
  excerpt: string;
  article_url: string;
  cover_image: string | null;
  published_date: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

export type EventGalleryItem = {
  id: string;
  event_name: string;
  event_date: string;
  location: string | null;
  description: string | null;
  cover_image: string;
  gallery_images: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

/* ---------- Social & Community ---------- */

export type SocialContentType =
  | 'instagram_highlight'
  | 'youtube_video'
  | 'customer_reel'
  | 'behind_the_scenes'
  | 'customer_spotlight'
  | 'bridal_story';

export type SocialContentItem = {
  id: string;
  content_type: SocialContentType;
  title: string;
  caption: string | null;
  media_url: string;
  thumbnail_url: string | null;
  external_url: string | null;
  author: string | null;
  author_handle: string | null;
  is_featured: boolean;
  is_curated: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BridalStory = {
  id: string;
  bride_name: string;
  groom_name: string | null;
  wedding_location: string | null;
  wedding_date: string | null;
  story: string;
  cover_image: string;
  gallery_images: string[];
  product_ids: string[];
  video_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/* ---------- Internationalization ---------- */

export type Locale = {
  code: string;
  label: string;
  direction: 'ltr' | 'rtl';
};

export type Currency = {
  code: string;
  symbol: string;
  exchange_rate: number;
};
