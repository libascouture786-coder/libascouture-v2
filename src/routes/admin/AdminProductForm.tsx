import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, Copy, Loader2, Plus, X, Upload, Check,
  ImageIcon, ChevronLeft, ChevronRight, Shirt, Sparkles,
  Palette, Layers, FileText, LayoutGrid, Search,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { PreviewButton } from '@/components/admin/PreviewButton';
import { MultiComboField } from '@/components/admin/MultiComboField';
import { supabase } from '@/lib/supabase';
import { logActivity, fetchCategories, searchProducts, fetchMedia, insertMedia } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import { fabricOptions, colorSwatches } from '@/config/customisation';

/* ── Form option sets (per redesign spec) ─────────────────────────── */

const occasionCategoryOptions = [
  'Wedding (Bridal)', 'Engagement', 'Other Functions',
] as const;

const otherFunctionEvents = [
  'Haldi', 'Mehendi', 'Sangeet', 'Cocktail', 'Reception',
  'Nikah', 'Walima', 'Party', 'Photoshoot',
] as const;

function expandOccasions(selected: string[]): string[] {
  const result: string[] = [];
  for (const o of selected) {
    if (o === 'Other Functions') {
      for (const e of otherFunctionEvents) { if (!result.includes(e)) result.push(e); }
    } else {
      if (!result.includes(o)) result.push(o);
    }
  }
  return result;
}

const productTypeOptions = [
  'Lehenga', 'Farshi', 'Trail Dress', 'Indo Western', 'Saree',
  'Suit', 'Sharara', 'Gharara', 'Gown', 'Anarkali',
] as const;

const accessoryOptions = [
  'Potli', 'Tassels (Latkan)', 'Extra Belt', 'Second Dupatta',
  'Veil Dupatta', 'Cape', 'Jacket', 'Can Can',
] as const;

const workTypeOptions = ['Hand Work', 'Machine Work', 'Mix Work'] as const;

const handWorkDetailOptions = [
  'Dabka', 'Zardozi', 'Thread Work', 'Pearl',
  'Cutdana', 'Sequence', 'Stone', 'Mirror', 'Other',
] as const;

const customisationLevelOptions = [
  'Fully Customisable', 'Partially Customisable', 'Not Customisable',
] as const;

const priceTypes = ['Fixed Price', 'Starting From', 'Price on Request'] as const;
const availabilityOptions = [
  'Ready In Stock', 'Made On Order', 'Signature Collection',
  'Limited Availability', 'Hidden', 'Archived',
] as const;

const visibilityFlagOptions = [
  'Featured', 'Bestseller', 'New Arrival', 'Trending',
  'Signature Collection', 'Website', 'Instagram',
  'WhatsApp Catalogue', 'Hidden',
] as const;

const priorityOptions = ['High', 'Medium', 'Low'] as const;

type StepKey = 'media' | 'occasion' | 'info' | 'details' | 'colours' | 'visibility';

const steps: { key: StepKey; label: string; icon: typeof ImageIcon }[] = [
  { key: 'media', label: 'Media', icon: ImageIcon },
  { key: 'occasion', label: 'Occasion', icon: Sparkles },
  { key: 'info', label: 'Product Info', icon: Shirt },
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'colours', label: 'Colours & Fabrics', icon: Palette },
  { key: 'visibility', label: 'Visibility', icon: LayoutGrid },
];

