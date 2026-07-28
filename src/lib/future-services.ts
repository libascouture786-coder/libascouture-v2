/**
 * Service interface contracts for future AI, personalization, and business
 * integrations.
 *
 * These interfaces define the contracts that future implementations must
 * satisfy. They are NOT implemented yet — no class, no API call, no database
 * query should exist for them. When a feature is activated, create a concrete
 * implementation that satisfies the relevant interface and bind it via
 * dependency injection or a provider.
 *
 * The existing codebase does not import from this file yet. It exists purely
 * so that future work has a stable target to implement against.
 */

import type {
  ProductRecommendation,
  SmartSearchResult,
  StylingAssistantSession,
  AIConversationTurn,
  PersonalizedHomepageConfig,
  CollectionDiscoveryResult,
  StylePreference,
  CustomerProfile,
  Lookbook,
  MoodBoard,
  SavedMeasurement,
  SavedConsultation,
  RecentlyViewedEntry,
  Order,
  PaymentRecord,
  CRMContact,
  Campaign,
  EditorialArticle,
  Locale,
  Currency,
  ContentModule,
  ContentModuleType,
  RealBrideEntry,
  Testimonial,
  DesignerStory,
  CraftsmanshipShowcase,
  BrandValue,
  PressMediaItem,
  EventGalleryItem,
  SocialContentItem,
  SocialContentType,
  BridalStory,
} from './future-types';
import type { Product } from './types';

/* ---------- AI Services ---------- */

export interface StylingAssistantService {
  createSession(input: {
    occasion: string;
    budgetRange?: string;
    colorPreferences?: string[];
    stylePreferences?: string[];
  }): Promise<StylingAssistantSession>;
  sendMessage(sessionId: string, message: string): Promise<AIConversationTurn>;
  getRecommendations(sessionId: string): Promise<ProductRecommendation[]>;
  closeSession(sessionId: string): Promise<void>;
}

export interface RecommendationService {
  forProduct(productId: string, limit?: number): Promise<ProductRecommendation[]>;
  forCustomer(customerId: string, limit?: number): Promise<ProductRecommendation[]>;
  trending(limit?: number): Promise<ProductRecommendation[]>;
  similarProducts(productId: string, limit?: number): Promise<ProductRecommendation[]>;
}

export interface SmartSearchService {
  search(query: string, filters?: SmartSearchFilters): Promise<SmartSearchResult[]>;
  autocomplete(query: string): Promise<string[]>;
}

export type SmartSearchFilters = {
  occasion?: string[];
  category?: string[];
  color?: string[];
  fabric?: string[];
  embroidery?: string[];
  priceRange?: { min: number; max: number };
};

export interface PersonalizationService {
  getHomepageConfig(customerId: string): Promise<PersonalizedHomepageConfig | null>;
  getStylePreferences(customerId: string): Promise<StylePreference[]>;
  updateStylePreferences(customerId: string, prefs: StylePreference[]): Promise<void>;
  discoverCollections(customerId: string, limit?: number): Promise<CollectionDiscoveryResult[]>;
}

/* ---------- Customer Data Services ---------- */

export interface CustomerService {
  getProfile(customerId: string): Promise<CustomerProfile | null>;
  updateProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile>;
}

export interface LookbookService {
  list(customerId: string): Promise<Lookbook[]>;
  create(customerId: string, title: string, productIds: string[]): Promise<Lookbook>;
  addProduct(lookbookId: string, productId: string): Promise<void>;
  removeProduct(lookbookId: string, productId: string): Promise<void>;
  remove(lookbookId: string): Promise<void>;
}

export interface MoodBoardService {
  list(customerId: string): Promise<MoodBoard[]>;
  create(customerId: string, title: string): Promise<MoodBoard>;
  addItem(moodBoardId: string, item: Omit<MoodBoard['items'][number], 'id'>): Promise<void>;
  removeItem(moodBoardId: string, itemId: string): Promise<void>;
  remove(moodBoardId: string): Promise<void>;
}

export interface MeasurementService {
  list(customerId: string): Promise<SavedMeasurement[]>;
  save(customerId: string, label: string, measurements: Record<string, number>, unit: 'cm' | 'inch'): Promise<SavedMeasurement>;
  remove(measurementId: string): Promise<void>;
}

export interface ConsultationService {
  list(customerId: string): Promise<SavedConsultation[]>;
  save(customerId: string, appointmentId: string, notes?: string): Promise<SavedConsultation>;
  remove(consultationId: string): Promise<void>;
}

export interface RecentlyViewedService {
  list(customerId: string): Promise<RecentlyViewedEntry[]>;
  add(customerId: string, productSlug: string): Promise<void>;
  clear(customerId: string): Promise<void>;
}

/* ---------- Business Integration Services ---------- */

