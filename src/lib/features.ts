/**
 * Feature flag registry.
 *
 * All future capabilities are defined here as flags. Each flag defaults to
 * `false` so the current site behaves exactly as before. When a feature is
 * ready for release, flip its flag to `true` (or wire it to an env var / CMS
 * setting) — no other code changes are needed because consumers already
 * check `isFeatureEnabled()`.
 *
 * To add a new future feature:
 *   1. Add a key to `FeatureFlag` and an entry to `DEFAULT_FLAGS`.
 *   2. Guard the feature's UI/logic with `isFeatureEnabled('yourFlag')`.
 */

export type FeatureFlag =
  | 'ai.stylingAssistant'
  | 'ai.recommendations'
  | 'ai.smartSearch'
  | 'ai.personalizedHomepage'
  | 'ai.collectionDiscovery'
  | 'ai.stylePreferences'
  | 'customer.accounts'
  | 'customer.profiles'
  | 'customer.wishlistSync'
  | 'customer.lookbooks'
  | 'customer.moodBoards'
  | 'customer.savedMeasurements'
  | 'customer.savedConsultations'
  | 'customer.recentlyViewed'
  | 'business.payments'
  | 'business.orderTracking'
  | 'business.crm'
  | 'business.erp'
  | 'business.internationalEnquiries'
  | 'content.seasonalCampaigns'
  | 'content.limitedEditions'
  | 'content.homepagePromotions'
  | 'content.editorial'
  | 'content.educationalGuides'
  | 'content.inspiration'
  | 'brand.realBridesGallery'
  | 'brand.testimonials'
  | 'brand.editorialJournal'
  | 'brand.designerStories'
  | 'brand.craftsmanshipShowcase'
  | 'brand.brandValues'
  | 'brand.pressMedia'
  | 'brand.eventGallery'
  | 'social.instagramHighlights'
  | 'social.youtubeVideos'
  | 'social.customerReels'
  | 'social.behindTheScenes'
  | 'social.customerSpotlights'
  | 'social.bridalStories'
  | 'platform.mobileApp'
  | 'platform.multiLanguage'
  | 'platform.multiCurrency';

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  'ai.stylingAssistant': false,
  'ai.recommendations': false,
  'ai.smartSearch': false,
  'ai.personalizedHomepage': false,
  'ai.collectionDiscovery': false,
  'ai.stylePreferences': false,
  'customer.accounts': false,
  'customer.profiles': false,
  'customer.wishlistSync': false,
  'customer.lookbooks': false,
  'customer.moodBoards': false,
  'customer.savedMeasurements': false,
  'customer.savedConsultations': false,
  'customer.recentlyViewed': false,
  'business.payments': false,
  'business.orderTracking': false,
  'business.crm': false,
  'business.erp': false,
  'business.internationalEnquiries': false,
  'content.seasonalCampaigns': false,
  'content.limitedEditions': false,
  'content.homepagePromotions': false,
  'content.editorial': false,
  'content.educationalGuides': false,
  'content.inspiration': false,
  'brand.realBridesGallery': false,
  'brand.testimonials': false,
  'brand.editorialJournal': false,
  'brand.designerStories': false,
  'brand.craftsmanshipShowcase': false,
  'brand.brandValues': false,
  'brand.pressMedia': false,
  'brand.eventGallery': false,
  'social.instagramHighlights': false,
  'social.youtubeVideos': false,
  'social.customerReels': false,
  'social.behindTheScenes': false,
  'social.customerSpotlights': false,
  'social.bridalStories': false,
  'platform.mobileApp': false,
  'platform.multiLanguage': false,
  'platform.multiCurrency': false,
};

let activeFlags: Record<FeatureFlag, boolean> = { ...DEFAULT_FLAGS };

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return activeFlags[flag] ?? false;
}

export function setFeatureFlags(overrides: Partial<Record<FeatureFlag, boolean>>): void {
  activeFlags = { ...activeFlags, ...overrides };
}

export function resetFeatureFlags(): void {
  activeFlags = { ...DEFAULT_FLAGS };
}

export function allFeatureFlags(): Record<FeatureFlag, boolean> {
  return { ...activeFlags };
}
