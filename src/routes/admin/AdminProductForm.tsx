import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, Copy, Loader2, Plus, X, Upload, Check,
  ImageIcon, Video, ChevronLeft, ChevronRight, Shirt, Sparkles,
  Palette, Scissors, Layers, FileText, LayoutGrid, Link2, Search,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity, fetchCategories, searchProducts } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import { fabricOptions, colorSwatches } from '@/config/customisation';

/* ── New option sets for product management ──────────────────────── */
const websitePlacementOptions = [
  'New Arrival', 'Featured', 'Signature Collection', 'Bestseller',
  'Trending', 'Limited Edition', 'Homepage Hero', 'Staff Pick', "Editor's Choice",
] as const;

const visibilityOptions = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp_catalogue', label: 'WhatsApp Catalogue' },
  { value: 'instagram_ready', label: 'Instagram Ready' },
  { value: 'hidden', label: 'Hidden' },
] as const;

const priorityOptions = [
  { value: 'VIP', label: 'VIP' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
] as const;

/* ── Form option sets (per redesign spec) ─────────────────────────── */

const productTypeOptions = [
  'Lehenga', 'Farshi', 'Trail Dress', 'Indo Western', 'Saree',
  'Suit', 'Sharara', 'Gharara', 'Gown', 'Anarkali',
] as const;

const occasionCategoryOptions = [
  { value: 'Wedding (Bridal)', label: 'Wedding (Bridal)' },
  { value: 'Engagement', label: 'Engagement' },
  { value: 'Other Functions', label: 'Other Functions' },
] as const;

const accessoryOptions = [
  'Potli', 'Tassels (Latkan)', 'Extra Belt', 'Second Dupatta',
  'Veil Dupatta', 'Cape', 'Jacket', 'Can Can',
] as const;

const workTypeOptions = [
  { value: 'Hand Work', label: 'Hand Work' },
  { value: 'Machine Work', label: 'Machine Work' },
  { value: 'Mix Work', label: 'Mix Work' },
] as const;

const handWorkDetailOptions = [
  'Dabka', 'Zardozi', 'Thread Work', 'Pearl',
  'Cutdana', 'Sequence', 'Stone', 'Mirror', 'Other',
] as const;

const customisationLevelOptions = [
  { value: 'Fully Customisable', label: 'Fully Customisable' },
  { value: 'Partially Customisable', label: 'Partially Customisable' },
  { value: 'Not Customisable', label: 'Not Customisable' },
] as const;

/* Existing schema-backed selects kept for completeness */
const priceTypes = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'price_on_request', label: 'Price on Request' },
];
const availabilityOptions = [
  { value: 'ready_to_ship', label: 'Ready In Stock' },
  { value: 'made_on_order', label: 'Made On Order' },
  { value: 'signature', label: 'Signature Collection' },
  { value: 'limited_availability', label: 'Limited Availability' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'archived', label: 'Archived' },
];

type StepKey = 'media' | 'info' | 'details' | 'occasion' | 'accessories' | 'colours' | 'work' | 'placement' | 'related';

const steps: { key: StepKey; label: string; icon: typeof ImageIcon }[] = [
  { key: 'media', label: 'Media', icon: ImageIcon },
  { key: 'info', label: 'Product Info', icon: Shirt },
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'occasion', label: 'Occasion', icon: Sparkles },
  { key: 'accessories', label: 'Accessories', icon: Layers },
  { key: 'colours', label: 'Colours & Fabrics', icon: Palette },
  { key: 'work', label: 'Work', icon: Scissors },
  { key: 'placement', label: 'Placement', icon: LayoutGrid },
  { key: 'related', label: 'Related', icon: Link2 },
];

