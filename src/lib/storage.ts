/**
 * Storage adapter interface.
 *
 * The app currently uses the localStorage adapter. To migrate to Supabase
 * later, implement a SupabaseAdapter that satisfies this interface and bind
 * it in the providers — no UI code needs to change.
 */

export type WishlistItem = {
  id: string;
  title: string;
  imageKey: string;
  href: string;
  addedAt: number;
};

export type AppointmentDraft = {
  name: string;
  email: string;
  phone: string;
  date: string;
  occasion: string;
  notes: string;
  createdAt: number;
};

export type CustomisationDraft = {
  name: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  outfitCategory?: string;
  occasion?: string;
  eventDate?: string;
  budget?: string;
  designStyle?: string;
  fabrics: string[];
  colors: string[];
  embroidery: string[];
  customisation: string[];
  inspirationNotes?: string;
  additionalNotes?: string;
  createdAt: number;
};

export type MeasurementDraft = {
  name: string;
  mobile: string;
  measurementMethod: string;
  notes?: string;
  createdAt: number;
};

export interface StorageAdapter {
  getWishlist(): WishlistItem[];
  toggleWishlist(item: WishlistItem): boolean;
  isInWishlist(id: string): boolean;
  clearWishlist(): void;

  saveAppointment(draft: AppointmentDraft): void;
  getAppointments(): AppointmentDraft[];

  saveCustomisationRequest(draft: CustomisationDraft): void;
  getCustomisationRequests(): CustomisationDraft[];

  saveMeasurementPreference(draft: MeasurementDraft): void;
  getMeasurementPreferences(): MeasurementDraft[];

  getRecentlyViewed(): string[];
  addRecentlyViewed(slug: string): void;

  /* --- Future customer personalization (optional, not yet implemented) --- */

  /** Future: persist customer profile data when accounts are enabled. */
  getCustomerProfile?(): unknown | null;

  /** Future: persist style preferences for AI personalization. */
  getStylePreferences?(): unknown[];

  /** Future: persist lookbooks when the lookbook feature ships. */
  getLookbooks?(): unknown[];

  /** Future: persist mood boards when the mood board feature ships. */
  getMoodBoards?(): unknown[];

  /** Future: persist saved measurements linked to a customer account. */
  getSavedMeasurements?(): unknown[];
}

const WISHLIST_KEY = 'libas.wishlist';
const APPOINTMENTS_KEY = 'libas.appointments';
const CUSTOMISATION_KEY = 'libas.customisation_requests';
const MEASUREMENT_KEY = 'libas.measurement_preferences';
const RECENTLY_VIEWED_KEY = 'libas.recently_viewed';

export class LocalStorageAdapter implements StorageAdapter {
  getWishlist(): WishlistItem[] {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
    } catch {
      return [];
    }
  }

  toggleWishlist(item: WishlistItem): boolean {
    const list = this.getWishlist();
    const idx = list.findIndex((i) => i.id === item.id);
    let added: boolean;
    if (idx >= 0) {
      list.splice(idx, 1);
      added = false;
    } else {
      list.unshift(item);
      added = true;
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    return added;
  }

  isInWishlist(id: string): boolean {
    return this.getWishlist().some((i) => i.id === id);
  }

  clearWishlist(): void {
    localStorage.removeItem(WISHLIST_KEY);
  }

  saveAppointment(draft: AppointmentDraft): void {
    const list = this.getAppointments();
    list.push(draft);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
  }

  getAppointments(): AppointmentDraft[] {
    try {
      const raw = localStorage.getItem(APPOINTMENTS_KEY);
      return raw ? (JSON.parse(raw) as AppointmentDraft[]) : [];
    } catch {
      return [];
    }
  }

  saveCustomisationRequest(draft: CustomisationDraft): void {
    const list = this.getCustomisationRequests();
    list.push(draft);
    localStorage.setItem(CUSTOMISATION_KEY, JSON.stringify(list));
  }

  getCustomisationRequests(): CustomisationDraft[] {
    try {
      const raw = localStorage.getItem(CUSTOMISATION_KEY);
      return raw ? (JSON.parse(raw) as CustomisationDraft[]) : [];
    } catch {
      return [];
    }
  }

  saveMeasurementPreference(draft: MeasurementDraft): void {
    const list = this.getMeasurementPreferences();
    list.push(draft);
    localStorage.setItem(MEASUREMENT_KEY, JSON.stringify(list));
  }

  getMeasurementPreferences(): MeasurementDraft[] {
    try {
      const raw = localStorage.getItem(MEASUREMENT_KEY);
      return raw ? (JSON.parse(raw) as MeasurementDraft[]) : [];
    } catch {
      return [];
    }
  }

  getRecentlyViewed(): string[] {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  addRecentlyViewed(slug: string): void {
    const list = this.getRecentlyViewed().filter((s) => s !== slug);
    list.unshift(slug);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list.slice(0, 12)));
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