export interface OrderService {
  list(customerId: string): Promise<Order[]>;
  get(orderId: string): Promise<Order | null>;
  create(input: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order>;
  updateStatus(orderId: string, status: Order['status']): Promise<void>;
  track(orderId: string): Promise<{ status: string; trackingNumber: string | null; history: { status: string; timestamp: string }[] }>;
}

export interface PaymentService {
  initiate(orderId: string, amount: number, currency: string): Promise<{ paymentUrl: string; paymentId: string }>;
  confirm(paymentId: string): Promise<PaymentRecord>;
  refund(paymentId: string): Promise<PaymentRecord>;
}

export interface CRMService {
  syncContact(contact: Omit<CRMContact, 'id' | 'created_at'>): Promise<CRMContact>;
  getContact(contactId: string): Promise<CRMContact | null>;
  listContacts(filters?: { tags?: string[]; source?: string }): Promise<CRMContact[]>;
}

export interface ERPService {
  syncProduct(product: Product): Promise<void>;
  syncInventory(productId: string): Promise<{ inStock: boolean; quantity: number }>;
}

/* ---------- Content & Campaign Services ---------- */

export interface CampaignService {
  list(type?: Campaign['type'], status?: Campaign['status']): Promise<Campaign[]>;
  get(slug: string): Promise<Campaign | null>;
  create(input: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign>;
  update(campaignId: string, updates: Partial<Campaign>): Promise<Campaign>;
  remove(campaignId: string): Promise<void>;
  schedule(campaignId: string, startDate: string, endDate?: string): Promise<void>;
}

export interface EditorialService {
  list(): Promise<EditorialArticle[]>;
  get(slug: string): Promise<EditorialArticle | null>;
  create(input: Omit<EditorialArticle, 'id' | 'created_at' | 'updated_at'>): Promise<EditorialArticle>;
  update(articleId: string, updates: Partial<EditorialArticle>): Promise<EditorialArticle>;
  remove(articleId: string): Promise<void>;
  publish(articleId: string): Promise<void>;
}

/* ---------- Brand Storytelling Services ---------- */

export interface ContentModuleService {
  list(moduleType?: ContentModuleType): Promise<ContentModule[]>;
  get(id: string): Promise<ContentModule | null>;
  create(input: Omit<ContentModule, 'id' | 'created_at' | 'updated_at'>): Promise<ContentModule>;
  update(id: string, updates: Partial<ContentModule>): Promise<ContentModule>;
  remove(id: string): Promise<void>;
  toggleVisibility(id: string, isVisible: boolean): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

export interface RealBridesService {
  list(): Promise<RealBrideEntry[]>;
  featured(limit?: number): Promise<RealBrideEntry[]>;
  get(id: string): Promise<RealBrideEntry | null>;
  create(input: Omit<RealBrideEntry, 'id' | 'created_at'>): Promise<RealBrideEntry>;
  update(id: string, updates: Partial<RealBrideEntry>): Promise<RealBrideEntry>;
  remove(id: string): Promise<void>;
}

export interface TestimonialService {
  list(): Promise<Testimonial[]>;
  featured(limit?: number): Promise<Testimonial[]>;
  create(input: Omit<Testimonial, 'id' | 'created_at'>): Promise<Testimonial>;
  update(id: string, updates: Partial<Testimonial>): Promise<Testimonial>;
  remove(id: string): Promise<void>;
}

export interface DesignerStoryService {
  list(): Promise<DesignerStory[]>;
  get(id: string): Promise<DesignerStory | null>;
  create(input: Omit<DesignerStory, 'id' | 'created_at' | 'updated_at'>): Promise<DesignerStory>;
  update(id: string, updates: Partial<DesignerStory>): Promise<DesignerStory>;
  remove(id: string): Promise<void>;
}

export interface CraftsmanshipService {
  list(): Promise<CraftsmanshipShowcase[]>;
  get(id: string): Promise<CraftsmanshipShowcase | null>;
  create(input: Omit<CraftsmanshipShowcase, 'id' | 'created_at' | 'updated_at'>): Promise<CraftsmanshipShowcase>;
  update(id: string, updates: Partial<CraftsmanshipShowcase>): Promise<CraftsmanshipShowcase>;
  remove(id: string): Promise<void>;
}

export interface BrandValueService {
  list(): Promise<BrandValue[]>;
  create(input: Omit<BrandValue, 'id'>): Promise<BrandValue>;
  update(id: string, updates: Partial<BrandValue>): Promise<BrandValue>;
  remove(id: string): Promise<void>;
}

export interface PressMediaService {
  list(): Promise<PressMediaItem[]>;
  featured(limit?: number): Promise<PressMediaItem[]>;
  create(input: Omit<PressMediaItem, 'id' | 'created_at'>): Promise<PressMediaItem>;
  update(id: string, updates: Partial<PressMediaItem>): Promise<PressMediaItem>;
  remove(id: string): Promise<void>;
}

export interface EventGalleryService {
  list(): Promise<EventGalleryItem[]>;
  get(id: string): Promise<EventGalleryItem | null>;
  create(input: Omit<EventGalleryItem, 'id' | 'created_at'>): Promise<EventGalleryItem>;
  update(id: string, updates: Partial<EventGalleryItem>): Promise<EventGalleryItem>;
  remove(id: string): Promise<void>;
}

/* ---------- Social & Community Services ---------- */

export interface SocialContentService {
  list(contentType?: SocialContentType, limit?: number): Promise<SocialContentItem[]>;
  featured(contentType?: SocialContentType, limit?: number): Promise<SocialContentItem[]>;
  create(input: Omit<SocialContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<SocialContentItem>;
  update(id: string, updates: Partial<SocialContentItem>): Promise<SocialContentItem>;
  remove(id: string): Promise<void>;
  curate(id: string, isCurated: boolean): Promise<void>;
}

export interface BridalStoriesService {
  list(): Promise<BridalStory[]>;
  featured(limit?: number): Promise<BridalStory[]>;
  get(id: string): Promise<BridalStory | null>;
  create(input: Omit<BridalStory, 'id' | 'created_at' | 'updated_at'>): Promise<BridalStory>;
  update(id: string, updates: Partial<BridalStory>): Promise<BridalStory>;
  remove(id: string): Promise<void>;
}

/* ---------- Internationalization ---------- */

export interface I18nService {
  getLocale(): Locale;
  setLocale(code: string): void;
  translate(key: string, params?: Record<string, string | number>): string;
  listLocales(): Locale[];
}

export interface CurrencyService {
  getCurrent(): Currency;
  setCurrent(code: string): void;
  convert(amount: number, from: string, to: string): number;
  format(amount: number, currency: string): string;
  listCurrencies(): Currency[];
}
