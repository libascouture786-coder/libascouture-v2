import { supabase } from './supabase';
import type { ProductWithImages } from './types';

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } };

function wrapError(error: { code?: string; message: string }): { code: string; message: string } {
  return { code: error.code ?? 'unknown', message: error.message };
}

/* ── Products ─────────────────────────────────────────────────────── */

export async function fetchActiveProducts(): Promise<ApiResult<ProductWithImages[]>> {
  try {
    const { data: productData, error: pErr } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (pErr) return { data: null, error: wrapError(pErr) };

    const { data: imageData, error: iErr } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });
    if (iErr) return { data: null, error: wrapError(iErr) };

    const withImages: ProductWithImages[] = (productData ?? []).map((p) => ({
      ...p,
      images: (imageData ?? []).filter((img) => img.product_id === p.id),
    }));

    return { data: withImages, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

export async function fetchProductBySlug(slug: string): Promise<ApiResult<ProductWithImages | null>> {
  try {
    const { data: prod, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) return { data: null, error: wrapError(error) };
    if (!prod) return { data: null, error: null };

    const { data: imgs } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', prod.id)
      .order('sort_order', { ascending: true });

    return { data: { ...prod, images: imgs ?? [] }, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

export async function fetchRelatedProducts(productId: string): Promise<ApiResult<ProductWithImages[]>> {
  try {
    const { data: relData, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', productId)
      .eq('is_active', true)
      .limit(4);
    if (error) return { data: null, error: wrapError(error) };

    const { data: relImgs } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });

    const withImages: ProductWithImages[] = (relData ?? []).map((p) => ({
      ...p,
      images: (relImgs ?? []).filter((img) => img.product_id === p.id),
    }));

    return { data: withImages, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<ApiResult<ProductWithImages[]>> {
  if (slugs.length === 0) return { data: [], error: null };
  try {
    const { data: rvData, error } = await supabase
      .from('products')
      .select('*')
      .in('slug', slugs)
      .limit(4);
    if (error) return { data: null, error: wrapError(error) };

    const { data: rvImgs } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });

    const withImages: ProductWithImages[] = (rvData ?? []).map((p) => ({
      ...p,
      images: (rvImgs ?? []).filter((img) => img.product_id === p.id),
    }));

    return { data: withImages, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

/* ── Newsletter ──────────────────────────────────────────────────── */

export async function subscribeNewsletter(email: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() });
    if (error) {
      if (error.code === '23505') {
        return { data: null, error: { code: 'duplicate', message: 'Already subscribed' } };
      }
      return { data: null, error: wrapError(error) };
    }
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

/* ── Enquiries ───────────────────────────────────────────────────── */

export type EnquiryInput = {
  name: string;
  mobile: string;
  email?: string | null;
  message: string;
  enquiry_type?: string;
};

export async function submitEnquiry(input: EnquiryInput): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('admin_enquiries').insert({
      name: input.name.trim(),
      mobile: input.mobile.trim(),
      email: input.email?.trim() || null,
      message: input.message.trim(),
      notes: input.message.trim(),
      enquiry_type: input.enquiry_type ?? 'general',
      status: 'new',
    });
    if (error) return { data: null, error: wrapError(error) };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

/* ── Appointments ────────────────────────────────────────────────── */

export type AppointmentInput = {
  name: string;
  email?: string | null;
  phone: string;
  whatsapp?: string | null;
  consultation_type?: string | null;
  preferred_date: string;
  preferred_time?: string | null;
  occasion?: string | null;
  budget?: string | null;
  notes?: string | null;
};

export async function submitAppointment(input: AppointmentInput): Promise<ApiResult<null>> {
  try {
    const token = crypto.randomUUID();
    const { error } = await supabase.from('appointments').insert({
      name: input.name,
      email: input.email || null,
      phone: input.phone,
      whatsapp: input.whatsapp || null,
      consultation_type: input.consultation_type || null,
      preferred_date: input.preferred_date,
      preferred_time: input.preferred_time || null,
      occasion: input.occasion || null,
      budget: input.budget || null,
      notes: input.notes || null,
      reschedule_token: token,
      cancellation_token: token,
    });
    if (error) return { data: null, error: wrapError(error) };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}

/* ── Customisation Requests ──────────────────────────────────────── */

export type CustomisationInput = {
  name: string;
  mobile: string;
  whatsapp?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  outfit_category?: string | null;
  occasion?: string | null;
  event_date?: string | null;
  budget?: string | null;
  design_style?: string | null;
  fabrics?: string[] | null;
  colors?: string[] | null;
  embroidery?: string[] | null;
  customisation?: string[] | null;
  inspiration_notes?: string | null;
  additional_notes?: string | null;
};

export async function submitCustomisationRequest(input: CustomisationInput): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.from('customisation_requests').insert(input);
    if (error) return { data: null, error: wrapError(error) };
    return { data: null, error: null };
  } catch (e) {
    return { data: null, error: { code: 'network', message: String(e) } };
  }
}