export function AdminProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();

  const [categories, setCategories] = useState<{ id: string; slug: string; title: string }[]>([]);
  const [activeStep, setActiveStep] = useState<StepKey>('media');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handleVideoUpload = async (files: FileList) => {
    const videoFile = Array.from(files).find((f) => f.type.startsWith('video/'));
    if (!videoFile) return;
    setUploadingVideo(true);
    try {
      const ext = videoFile.name.split('.').pop() ?? 'mp4';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, videoFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      setVideoUrl(pub.publicUrl);
      setErrors((prev) => { const next = { ...prev }; delete next.video; return next; });
      notify('Video added.', 'success');
    } catch {
      notify('Failed to upload video. Please try again.', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  const [form, setForm] = useState({
    title: '', slug: '', code: '', excerpt: '', description: '', story: '',
    styling_notes: '', event_suitability: '',
    category_id: '', category_slug: '', occasion: '', occasions: [] as string[],
    price: '', price_type: 'price_on_request', status: 'made_on_order',
    work_type: 'Hand Work',
    product_type: '',
    fabric_main: '', fabric_blouse: '', fabric_dupatta: '',
    fabric_lining: '', fabric_dupatta1: '', fabric_dupatta2: '',
    color_main: '', color_dupatta1: '', color_dupatta2: '',
    colors: [] as string[], embroidery: [] as string[],
    includes: [] as string[], customisation_options: [] as string[],
    accessories: [] as string[],
    hand_work_details: [] as string[],
    customisation_level: 'Fully Customisable',
    customisable: true, delivery_time: '', measurement_notes: '',
    is_featured: false, is_new: false, is_best_seller: false, is_active: false,
    seo_title: '', seo_description: '', image_alt_text: '',
    highlights: [] as string[],
    care_instructions: '',
    whats_included: [] as string[],
    website_placement: [] as string[],
    visibility: 'website',
    priority: 'Medium',
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
        price: data.price?.toString() ?? '', price_type: data.price_type ?? 'price_on_request',
        status: data.status ?? 'made_on_order', work_type: data.work_type ?? 'Hand Work',
        product_type: data.product_type ?? '',
        fabric_main: data.fabric_main ?? '', fabric_blouse: data.fabric_blouse ?? '',
        fabric_dupatta: data.fabric_dupatta ?? '', fabric_lining: data.fabric_lining ?? '',
        fabric_dupatta1: data.fabric_dupatta1 ?? '', fabric_dupatta2: data.fabric_dupatta2 ?? '',
        color_main: data.color_main ?? '', color_dupatta1: data.color_dupatta1 ?? '',
        color_dupatta2: data.color_dupatta2 ?? '',
        colors: data.colors ?? [], embroidery: data.embroidery ?? [],
        includes: data.includes ?? [], customisation_options: data.customisation_options ?? [],
        accessories: data.accessories ?? [],
        hand_work_details: data.hand_work_details ?? [],
        customisation_level: data.customisation_level ?? 'Fully Customisable',
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
        visibility: data.visibility ?? 'website',
        priority: data.priority ?? 'Medium',
        related_product_ids: data.related_product_ids ?? [],
      });
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

  const toggleArray = (field: string, value: string) => {
    setForm((prev) => {
      const arr = prev[field as keyof typeof prev] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    setThumbnailIndex((prev) => (prev === idx ? 0 : prev > idx ? prev - 1 : prev));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Product name is required';
    if (!form.code.trim()) errs.code = 'Design number is required';
    if (!form.product_type) errs.product_type = 'Product type is required';
    if (imageUrls.length === 0) errs.images = 'At least one product image is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) { notify('Please complete all required fields.', 'error'); return; }
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const safeThumb = Math.min(thumbnailIndex, Math.max(0, imageUrls.length - 1));
    const { whats_included, category_id, ...rest } = form;
    const productData = {
      ...rest,
      slug,
      category_id: category_id || null,
      video_url: videoUrl || null,
      thumbnail_index: safeThumb,
      price: form.price ? parseFloat(form.price) : null,
      is_active: publish ? true : form.is_active,
      occasions: form.occasions,
      colors: form.colors,
      embroidery: form.embroidery,
      includes: whats_included,
      customisation_options: form.customisation_options,
      accessories: form.accessories,
      hand_work_details: form.hand_work_details,
      highlights: form.highlights,
      care_instructions: form.care_instructions || null,
      website_placement: form.website_placement,
      visibility: form.visibility,
      priority: form.priority,
      related_product_ids: form.related_product_ids,
    };

    try {
      let productId = id;
      if (isEdit && id) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
        await logActivity('product_updated', `Updated product: ${form.title}`, 'product', id);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select('id').maybeSingle();
        if (error) throw error;
        productId = data?.id;
        await logActivity('product_added', `Added product: ${form.title}`, 'product', productId);
      }

      if (productId && imageUrls.length > 0) {
        if (isEdit) await supabase.from('product_images').delete().eq('product_id', productId);
        const imgInserts = imageUrls.map((url, i) => ({
          product_id: productId,
          url,
          alt: form.image_alt_text || form.title,
          sort_order: i,
          view_type: i === safeThumb ? 'hero' : 'gallery',
        }));
        await supabase.from('product_images').insert(imgInserts);
      }

      notify(publish ? 'Product published successfully.' : 'Product saved as draft.');
      navigate('/admin/products');
    } catch (err) {
      notify('Failed to save product. Please try again.', 'error');
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
  const showHandWorkDetails = form.work_type === 'Hand Work' || form.work_type === 'Mix Work';

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
          {isEdit && (
            <button onClick={handleDuplicate} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200">
              <Copy size={14} /> Duplicate
            </button>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
          </button>
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

              <div className="mt-3 flex gap-2">
                <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="input-luxury flex-1" placeholder="Or paste an image URL..." />
                <button
                  onClick={() => { if (newImageUrl.trim()) { setImageUrls((prev) => [...prev, newImageUrl.trim()]); setNewImageUrl(''); } }}
                  className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
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
                      <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
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
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => videoInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); videoInputRef.current?.click(); } }}
                  onDragOver={(e) => { e.preventDefault(); setVideoDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setVideoDragActive(false); }}
                  onDrop={(e) => { e.preventDefault(); setVideoDragActive(false); handleVideoUpload(e.dataTransfer.files); }}
                  className={`cursor-pointer rounded-luxury border-2 border-dashed p-6 text-center transition-colors ${videoDragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300 hover:bg-ivory-50'}`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => { if (e.target.files) handleVideoUpload(e.target.files); e.target.value = ''; }}
                    className="hidden"
                  />
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                    <Video size={20} strokeWidth={1.5} className={uploadingVideo ? 'animate-pulse' : ''} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-navy-900">{uploadingVideo ? 'Uploading video...' : 'Drag & drop or click to upload a video'}</p>
                  <p className="mt-1 text-xs font-light text-charcoal-400">One optional showcase video</p>
                </div>
              </Field>

              {videoUrl && (
                <div className="mt-3 flex items-center gap-3 rounded-luxury border border-navy-50 bg-ivory-50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-luxury bg-navy-900 text-ivory-100">
                    <Video size={16} />
                  </div>
                  <span className="flex-1 truncate text-xs font-light text-charcoal-600">{videoUrl}</span>
                  <button
                    onClick={() => setVideoUrl('')}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                    aria-label="Remove video"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — PRODUCT INFORMATION */}
        {activeStep === 'info' && (
          <div className="space-y-7">
            <StepHeader step={2} title="Product Information" subtitle="Core details that identify this couture piece." />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Product Name *" error={errors.title}>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="input-luxury" placeholder="e.g. Royal Zardozi Bridal Lehenga" />
              </Field>
              <Field label="Design Number (Unique) *" error={errors.code}>
                <input type="text" value={form.code} onChange={(e) => update('code', e.target.value)} className="input-luxury" placeholder="e.g. LC-2045" />
              </Field>
            </div>

            <div>
              <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Product Type * {errors.product_type && <span className="ml-1 text-red-500 normal-case tracking-normal">— {errors.product_type}</span>}</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {productTypeOptions.map((t) => (
                  <SelectCard
                    key={t}
                    label={t}
                    selected={form.product_type === t}
                    onClick={() => update('product_type', t)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Price Type">
                <select value={form.price_type} onChange={(e) => update('price_type', e.target.value)} className="input-luxury appearance-none">
                  {priceTypes.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              {form.price_type !== 'price_on_request' && (
                <Field label="Price (₹)">
                  <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="input-luxury" placeholder="0" />
                </Field>
              )}
              <Field label="Availability">
                <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input-luxury appearance-none">
                  {availabilityOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={form.category_id}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    update('category_id', e.target.value);
                    if (cat) update('category_slug', cat.slug);
                  }}
                  className="input-luxury appearance-none"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Short Summary">
              <textarea rows={2} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="input-luxury resize-none" placeholder="A brief one-line summary for product cards..." />
            </Field>
          </div>
        )}

        {/* STEP 3 — DETAILS */}
        {activeStep === 'details' && (
          <div className="space-y-7">
            <StepHeader step={3} title="Product Details" subtitle="Rich descriptions, highlights, inclusions, and care guidance." />

            <Field label="Short Description">
              <textarea rows={2} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="input-luxury resize-none" placeholder="A concise one-line summary shown on product cards..." />
            </Field>

            <Field label="Detailed Description">
              <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="input-luxury resize-none" placeholder="Full narrative description of the outfit, its inspiration, and craftsmanship..." />
            </Field>

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
                  No highlights added yet. Click “Add highlight” to begin.
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

            <Field label="Care Instructions">
              <textarea rows={4} value={form.care_instructions} onChange={(e) => update('care_instructions', e.target.value)} className="input-luxury resize-none" placeholder="Dry clean only. Store in a cool, dry place away from direct sunlight..." />
            </Field>
          </div>
        )}

        {/* STEP 4 — OCCASION */}
        {activeStep === 'occasion' && (
          <div className="space-y-7">
            <StepHeader step={4} title="Occasion" subtitle="Select one or more occasions this piece is suited for." />

            <div className="grid gap-3 sm:grid-cols-3">
              {occasionCategoryOptions.map((o) => (
                <SelectCard
                  key={o.value}
                  label={o.label}
                  selected={form.occasions.includes(o.value)}
                  onClick={() => toggleArray('occasions', o.value)}
                  multi
                />
              ))}
            </div>

            {form.occasions.length > 0 && (
              <div className="rounded-luxury border border-gold-100 bg-gold-50/50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-gold-800">Selected occasions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.occasions.map((o) => (
                    <span key={o} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-soft">
                      {o}
                      <button onClick={() => toggleArray('occasions', o)} className="text-charcoal-400 hover:text-red-500" aria-label={`Remove ${o}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — ACCESSORIES */}
        {activeStep === 'accessories' && (
          <div className="space-y-7">
            <StepHeader step={5} title="Accessories" subtitle="Optional add-ons included with this piece. Select all that apply." />

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {accessoryOptions.map((a) => (
                <SelectCard
                  key={a}
                  label={a}
                  selected={form.accessories.includes(a)}
                  onClick={() => toggleArray('accessories', a)}
                  multi
                />
              ))}
            </div>

            {form.accessories.length > 0 && (
              <div className="rounded-luxury border border-navy-50 bg-ivory-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-charcoal-600">Included accessories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.accessories.map((a) => (
                    <span key={a} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-soft">
                      {a}
                      <button onClick={() => toggleArray('accessories', a)} className="text-charcoal-400 hover:text-red-500" aria-label={`Remove ${a}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 — COLOURS & FABRICS */}
        {activeStep === 'colours' && (
          <div className="space-y-7">
            <StepHeader step={6} title="Colours & Fabrics" subtitle="Specify the colour and fabric for each component of the outfit." />

            {/* Main outfit */}
            <div className="rounded-luxury-lg border border-navy-50 bg-ivory-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Shirt size={16} className="text-gold-600" />
                <h3 className="text-sm font-serif font-medium text-navy-900">Main Outfit</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Colour">
                  <ColorSelect value={form.color_main} onChange={(v) => update('color_main', v)} />
                </Field>
                <Field label="Fabric">
                  <select value={form.fabric_main} onChange={(e) => update('fabric_main', e.target.value)} className="input-luxury appearance-none">
                    <option value="">Select fabric</option>
                    {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Dupatta 1 */}
            <div className="rounded-luxury-lg border border-navy-50 bg-ivory-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers size={16} className="text-gold-600" />
                <h3 className="text-sm font-serif font-medium text-navy-900">Dupatta 1</h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Colour">
                  <ColorSelect value={form.color_dupatta1} onChange={(v) => update('color_dupatta1', v)} />
                </Field>
                <Field label="Fabric">
                  <select value={form.fabric_dupatta1} onChange={(e) => update('fabric_dupatta1', e.target.value)} className="input-luxury appearance-none">
                    <option value="">Select fabric</option>
                    {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
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
                  <Field label="Colour">
                    <ColorSelect value={form.color_dupatta2} onChange={(v) => update('color_dupatta2', v)} />
                  </Field>
                  <Field label="Fabric">
                    <select value={form.fabric_dupatta2} onChange={(e) => update('fabric_dupatta2', e.target.value)} className="input-luxury appearance-none">
                      <option value="">Select fabric</option>
                      {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {!showDupatta2 && (
              <p className="rounded-luxury border border-dashed border-navy-100 bg-ivory-50 px-4 py-3 text-center text-xs font-light text-charcoal-400">
                Select “Second Dupatta” in the Accessories step to add Dupatta 2 details.
              </p>
            )}
          </div>
        )}

        {/* STEP 6 — WORK */}
        {activeStep === 'work' && (
          <div className="space-y-7">
            <StepHeader step={7} title="Work" subtitle="Choose the embroidery work type, details, and customisation level." />

            {/* Work type */}
            <div>
              <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Work Type</p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {workTypeOptions.map((w) => (
                  <SelectCard
                    key={w.value}
                    label={w.label}
                    selected={form.work_type === w.value}
                    onClick={() => {
                      update('work_type', w.value);
                      if (w.value === 'Machine Work') update('hand_work_details', []);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Hand work details — conditional */}
            {showHandWorkDetails && (
              <div className="animate-fade-in">
                <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Hand Work Details</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                  {handWorkDetailOptions.map((d) => (
                    <SelectCard
                      key={d}
                      label={d}
                      selected={form.hand_work_details.includes(d)}
                      onClick={() => toggleArray('hand_work_details', d)}
                      multi
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Customisation level */}
            <div>
              <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Customisation</p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {customisationLevelOptions.map((c) => (
                  <SelectCard
                    key={c.value}
                    label={c.label}
                    selected={form.customisation_level === c.value}
                    onClick={() => {
                      update('customisation_level', c.value);
                      update('customisable', c.value !== 'Not Customisable');
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Additional flags */}
            <div className="border-t border-navy-50 pt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.12em] text-charcoal-600">Product Flags</p>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { key: 'is_featured', label: 'Featured', desc: 'Show in featured sections' },
                  { key: 'is_new', label: 'New Arrival', desc: 'Mark as new arrival' },
                  { key: 'is_best_seller', label: 'Best Seller', desc: 'Mark as best seller' },
                  { key: 'is_active', label: 'Active', desc: 'Visible on website' },
                ].map((flag) => (
                  <label key={flag.key} className="flex cursor-pointer items-start gap-2.5 rounded-luxury border border-navy-50 bg-ivory-50 p-3.5 transition-colors hover:bg-ivory-100">
                    <input
                      type="checkbox"
                      checked={form[flag.key as keyof typeof form] as boolean}
                      onChange={(e) => update(flag.key, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-navy-200 text-gold-500 focus:ring-gold-400"
                    />
                    <div>
                      <p className="text-xs font-medium text-navy-900">{flag.label}</p>
                      <p className="text-[11px] font-light text-charcoal-500">{flag.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8 — PLACEMENT & VISIBILITY */}
        {activeStep === 'placement' && (
          <div className="space-y-7">
            <StepHeader step={8} title="Placement & Visibility" subtitle="Control where this product appears and its merchandising priority." />

            <div>
              <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Website Placement (Multi Select)</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-3">
                {websitePlacementOptions.map((p) => (
                  <SelectCard
                    key={p}
                    label={p}
                    selected={form.website_placement.includes(p)}
                    onClick={() => toggleArray('website_placement', p)}
                    multi
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Visibility</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {visibilityOptions.map((v) => (
                    <SelectCard
                      key={v.value}
                      label={v.label}
                      selected={form.visibility === v.value}
                      onClick={() => update('visibility', v.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Product Priority</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {priorityOptions.map((p) => (
                    <SelectCard
                      key={p.value}
                      label={p.label}
                      selected={form.priority === p.value}
                      onClick={() => update('priority', p.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {form.website_placement.length > 0 && (
              <div className="rounded-luxury border border-gold-100 bg-gold-50/50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-gold-800">Selected placements</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.website_placement.map((p) => (
                    <span key={p} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-soft">
                      {p}
                      <button onClick={() => toggleArray('website_placement', p)} className="text-charcoal-400 hover:text-red-500" aria-label={`Remove ${p}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 9 — RELATED PRODUCTS */}
        {activeStep === 'related' && (
          <div className="space-y-7">
            <StepHeader step={9} title="Related Products" subtitle="Link complementary pieces by searching Product Name or Design Number." />

            <RelatedProductPicker
              selectedIds={form.related_product_ids}
              onChange={(ids) => update('related_product_ids', ids)}
              excludeId={id}
            />
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
            onClick={() => handleSave(true)}
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

function SelectCard({
  label,
  selected,
  onClick,
  multi = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 rounded-luxury border px-3 py-3 text-center text-xs font-medium transition-all ${
        selected
          ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-gold'
          : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300 hover:bg-ivory-50'
      }`}
    >
      {multi && (
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
          selected ? 'border-gold-500 bg-gold-500 text-navy-900' : 'border-navy-200 bg-white'
        }`}>
          {selected && <Check size={11} strokeWidth={3} />}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}

function ColorSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2.5">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-luxury appearance-none">
        <option value="">Select colour</option>
        {colorSwatches.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
      <div className="flex flex-wrap gap-1.5">
        {colorSwatches.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onChange(c.name)}
            aria-label={c.name}
            title={c.name}
            className={`h-7 w-7 rounded-full border-2 transition-all ${
              value === c.name ? 'border-gold-500 scale-110 shadow-soft' : 'border-navy-100 hover:scale-105'
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
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