export function AdminProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const fromQuick = searchParams.get('from') === 'quick';

  const [categories, setCategories] = useState<{ id: string; slug: string; title: string }[]>([]);
  const [activeStep, setActiveStep] = useState<StepKey>('media');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      setImageUrls((prev) => [...prev, ...uploaded]);
      setErrors((prev) => { const next = { ...prev }; delete next.images; return next; });
      notify(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} added.`, 'success');
    } catch {
      notify('Failed to upload image(s). Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const [form, setForm] = useState({
    title: '', slug: '', code: '', excerpt: '', description: '', story: '',
    styling_notes: '', event_suitability: '',
    category_id: '', category_slug: '', occasion: '', occasions: [] as string[],
    price: '', price_type: [] as string[], status: [] as string[],
    work_type: [] as string[],
    product_type: [] as string[],
    fabric_main: [] as string[], fabric_blouse: [] as string[], fabric_dupatta: [] as string[],
    fabric_lining: [] as string[], fabric_dupatta1: [] as string[], fabric_dupatta2: [] as string[],
    color_main: [] as string[], color_dupatta1: [] as string[], color_dupatta2: [] as string[],
    colors: [] as string[], embroidery: [] as string[],
    includes: [] as string[], customisation_options: [] as string[],
    accessories: [] as string[],
    hand_work_details: [] as string[],
    customisation_level: [] as string[],
    customisable: true, delivery_time: '', measurement_notes: '',
    is_featured: false, is_new: false, is_best_seller: false, is_active: false,
    seo_title: '', seo_description: '', image_alt_text: '',
    highlights: [] as string[],
    care_instructions: '',
    whats_included: [] as string[],
    website_placement: [] as string[],
    visibility_flags: [] as string[],
    visibility: 'website',
    priority: [] as string[],
    related_product_ids: [] as string[],
  });

  useEffect(() => {
    fetchCategories().then((cats) => setCategories(cats.map((c: { id: string; slug: string; title: string }) => ({ id: c.id, slug: c.slug, title: c.title }))));
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (data) {
      setForm({
        title: data.title ?? '', slug: data.slug ?? '', code: data.code ?? '',
        excerpt: data.excerpt ?? '', description: data.description ?? '', story: data.story ?? '',
        styling_notes: data.styling_notes ?? '', event_suitability: data.event_suitability ?? '',
        category_id: data.category_id ?? '', category_slug: data.category_slug ?? '',
        occasion: data.occasion ?? '', occasions: data.occasions ?? [],
        price: data.price?.toString() ?? '',
        price_type: data.price_type ? [data.price_type] : [],
        status: data.status ? [data.status] : [],
        work_type: data.work_type ? [data.work_type] : [],
        product_type: data.product_type ? [data.product_type] : [],
        fabric_main: data.fabric_main ? [data.fabric_main] : [],
        fabric_blouse: data.fabric_blouse ? [data.fabric_blouse] : [],
        fabric_dupatta: data.fabric_dupatta ? [data.fabric_dupatta] : [],
        fabric_lining: data.fabric_lining ? [data.fabric_lining] : [],
        fabric_dupatta1: data.fabric_dupatta1 ? [data.fabric_dupatta1] : [],
        fabric_dupatta2: data.fabric_dupatta2 ? [data.fabric_dupatta2] : [],
        color_main: data.color_main ? [data.color_main] : [],
        color_dupatta1: data.color_dupatta1 ? [data.color_dupatta1] : [],
        color_dupatta2: data.color_dupatta2 ? [data.color_dupatta2] : [],
        colors: data.colors ?? [], embroidery: data.embroidery ?? [],
        includes: data.includes ?? [], customisation_options: data.customisation_options ?? [],
        accessories: data.accessories ?? [],
        hand_work_details: data.hand_work_details ?? [],
        customisation_level: data.customisation_level ? [data.customisation_level] : [],
        customisable: data.customisable ?? true, delivery_time: data.delivery_time ?? '',
        measurement_notes: data.measurement_notes ?? '',
        is_featured: data.is_featured ?? false, is_new: data.is_new ?? false,
        is_best_seller: data.is_best_seller ?? false, is_active: data.is_active ?? false,
        seo_title: data.seo_title ?? '', seo_description: data.seo_description ?? '',
        image_alt_text: data.image_alt_text ?? '',
        highlights: data.highlights ?? [],
        care_instructions: data.care_instructions ?? '',
        whats_included: data.includes ?? [],
        website_placement: data.website_placement ?? [],
        visibility_flags: [],
        visibility: data.visibility ?? 'website',
        priority: data.priority ? [data.priority] : [],
        related_product_ids: data.related_product_ids ?? [],
      });
      // Reconstruct visibility_flags from DB boolean/placement fields
      const flags: string[] = [];
      if (data.is_featured) flags.push('Featured');
      if (data.is_best_seller) flags.push('Bestseller');
      if (data.is_new) flags.push('New Arrival');
      if (Array.isArray(data.website_placement)) {
        if (data.website_placement.includes('Trending')) flags.push('Trending');
        if (data.website_placement.includes('Signature Collection')) flags.push('Signature Collection');
      }
      if (data.visibility === 'website' || data.is_active) flags.push('Website');
      if (data.visibility === 'instagram_ready') flags.push('Instagram');
      if (data.visibility === 'whatsapp_catalogue') flags.push('WhatsApp Catalogue');
      if (data.visibility === 'hidden') flags.push('Hidden');
      setForm((prev) => ({ ...prev, visibility_flags: flags }));

      const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', id).order('sort_order');
      setImageUrls((imgs ?? []).map((img: { url: string }) => img.url));
      setVideoUrl(data.video_url ?? '');
      setThumbnailIndex(data.thumbnail_index ?? 0);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    setThumbnailIndex((prev) => (prev === idx ? 0 : prev > idx ? prev - 1 : prev));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = 'Design number is required';
    if (imageUrls.length === 0) errs.images = 'At least one product image is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const removeFromQuickCollection = () => {
    try {
      const raw = localStorage.getItem('quick-collection-draft');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed.products) return;
      const filtered = parsed.products.filter((p: { savedProductId?: string | null }) => p.savedProductId !== id);
      if (filtered.length === 0) {
        localStorage.removeItem('quick-collection-draft');
      } else {
        localStorage.setItem('quick-collection-draft', JSON.stringify({ ...parsed, products: filtered, savedAt: Date.now() }));
      }
    } catch { /* storage unavailable */ }
  };

  const handleSave = async (publish = false, action: 'default' | 'details' | 'publish' = 'default') => {
    if (!validate()) { notify('Please complete required fields (image + design number).', 'error'); return; }
    setSaving(true);
    const title = form.title.trim() || form.code.trim();
    const slug = form.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const safeThumb = Math.min(thumbnailIndex, Math.max(0, imageUrls.length - 1));

    // Expand occasions (Other Functions → all function events)
    const expandedOccasions = expandOccasions(form.occasions);

    // Map multi-select arrays back to single-value DB fields
    const priceTypeVal = (form.price_type[0] ?? 'price_on_request') === 'Fixed Price' ? 'fixed'
      : (form.price_type[0] ?? 'price_on_request') === 'Starting From' ? 'starting_from'
      : 'price_on_request';
    const statusVal = form.status[0] ?? 'made_on_order';
    const workTypeVal = form.work_type[0] ?? 'Hand Work';
    const productTypeVal = form.product_type[0] ?? '';
    const customisationLevelVal = form.customisation_level[0] ?? 'Fully Customisable';
    const priorityVal = form.priority[0] ?? 'Medium';

    // Map visibility flags to DB fields
    const flags = form.visibility_flags;
    const isFeatured = flags.includes('Featured');
    const isBestSeller = flags.includes('Bestseller');
    const isNew = flags.includes('New Arrival');
    const isSignature = flags.includes('Signature Collection');
    const isHidden = flags.includes('Hidden');
    const onInstagram = flags.includes('Instagram');
    const onWhatsApp = flags.includes('WhatsApp Catalogue');
    const isTrending = flags.includes('Trending');

    let visibility = 'website';
    if (isHidden) visibility = 'hidden';
    else if (onWhatsApp) visibility = 'whatsapp_catalogue';
    else if (onInstagram) visibility = 'instagram_ready';

    const websitePlacement: string[] = [];
    if (isFeatured) websitePlacement.push('Featured');
    if (isBestSeller) websitePlacement.push('Bestseller');
    if (isNew) websitePlacement.push('New Arrival');
    if (isTrending) websitePlacement.push('Trending');
    if (isSignature) websitePlacement.push('Signature Collection');

    const { whats_included, category_id, visibility_flags, priority, price_type, status, work_type, product_type, customisation_level, color_main, color_dupatta1, color_dupatta2, fabric_main, fabric_dupatta1, fabric_dupatta2, ...rest } = form;

    const productData = {
      ...rest,
      title,
      slug,
      category_id: category_id || null,
      video_url: videoUrl || null,
      thumbnail_index: safeThumb,
      price: form.price ? parseFloat(form.price) : null,
      is_active: publish ? true : (isHidden ? false : form.is_active),
      occasions: expandedOccasions,
      occasion: expandedOccasions[0] ?? null,
      price_type: priceTypeVal,
      status: statusVal,
      work_type: workTypeVal,
      product_type: productTypeVal,
      customisation_level: customisationLevelVal,
      priority: priorityVal,
      colors: form.colors,
      embroidery: form.embroidery,
      includes: whats_included,
      customisation_options: form.customisation_options,
      accessories: form.accessories,
      hand_work_details: form.hand_work_details,
      highlights: form.highlights,
      care_instructions: form.care_instructions || null,
      website_placement: websitePlacement,
      visibility,
      is_featured: isFeatured,
      is_new: isNew,
      is_best_seller: isBestSeller,
      color_main: color_main[0] ?? null,
      color_dupatta1: color_dupatta1[0] ?? null,
      color_dupatta2: color_dupatta2[0] ?? null,
      fabric_main: fabric_main[0] ?? null,
      fabric_dupatta1: fabric_dupatta1[0] ?? null,
      fabric_dupatta2: fabric_dupatta2[0] ?? null,
      related_product_ids: form.related_product_ids,
    };

    try {
      let productId = id;
      if (isEdit && id) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
        await logActivity('product_updated', `Updated product: ${title}`, 'product', id);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select('id').maybeSingle();
        if (error) throw error;
        productId = data?.id;
        await logActivity('product_added', `Added product: ${title}`, 'product', productId);
      }

      if (productId && imageUrls.length > 0) {
        if (isEdit) await supabase.from('product_images').delete().eq('product_id', productId);
        const imgInserts = imageUrls.map((url, i) => ({
          product_id: productId,
          url,
          alt: form.image_alt_text || title,
          sort_order: i,
          view_type: i === safeThumb ? 'hero' : 'gallery',
        }));
        await supabase.from('product_images').insert(imgInserts);
      }

      notify(publish ? 'Product published successfully.' : 'Product saved as draft.');
      if (action === 'details') {
        navigate('/admin/quick-collection');
      } else if (action === 'publish' && fromQuick) {
        removeFromQuickCollection();
        navigate('/admin/quick-collection');
      } else {
        navigate('/admin/products');
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to save product.';
      notify(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    const slugDup = `${form.slug}-copy`;
    const { whats_included, category_id, ...rest } = form;
    const { error } = await supabase.from('products').insert({
      ...rest,
      slug: slugDup,
      category_id: category_id || null,
      code: `${form.code}-COPY`,
      title: `${form.title} (Copy)`,
      includes: whats_included,
      is_active: false, is_featured: false, is_new: false,
    });
    if (!error) { notify('Product duplicated successfully.'); navigate('/admin/products'); }
  };

  const currentStepIndex = steps.findIndex((s) => s.key === activeStep);
  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setActiveStep(steps[currentStepIndex + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goBack = () => {
    if (currentStepIndex > 0) {
      setActiveStep(steps[currentStepIndex - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showDupatta2 = form.accessories.includes('Second Dupatta');
  const showHandWorkDetails = form.work_type.includes('Hand Work') || form.work_type.includes('Mix Work');

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-100 bg-white text-navy-900 transition-colors hover:bg-ivory-200">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-h2 font-serif font-medium text-navy-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
            <p className="mt-0.5 text-sm font-light text-charcoal-500">{isEdit ? form.title : 'Create a new couture piece'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && form.slug && <PreviewButton to={`/product/${form.slug}`} />}
          {isEdit && (
            <button onClick={handleDuplicate} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200">
              <Copy size={14} /> Duplicate
            </button>
          )}
          {fromQuick ? (
            <>
              <button onClick={() => handleSave(false, 'details')} disabled={saving} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Details
              </button>
              <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
              </button>
              <button onClick={() => handleSave(true, 'publish')} disabled={saving} className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
              </button>
            </>
          )}
        </div>
      </div>

      {/* Step progress */}
      <div className="mb-6 overflow-x-auto no-scrollbar">
        <ol className="flex min-w-max items-center gap-1.5 px-1 py-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = activeStep === s.key;
            const isDone = currentStepIndex > i;
            return (
              <li key={s.key} className="flex items-center">
                <button
                  onClick={() => setActiveStep(s.key)}
                  className={`flex items-center gap-2 rounded-luxury px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-navy-900 text-ivory-100 shadow-soft'
                      : isDone
                        ? 'bg-gold-50 text-gold-800 hover:bg-gold-100'
                        : 'bg-white text-charcoal-400 hover:bg-ivory-200'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                    isActive ? 'bg-gold-500 text-navy-900' : isDone ? 'bg-gold-400 text-navy-900' : 'bg-ivory-200 text-charcoal-500'
                  }`}>
                    {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap">{s.label}</span>
                  <Icon size={13} className="opacity-60" />
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight size={14} className="mx-0.5 text-charcoal-300" />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Step content */}
      <div className="rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
        {/* STEP 1 — MEDIA */}
        {activeStep === 'media' && (
          <div className="space-y-7">
            <StepHeader step={1} title="Media" subtitle="Upload product images, an optional showcase video, and choose the thumbnail." />

            {/* Image upload */}
            <div>
              <Field label="Product Images *" error={errors.images}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
                  className={`cursor-pointer rounded-luxury border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300 hover:bg-ivory-50'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ''; }}
                    className="hidden"
                  />
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-500">
                    <Upload size={22} strokeWidth={1.5} className={uploading ? 'animate-pulse' : ''} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-navy-900">{uploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
                  <p className="mt-1 text-xs font-light text-charcoal-400">Upload multiple images — 5 to 15 recommended</p>
                </div>
              </Field>

              {/* Add from Media Library */}
              <div className="mt-3 flex gap-2">
                <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="input-luxury flex-1" placeholder="Or paste an image URL..." />
                <button
                  onClick={() => { if (newImageUrl.trim()) { setImageUrls((prev) => [...prev, newImageUrl.trim()]); setNewImageUrl(''); } }}
                  className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <MediaGalleryPicker onAdd={(url) => setImageUrls((prev) => [...prev, url])} />
            </div>

            {/* Image grid + thumbnail selection */}
            {imageUrls.length > 0 && (
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.12em] text-charcoal-600">
                  Gallery — click the star to set the thumbnail ({imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''})
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {imageUrls.map((url, i) => (
                    <div key={i} className={`group relative aspect-square overflow-hidden rounded-luxury border-2 transition-all ${
                      i === thumbnailIndex ? 'border-gold-500 shadow-gold' : 'border-navy-50'
                    }`}>
                      <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-contain" />
                      <button
                        onClick={() => setThumbnailIndex(i)}
                        aria-label={i === thumbnailIndex ? 'Thumbnail selected' : 'Set as thumbnail'}
                        className={`absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full shadow-soft transition-all ${
                          i === thumbnailIndex
                            ? 'bg-gold-500 text-navy-900'
                            : 'bg-white/85 text-charcoal-500 hover:bg-gold-100 hover:text-gold-700'
                        }`}
                      >
                        <Sparkles size={13} strokeWidth={i === thumbnailIndex ? 2.5 : 1.75} />
                      </button>
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-soft transition-transform hover:scale-110"
                        aria-label="Remove image"
                      >
                        <X size={13} />
                      </button>
                      {i === thumbnailIndex && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-gold-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-navy-900">
                          Thumbnail
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video upload */}
            <div className="border-t border-navy-50 pt-6">
              <Field label="Showcase Video (optional)">
                <MediaPicker
                  value={videoUrl}
                  onChange={setVideoUrl}
                  mediaType="video"
                  folder="product_videos"
                />
              </Field>
            </div>
          </div>
        )}

        {/* STEP 2 — OCCASION */}
        {activeStep === 'occasion' && (
          <div className="space-y-7">
            <StepHeader step={2} title="Occasion" subtitle="Select one or more occasions this piece is suited for." />

            <MultiComboField
              label="Occasion"
              values={form.occasions}
              options={occasionCategoryOptions}
              onChange={(v) => update('occasions', v)}
              required
              placeholder="Search or type occasion"
            />

            {form.occasions.includes('Other Functions') && (
              <div className="rounded-luxury border border-gold-100 bg-gold-50/50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-gold-800">Other Functions Selected</p>
                <p className="mt-1.5 text-xs font-light text-charcoal-600">
                  This product will automatically appear in all function pages (Haldi, Mehendi, Sangeet, Cocktail, Reception, Nikah, Walima, Party, Photoshoot) without creating duplicate products.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otherFunctionEvents.map((e) => (
                    <span key={e} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-900 shadow-soft">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {form.occasions.length > 0 && (
              <div className="rounded-luxury border border-navy-50 bg-ivory-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-charcoal-600">Selected occasions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.occasions.map((o) => (
                    <span key={o} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-soft">
                      {o}
                      <button onClick={() => update('occasions', form.occasions.filter((v) => v !== o))} className="text-charcoal-400 hover:text-red-500" aria-label={`Remove ${o}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — PRODUCT INFORMATION */}
        {activeStep === 'info' && (
          <div className="space-y-7">
            <StepHeader step={3} title="Product Information" subtitle="Core details that identify this couture piece." />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Product Name *" error={errors.title}>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="input-luxury" placeholder="e.g. Royal Zardozi Bridal Lehenga" />
              </Field>
              <Field label="Design Number (Unique) *" error={errors.code}>
                <input type="text" value={form.code} onChange={(e) => update('code', e.target.value)} className="input-luxury" placeholder="e.g. LC-2045" />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <MultiComboField
                label="Product Type *"
                values={form.product_type}
                options={productTypeOptions}
                onChange={(v) => update('product_type', v)}
                required
                placeholder="Search or type"
              />
              <MultiComboField
                label="Category"
                values={form.category_id ? [categories.find((c) => c.id === form.category_id)?.title ?? ''] : []}
                options={categories.map((c) => c.title)}
                onChange={(v) => {
                  const title = v[v.length - 1] ?? '';
                  const cat = categories.find((c) => c.title === title);
                  if (cat) { update('category_id', cat.id); update('category_slug', cat.slug); }
                  else { update('category_id', ''); update('category_slug', ''); }
                }}
                placeholder="Search or type"
              />
              <MultiComboField
                label="Work Type"
                values={form.work_type}
                options={workTypeOptions}
                onChange={(v) => {
                  update('work_type', v);
                  if (!v.includes('Hand Work') && !v.includes('Mix Work')) update('hand_work_details', []);
                }}
                placeholder="Search or type"
              />
              <MultiComboField
                label="Price Type"
                values={form.price_type}
                options={priceTypes}
                onChange={(v) => update('price_type', v)}
                placeholder="Search or type"
              />
              {form.price_type.includes('Fixed Price') || form.price_type.includes('Starting From') ? (
                <Field label="Price (₹)">
                  <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="input-luxury" placeholder="0" />
                </Field>
              ) : (
                <MultiComboField
                  label="Availability"
                  values={form.status}
                  options={availabilityOptions}
                  onChange={(v) => update('status', v)}
                  placeholder="Search or type"
                />
              )}
              <MultiComboField
                label="Availability"
                values={form.status}
                options={availabilityOptions}
                onChange={(v) => update('status', v)}
                placeholder="Search or type"
              />
            </div>

            {/* Accessories — moved into Product Info */}
            <MultiComboField
              label="Accessories"
              values={form.accessories}
              options={accessoryOptions}
              onChange={(v) => update('accessories', v)}
              placeholder="Search or type accessories"
            />

            <Field label="Short Summary">
              <textarea rows={2} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="input-luxury resize-none" placeholder="A brief one-line summary for product cards..." />
            </Field>
          </div>
        )}

        {/* STEP 4 — DETAILS */}
        {activeStep === 'details' && (
          <div className="space-y-7">
            <StepHeader step={4} title="Product Details" subtitle="Rich descriptions, highlights, inclusions, work details, and care guidance." />

            <Field label="Short Description">
              <textarea rows={2} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="input-luxury resize-none" placeholder="A concise one-line summary shown on product cards..." />
            </Field>

            <Field label="Detailed Description">
              <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="input-luxury resize-none" placeholder="Full narrative description of the outfit, its inspiration, and craftsmanship..." />
            </Field>

            {/* Hand work details — conditional */}
            {showHandWorkDetails && (
              <MultiComboField
                label="Hand Work Details"
                values={form.hand_work_details}
                options={handWorkDetailOptions}
                onChange={(v) => update('hand_work_details', v)}
                placeholder="Search or type"
              />
            )}

            {/* Customisation level */}
            <MultiComboField
              label="Customisation"
              values={form.customisation_level}
              options={customisationLevelOptions}
              onChange={(v) => {
                update('customisation_level', v);
                update('customisable', !v.includes('Not Customisable'));
              }}
              allowCustom={false}
              placeholder="Select customisation level"
            />

            {/* Highlights */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-charcoal-600">Highlights</p>
                <button
                  onClick={() => update('highlights', [...form.highlights, ''])}
                  className="flex items-center gap-1 rounded-luxury bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy-700 transition-colors hover:bg-navy-100"
                >
                  <Plus size={12} /> Add highlight
                </button>
              </div>
              {form.highlights.length === 0 ? (
                <p className="rounded-luxury border border-dashed border-navy-100 bg-ivory-50 px-4 py-3 text-center text-xs font-light text-charcoal-400">
                  No highlights added yet. Click "Add highlight" to begin.
                </p>
              ) : (
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const next = [...form.highlights];
                          next[i] = e.target.value;
                          update('highlights', next);
                        }}
                        className="input-luxury flex-1"
                        placeholder={`Highlight ${i + 1}, e.g. Hand-embroidered Zardozi borders`}
                      />
                      <button
                        onClick={() => update('highlights', form.highlights.filter((_, idx) => idx !== i))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-luxury border border-navy-50 text-red-500 transition-colors hover:bg-red-50"
                        aria-label="Remove highlight"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* What's Included */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-charcoal-600">What's Included</p>
                <button
                  onClick={() => update('whats_included', [...form.whats_included, ''])}
                  className="flex items-center gap-1 rounded-luxury bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy-700 transition-colors hover:bg-navy-100"
                >
                  <Plus size={12} /> Add item
                </button>
              </div>
              {form.whats_included.length === 0 ? (
                <p className="rounded-luxury border border-dashed border-navy-100 bg-ivory-50 px-4 py-3 text-center text-xs font-light text-charcoal-400">
                  List what's included with this piece (e.g. Lehenga, Blouse, Dupatta).
                </p>
              ) : (
                <div className="space-y-2">
                  {form.whats_included.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const next = [...form.whats_included];
                          next[i] = e.target.value;
                          update('whats_included', next);
                        }}
                        className="input-luxury flex-1"
                        placeholder={`Item ${i + 1}, e.g. Choli / Blouse`}
                      />
                      <button
                        onClick={() => update('whats_included', form.whats_included.filter((_, idx) => idx !== i))}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-luxury border border-navy-50 text-red-500 transition-colors hover:bg-red-50"
                        aria-label="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Products */}
            <div className="border-t border-navy-50 pt-6">
              <RelatedProductPicker
                selectedIds={form.related_product_ids}
                onChange={(ids) => update('related_product_ids', ids)}
                excludeId={id}
              />
            </div>

            <Field label="Care Instructions">
              <textarea rows={4} value={form.care_instructions} onChange={(e) => update('care_instructions', e.target.value)} className="input-luxury resize-none" placeholder="Dry clean only. Store in a cool, dry place away from direct sunlight..." />
            </Field>
          </div>
        )}

        {/* STEP 5 — COLOURS & FABRICS */}
        {activeStep === 'colours' && (
          <div className="space-y-7">
            <StepHeader step={5} title="Colours & Fabrics" subtitle="Specify the colour and fabric for each component of the outfit." />

            {/* Main outfit */}
            <div className="rounded-luxury-lg border border-navy-50 bg-ivory-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Shirt size={16} className="text-gold-600" />
                <h3 className="text-sm font-serif font-medium text-navy-900">Main Outfit</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <MultiComboField
                  label="Colour"
                  values={form.color_main}
                  options={colorSwatches.map((c) => c.name)}
                  onChange={(v) => update('color_main', v)}
                  placeholder="Search or type"
                />
                <MultiComboField
                  label="Fabric"
                  values={form.fabric_main}
                  options={fabricOptions}
                  onChange={(v) => update('fabric_main', v)}
                  placeholder="Search or type"
                />
              </div>
            </div>

            {/* Dupatta 1 */}
            <div className="rounded-luxury-lg border border-navy-50 bg-ivory-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers size={16} className="text-gold-600" />
                <h3 className="text-sm font-serif font-medium text-navy-900">Dupatta 1</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <MultiComboField
                  label="Colour"
                  values={form.color_dupatta1}
                  options={colorSwatches.map((c) => c.name)}
                  onChange={(v) => update('color_dupatta1', v)}
                  placeholder="Search or type"
                />
                <MultiComboField
                  label="Fabric"
                  values={form.fabric_dupatta1}
                  options={fabricOptions}
                  onChange={(v) => update('fabric_dupatta1', v)}
                  placeholder="Search or type"
                />
              </div>
            </div>

            {/* Dupatta 2 — conditional */}
            {showDupatta2 && (
              <div className="rounded-luxury-lg border-2 border-gold-200 bg-gold-50/40 p-5 animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-gold-700" />
                    <h3 className="text-sm font-serif font-medium text-navy-900">Dupatta 2</h3>
                  </div>
                  <span className="rounded-full bg-gold-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-900">
                    Second Dupatta selected
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <MultiComboField
                    label="Colour"
                    values={form.color_dupatta2}
                    options={colorSwatches.map((c) => c.name)}
                    onChange={(v) => update('color_dupatta2', v)}
                    placeholder="Search or type"
                  />
                  <MultiComboField
                    label="Fabric"
                    values={form.fabric_dupatta2}
                    options={fabricOptions}
                    onChange={(v) => update('fabric_dupatta2', v)}
                    placeholder="Search or type"
                  />
                </div>
              </div>
            )}

            {!showDupatta2 && (
              <p className="rounded-luxury border border-dashed border-navy-100 bg-ivory-50 px-4 py-3 text-center text-xs font-light text-charcoal-400">
                Select "Second Dupatta" in the Accessories (Product Info step) to add Dupatta 2 details.
              </p>
            )}
          </div>
        )}

        {/* STEP 6 — VISIBILITY */}
        {activeStep === 'visibility' && (
          <div className="space-y-7">
            <StepHeader step={6} title="Visibility" subtitle="Control where this product appears and its merchandising priority." />

            <MultiComboField
              label="Flags & Placement"
              values={form.visibility_flags}
              options={visibilityFlagOptions}
              onChange={(v) => update('visibility_flags', v)}
              placeholder="Search or select flags"
            />

            <MultiComboField
              label="Priority"
              values={form.priority}
              options={priorityOptions}
              onChange={(v) => update('priority', v)}
              allowCustom={false}
              placeholder="Select priority"
            />

            {form.visibility_flags.length > 0 && (
              <div className="rounded-luxury border border-gold-100 bg-gold-50/50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-gold-800">Selected visibility</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.visibility_flags.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-soft">
                      {f}
                      <button onClick={() => update('visibility_flags', form.visibility_flags.filter((v) => v !== f))} className="text-charcoal-400 hover:text-red-500" aria-label={`Remove ${f}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-5 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Back
        </button>

        <p className="text-xs font-light text-charcoal-400">
          Step {currentStepIndex + 1} of {steps.length}
        </p>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-ivory-100 transition-colors hover:bg-navy-800"
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={() => handleSave(true, fromQuick ? 'publish' : 'default')}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
          </button>
        )}
      </div>
    </AdminLayout>
  );
}

/* ── Helper components ────────────────────────────────────────────── */

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-luxury bg-navy-900 font-serif text-lg font-medium text-gold-400">
        {step}
      </span>
      <div>
        <h2 className="font-serif text-xl font-medium text-navy-900">{title}</h2>
        <p className="mt-0.5 text-sm font-light text-charcoal-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function RelatedProductPicker({
  selectedIds,
  onChange,
  excludeId,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeId?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; title: string; code: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string; code: string | null }[]>([]);

  useEffect(() => {
    if (selectedIds.length === 0) { setSelectedProducts([]); return; }
    supabase
      .from('products')
      .select('id, title, code')
      .in('id', selectedIds)
      .then(({ data }) => {
        setSelectedProducts((data ?? []).filter((p) => p.id !== excludeId));
      });
  }, [selectedIds, excludeId]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const data = await searchProducts(query.trim());
      setResults(data.filter((p: { id: string }) => p.id !== excludeId && !selectedIds.includes(p.id)));
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query, selectedIds, excludeId]);

  const addProduct = (p: { id: string; title: string; code: string | null }) => {
    onChange([...selectedIds, p.id]);
    setQuery('');
    setResults([]);
  };

  const removeProduct = (pid: string) => {
    onChange(selectedIds.filter((id) => id !== pid));
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Related Products</p>
        <p className="mb-2 text-xs font-light text-charcoal-500">Link complementary pieces by searching Product Name or Design Number.</p>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Product Name or Design Number..."
            className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:ring-2 focus:ring-gold-200 focus:outline-none"
          />
          {searching && (
            <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-charcoal-300" />
          )}
        </div>

        {results.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-luxury border border-navy-50 bg-white shadow-soft">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => addProduct(p)}
                className="flex w-full items-center justify-between gap-3 border-b border-navy-50 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-ivory-50"
              >
                <div>
                  <p className="text-sm font-medium text-navy-900">{p.title}</p>
                  <p className="text-xs font-light text-charcoal-400">{p.code ?? 'No code'}</p>
                </div>
                <Plus size={16} className="shrink-0 text-gold-600" />
              </button>
            ))}
          </div>
        )}

        {query.trim().length >= 2 && results.length === 0 && !searching && (
          <p className="mt-2 text-xs font-light text-charcoal-400">No matching products found.</p>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">
          Linked Products ({selectedProducts.length})
        </p>
        {selectedProducts.length === 0 ? (
          <p className="rounded-luxury border border-dashed border-navy-100 bg-ivory-50 px-4 py-3 text-center text-xs font-light text-charcoal-400">
            No related products linked yet.
          </p>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-luxury border border-navy-50 bg-ivory-50 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-navy-900">{p.title}</p>
                  <p className="text-xs font-light text-charcoal-400">{p.code ?? 'No code'}</p>
                </div>
                <button
                  onClick={() => removeProduct(p.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                  aria-label={`Remove ${p.title}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Media Gallery Picker (adds images from Media Library) ────────── */
function MediaGalleryPicker({ onAdd }: { onAdd: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-luxury border border-gold-200 bg-gold-50/50 px-3 py-2 text-xs font-medium text-gold-800 transition-colors hover:bg-gold-50"
      >
        <ImageIcon size={13} /> Choose from Media Library
      </button>
      {open && (
        <MediaLibraryGalleryModal
          onClose={() => setOpen(false)}
          onSelect={(url) => { onAdd(url); }}
        />
      )}
    </>
  );
}

function MediaLibraryGalleryModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [media, setMedia] = useState<Awaited<ReturnType<typeof fetchMedia>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia().then((data) => { setMedia(data.filter((m) => m.type === 'image')); setLoading(false); });
  }, []);

  let display = media;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((m) => m.name.toLowerCase().includes(q));
  }

  const handleUpload = async (files: FileList) => {
    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      await insertMedia({
        name: file.name, url: pub.publicUrl, type: 'image',
        folder: 'product_images', size_bytes: file.size, width: null, height: null, alt_text: null, usage_type: null,
      });
      const data = await fetchMedia();
      setMedia(data.filter((m) => m.type === 'image'));
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-luxury-lg bg-ivory-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-50 bg-white px-6 py-4">
          <h2 className="text-lg font-serif font-medium text-navy-900">Choose Image from Library</h2>
          <button onClick={onClose} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mb-3 flex gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-1.5 rounded-luxury border-2 border-dashed border-navy-100 px-3 py-2 text-xs font-medium hover:border-gold-300"
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files) handleUpload(e.target.files); e.target.value = ''; }} />
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload
            </div>
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-luxury border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-luxury" />)}
              </div>
            ) : display.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
                  <p className="mt-2 text-sm font-light text-charcoal-400">No images found</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                {display.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => { onSelect(asset.url); onClose(); }}
                    className="group relative aspect-square overflow-hidden rounded-luxury border border-navy-50 bg-ivory-100 transition-all hover:border-gold-400 hover:shadow-soft"
                  >
                    <img src={asset.url} alt={asset.alt_text ?? asset.name} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-navy-900"><Check size={16} strokeWidth={3} /></span>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 truncate bg-navy-950/60 px-1.5 py-0.5 text-[9px] font-light text-ivory-100">{asset.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
