import { supabase } from './supabase';
import type {
  AdminStats, AdminActivity, AdminNotification, AdminEnquiry,
  HomepageSection, MediaAsset, WebsitePage, SeoSetting, AnalyticsEvent,
} from './admin-types';

/* ── Dashboard Stats ──────────────────────────────────────────────── */
export async function fetchAdminStats(): Promise<AdminStats> {
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: draftProducts },
    { count: outOfStockProducts },
    { count: totalCollections },
    { count: newEnquiries },
    { count: pendingAppointments },
    { count: completedAppointments },
    { count: recentCustomDesignRequests },
    { count: websiteVisitors },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', false),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'hidden'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('admin_enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).is('status', null),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('customisation_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
  ]);

  return {
    totalProducts: totalProducts ?? 0,
    activeProducts: activeProducts ?? 0,
    draftProducts: draftProducts ?? 0,
    outOfStockProducts: outOfStockProducts ?? 0,
    totalCollections: totalCollections ?? 0,
    newEnquiries: newEnquiries ?? 0,
    pendingAppointments: pendingAppointments ?? 0,
    completedAppointments: completedAppointments ?? 0,
    recentCustomDesignRequests: recentCustomDesignRequests ?? 0,
    websiteVisitors: websiteVisitors ?? 0,
  };
}

/* ── Activity Log ────────────────────────────────────────────────── */
export async function fetchRecentActivity(limit = 10): Promise<AdminActivity[]> {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

export async function logActivity(
  actionType: string,
  description: string,
  entityType?: string,
  entityId?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('admin_activity_log').insert({
    action_type: actionType,
    description,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    admin_email: user?.email ?? null,
  });
}

/* ── Notifications ────────────────────────────────────────────────── */
export async function fetchNotifications(): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return [];
  return data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead(): Promise<void> {
  await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
}

/* ── Enquiries ────────────────────────────────────────────────────── */
export async function fetchEnquiries(): Promise<AdminEnquiry[]> {
  const { data, error } = await supabase
    .from('admin_enquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function updateEnquiry(id: string, updates: Partial<AdminEnquiry>): Promise<void> {
  await supabase.from('admin_enquiries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

/* ── Homepage Sections ────────────────────────────────────────────── */
export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function updateHomepageSection(id: string, updates: Partial<HomepageSection>): Promise<void> {
  await supabase.from('homepage_sections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

/* ── Media Library ────────────────────────────────────────────────── */
export async function fetchMedia(folder?: string): Promise<MediaAsset[]> {
  let query = supabase.from('media_library').select('*').order('created_at', { ascending: false });
  if (folder && folder !== 'all') query = query.eq('folder', folder);
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function insertMedia(asset: Omit<MediaAsset, 'id' | 'created_at'>): Promise<MediaAsset | null> {
  const { data, error } = await supabase.from('media_library').insert(asset).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function deleteMedia(id: string): Promise<void> {
  await supabase.from('media_library').delete().eq('id', id);
}

/* ── Website Pages ────────────────────────────────────────────────── */
export async function fetchWebsitePages(): Promise<WebsitePage[]> {
  const { data, error } = await supabase
    .from('website_pages')
    .select('*')
    .order('title', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function updateWebsitePage(id: string, updates: Partial<WebsitePage>): Promise<void> {
  await supabase.from('website_pages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

/* ── SEO Settings ─────────────────────────────────────────────────── */
export async function fetchSeoSettings(): Promise<SeoSetting[]> {
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .order('entity_type', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function updateSeoSetting(id: string, updates: Partial<SeoSetting>): Promise<void> {
  await supabase.from('seo_settings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function upsertSeoSetting(setting: Omit<SeoSetting, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await supabase.from('seo_settings').upsert(setting, { onConflict: 'entity_type,entity_id' });
}

/* ── Analytics ────────────────────────────────────────────────────── */
export async function fetchAnalyticsEvents(limit = 100): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

export async function trackEvent(eventType: string, entityId?: string, source?: string, searchTerm?: string): Promise<void> {
  await supabase.from('analytics_events').insert({
    event_type: eventType,
    entity_id: entityId ?? null,
    source: source ?? null,
    search_term: searchTerm ?? null,
  });
}

/* ── Admin Settings ──────────────────────────────────────────────── */
export async function fetchSetting(key: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.from('admin_settings').select('value').eq('key', key).maybeSingle();
  if (error || !data) return null;
  return data.value as Record<string, unknown>;
}

export async function updateSetting(key: string, value: Record<string, unknown>): Promise<void> {
  await supabase.from('admin_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

/* ── Categories ───────────────────────────────────────────────────── */
export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function insertCategory(cat: { slug: string; title: string; excerpt?: string; image_key?: string }) {
  const { data, error } = await supabase.from('categories').insert(cat).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function updateCategory(id: string, updates: Record<string, unknown>) {
  await supabase.from('categories').update(updates).eq('id', id);
}

export async function deleteCategory(id: string) {
  await supabase.from('categories').delete().eq('id', id);
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, code')
    .or(`title.ilike.%${query}%,code.ilike.%${query}%`)
    .limit(20);
  if (error) return [];
  return data ?? [];
}

/* ── Collections ─────────────────────────────────────────────────── */
export async function fetchCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function insertCollection(col: {
  name: string;
  slug: string;
  description?: string | null;
  banner_image?: string | null;
  collection_type?: string | null;
  cover_product_id?: string | null;
}) {
  const { data, error } = await supabase.from('collections').insert(col).select().maybeSingle();
  if (error) return null;
  return data;
}

export async function updateCollection(id: string, updates: Record<string, unknown>) {
  await supabase.from('collections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

export async function deleteCollection(id: string) {
  await supabase.from('collections').delete().eq('id', id);
}

export async function fetchCollectionProducts(collectionId: string) {
  const { data, error } = await supabase
    .from('collection_products')
    .select('product_id, sort_order')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function setCollectionProducts(collectionId: string, productIds: string[]) {
  await supabase.from('collection_products').delete().eq('collection_id', collectionId);
  if (productIds.length === 0) return;
  const rows = productIds.map((pid, i) => ({
    collection_id: collectionId,
    product_id: pid,
    sort_order: i,
  }));
  await supabase.from('collection_products').insert(rows);
}

/* ── Appointments ────────────────────────────────────────────────── */
export async function fetchAppointments(status?: string) {
  let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
  if (status && status !== 'all') {
    if (status === 'pending') query = query.is('status', null);
    else query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function updateAppointment(id: string, updates: Record<string, unknown>) {
  await supabase.from('appointments').update(updates).eq('id', id);
}

/* ── Customisation Requests ───────────────────────────────────────── */
export async function fetchCustomisationRequests(status?: string) {
  let query = supabase.from('customisation_requests').select('*').order('created_at', { ascending: false });
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

export async function updateCustomisationRequest(id: string, updates: Record<string, unknown>) {
  await supabase.from('customisation_requests').update(updates).eq('id', id);
}
