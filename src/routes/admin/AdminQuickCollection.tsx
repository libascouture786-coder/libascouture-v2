import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Loader2, Save, Eye, Plus, Image as ImageIcon,
  Check, AlertCircle, Layers, Sparkles, CopyCheck,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity, insertCollection, setCollectionProducts } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import { fabricOptions } from '@/config/customisation';
import { QuickProductCard } from './QuickProductCard';
import {
  type QuickProduct, type CollectionForm, emptyCollection,
  occasionOptions, productTypeOptions, accessoryOptions, workTypeOptions,
  customisationLevelOptions, componentOptions, customisationOptionList,
  makeProduct,
} from './quick-collection-types';

const AUTOSAVE_KEY = 'quick-collection-draft';
const AUTOSAVE_INTERVAL = 5000;

type AutosaveState = {
  collection: CollectionForm;
  products: QuickProduct[];
  savedAt: number;
};

function loadDraft(): AutosaveState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AutosaveState;
    if (!parsed.products || parsed.products.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(collection: CollectionForm, products: QuickProduct[]) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ collection, products, savedAt: Date.now() }));
  } catch {
    /* storage full or unavailable */
  }
}

function clearDraft() {
  localStorage.removeItem(AUTOSAVE_KEY);
}

export function AdminQuickCollection() {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [collection, setCollection] = useState<CollectionForm>(emptyCollection);
  const [products, setProducts] = useState<QuickProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerDragActive, setBannerDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ done: 0, total: 0 });
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [restored, setRestored] = useState(false);
  const [applyAllExpanded, setApplyAllExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const dragIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  /* ── Restore draft on mount ─────────────────────────────────────── */
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setCollection(draft.collection);
      setProducts(draft.products.map((p) => ({ ...p, expanded: false })));
      setRestored(true);
    }
  }, []);

  /* ── Autosave ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (products.length === 0 && !collection.name) return;
    setAutosaveStatus('saving');
    const t = setTimeout(() => {
      saveDraft(collection, products);
      setAutosaveStatus('saved');
    }, AUTOSAVE_INTERVAL);
    return () => clearTimeout(t);
  }, [collection, products]);

  /* ── Image upload (parallel for speed) ──────────────────────────── */
  const handleImageUpload = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        return pub.publicUrl;
      });
      const uploaded = await Promise.all(uploadPromises);
      const newProducts = uploaded.map((url) => makeProduct(url));
      setProducts((prev) => {
        const next = [...prev, ...newProducts];
        return next.map((p, i) => {
          if (p.code || p.name) return p;
          return {
            ...p,
            code: `LC-${String(i + 1).padStart(3, '0')}`,
            name: `Design ${i + 1}`,
          };
        });
      });
      notify(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded.`, 'success');
    } catch {
      notify('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  }, [notify]);

  /* ── Banner upload ─────────────────────────────────────────────── */
  const handleBannerUpload = useCallback(async (files: FileList) => {
    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    setBannerUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      setCollection((prev) => ({ ...prev, banner_image: pub.publicUrl }));
      notify('Banner image uploaded.', 'success');
    } catch {
      notify('Failed to upload banner image.', 'error');
    } finally {
      setBannerUploading(false);
    }
  }, [notify]);

  /* ── Replace image ──────────────────────────────────────────────── */
  const handleReplaceImage = useCallback(async (id: string, file: File) => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) { notify('Failed to replace image.', 'error'); return; }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, imageUrl: pub.publicUrl } : p)));
  }, [notify]);

  /* ── Product card operations ───────────────────────────────────── */
  const updateProduct = useCallback((id: string, patch: Partial<QuickProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const duplicateProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const copy: QuickProduct = {
        ...prev[idx],
        id: crypto.randomUUID(),
        name: `${prev[idx].name} (Copy)`,
        code: '',
        expanded: false,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p)));
  }, []);

  const toggleArray = useCallback((id: string, field: keyof QuickProduct, value: string) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    }));
  }, []);

  /* ── Drag & drop sorting ────────────────────────────────────────── */
  const handleDragStart = useCallback((id: string) => { dragIdRef.current = id; }, []);
  const handleDragEnter = useCallback((id: string) => { setDragOverId(id); }, []);
  const handleDragEnd = useCallback(() => {
    const dragId = dragIdRef.current;
    const overId = dragOverId;
    dragIdRef.current = null;
    setDragOverId(null);
    if (!dragId || !overId || dragId === overId) return;
    setProducts((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === dragId);
      const toIdx = prev.findIndex((p) => p.id === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, [dragOverId]);

  /* ── Apply to all ───────────────────────────────────────────────── */
  const [applyAll, setApplyAll] = useState({
    fabric_main: '', work_type: '', product_type: '',
    components: [] as string[], accessories: [] as string[],
    customisation_options: [] as string[], customisation_level: '',
    description: '', seo_title: '', seo_description: '',
  });

  const toggleApplyArray = (field: 'components' | 'accessories' | 'customisation_options', value: string) => {
    setApplyAll((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const applyToAll = () => {
    const patch: Partial<QuickProduct> = {};
    if (applyAll.fabric_main) patch.fabric_main = applyAll.fabric_main;
    if (applyAll.work_type) patch.work_type = applyAll.work_type;
    if (applyAll.product_type) patch.product_type = applyAll.product_type;
    if (applyAll.customisation_level) patch.customisation_level = applyAll.customisation_level;
    if (applyAll.description) patch.description = applyAll.description;
    if (applyAll.seo_title) patch.seo_title = applyAll.seo_title;
    if (applyAll.seo_description) patch.seo_description = applyAll.seo_description;
    if (applyAll.components.length > 0) patch.components = applyAll.components;
    if (applyAll.accessories.length > 0) patch.accessories = applyAll.accessories;
    if (applyAll.customisation_options.length > 0) patch.customisation_options = applyAll.customisation_options;

    if (Object.keys(patch).length === 0) {
      notify('Select at least one field to apply.', 'error');
      return;
    }
    setProducts((prev) => prev.map((p) => ({ ...p, ...patch })));
    notify(`Applied to all ${products.length} products.`, 'success');
  };

  /* ── Validation ────────────────────────────────────────────────── */
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!collection.name.trim()) errs.collectionName = 'Collection name is required';
    if (products.length === 0) errs.products = 'Upload at least one product image';
    products.forEach((p) => {
      if (!p.name.trim()) errs[`name-${p.id}`] = 'Name required';
      if (!p.code.trim()) errs[`code-${p.id}`] = 'Design number required';
    });
    return errs;
  }, [collection.name, products]);

  const isValid = Object.keys(validationErrors).length === 0;

  /* ── Counts ─────────────────────────────────────────────────────── */
  const completedCount = useMemo(() => products.filter((p) => p.name.trim() && p.code.trim()).length, [products]);
  const remainingCount = products.length - completedCount;

  /* ── Save: create collection + every product individually ──────── */
  const handleSave = async (publish: boolean) => {
    if (!isValid) {
      notify('Please complete all required fields (Name, Design Number for every product).', 'error');
      return;
    }
    setSaving(true);
    setSaveProgress({ done: 0, total: products.length });
    try {
      const slug = collection.slug || collection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const col = await insertCollection({
        name: collection.name.trim(),
        slug,
        description: collection.description.trim() || null,
        banner_image: collection.banner_image || null,
        collection_type: collection.occasion || null,
        cover_product_id: null,
      });
      if (!col) throw new Error('Failed to create collection');
      const collectionId = col.id;

      const createdProductIds: string[] = [];
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const productSlug = (p.name.trim() || `design-${Date.now()}-${i}`)
          .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const productData = {
          slug: `${productSlug}-${i + 1}`,
          title: p.name.trim(),
          code: p.code.trim(),
          excerpt: '',
          description: p.description.trim() || null,
          category_id: null,
          category_slug: 'bridal',
          price: null,
          price_on_request: true,
          price_type: 'price_on_request',
          status: publish ? 'made_on_order' : 'signature',
          work_type: p.work_type || 'handwork',
          product_type: p.product_type || null,
          occasion: collection.occasion,
          occasions: [collection.occasion],
          colors: p.color ? [p.color] : [],
          color: p.color || null,
          color_main: p.color || null,
          fabric_main: p.fabric_main || null,
          fabric: p.fabric_main || null,
          embroidery: [],
          includes: p.components,
          accessories: p.accessories,
          hand_work_details: [],
          customisation_options: p.customisation_options,
          customisation_level: p.customisation_level || 'Fully Customisable',
          customisable: p.customisation_level !== 'Not Customisable',
          highlights: [],
          care_instructions: null,
          website_placement: [],
          visibility: 'website',
          priority: 'Medium',
          related_product_ids: [],
          image_keys: [],
          is_active: publish,
          is_featured: false,
          is_new: true,
          is_best_seller: false,
          sort_order: i,
          thumbnail_index: 0,
          video_url: null,
          seo_title: p.seo_title.trim() || null,
          seo_description: p.seo_description.trim() || null,
          image_alt_text: p.name.trim(),
        };

        const { data: newProd, error: prodErr } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .maybeSingle();
        if (prodErr) throw prodErr;
        const productId = newProd?.id;
        if (!productId) throw new Error(`Failed to create product ${i + 1}`);

        const { error: imgErr } = await supabase.from('product_images').insert({
          product_id: productId,
          url: p.imageUrl,
          alt: p.name.trim(),
          sort_order: 0,
          view_type: 'hero',
        });
        if (imgErr) throw imgErr;

        createdProductIds.push(productId);
        setSaveProgress({ done: i + 1, total: products.length });
      }

      await setCollectionProducts(collectionId, createdProductIds);

      if (createdProductIds.length > 0) {
        await supabase.from('collections').update({ cover_product_id: createdProductIds[0] }).eq('id', collectionId);
      }

      await logActivity('collection_created', `Quick-created collection "${collection.name}" with ${createdProductIds.length} products`, 'collection', collectionId);

      clearDraft();
      notify(publish
        ? `Collection published with ${createdProductIds.length} products.`
        : `Collection saved as draft with ${createdProductIds.length} products.`, 'success');
      navigate('/admin/collections');
    } catch {
      notify('Failed to save collection. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/collections')} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-100 bg-white text-navy-900 transition-colors hover:bg-ivory-200">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-h2 font-serif font-medium text-navy-900">Quick Collection Entry</h1>
            <p className="mt-0.5 text-sm font-light text-charcoal-500">Upload dozens of products into one collection in minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {autosaveStatus === 'saved' && products.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-light text-green-600">
              <Check size={11} /> Auto-saved
            </span>
          )}
          {autosaveStatus === 'saving' && products.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-light text-charcoal-400">
              <Loader2 size={11} className="animate-spin" /> Saving...
            </span>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || products.length === 0}
            className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || products.length === 0}
            className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
          </button>
        </div>
      </div>

      {/* Restored banner */}
      {restored && products.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-luxury border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-xs text-blue-700">
          <span>Restored {products.length} product cards from your last session.</span>
          <button onClick={() => { clearDraft(); setProducts([]); setCollection(emptyCollection); setRestored(false); }} className="font-medium text-blue-800 hover:underline">Discard</button>
        </div>
      )}

      {/* Progress bar during save */}
      {saving && saveProgress.total > 0 && (
        <div className="mb-6 rounded-luxury border border-gold-100 bg-gold-50/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-gold-800">
            <span>Creating products...</span>
            <span>{saveProgress.done} / {saveProgress.total}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gold-100">
            <div className="h-full bg-gold-500 transition-all" style={{ width: `${(saveProgress.done / saveProgress.total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* STEP 1 — COLLECTION INFORMATION */}
      <section className="mb-6 rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-ivory-100">1</span>
          <h2 className="text-lg font-serif font-medium text-navy-900">Collection Information</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Collection Name *</label>
            <input
              type="text"
              value={collection.name}
              onChange={(e) => setCollection((prev) => ({
                ...prev,
                name: e.target.value,
                slug: prev.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              }))}
              className="input-luxury"
              placeholder="e.g. Royal Bridal 2025"
            />
            {validationErrors.collectionName && <p className="mt-1 text-xs text-red-500">{validationErrors.collectionName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Slug</label>
            <input
              type="text"
              value={collection.slug}
              onChange={(e) => setCollection((prev) => ({ ...prev, slug: e.target.value }))}
              className="input-luxury"
              placeholder="auto-generated from name"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Occasion *</label>
            <div className="grid grid-cols-3 gap-2">
              {occasionOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setCollection((prev) => ({ ...prev, occasion: o }))}
                  className={`rounded-luxury border px-3 py-2 text-xs font-medium transition-all ${
                    collection.occasion === o
                      ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-soft'
                      : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300 hover:bg-ivory-50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Banner Image</label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => bannerInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bannerInputRef.current?.click(); } }}
              onDragOver={(e) => { e.preventDefault(); setBannerDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setBannerDragActive(false); }}
              onDrop={(e) => { e.preventDefault(); setBannerDragActive(false); handleBannerUpload(e.dataTransfer.files); }}
              className={`cursor-pointer rounded-luxury border-2 border-dashed p-4 text-center transition-colors ${bannerDragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300 hover:bg-ivory-50'}`}
            >
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files) handleBannerUpload(e.target.files); e.target.value = ''; }} />
              {collection.banner_image ? (
                <div className="relative">
                  <img src={collection.banner_image} alt="Banner" className="mx-auto h-24 w-full rounded-luxury object-cover" />
                  <p className="mt-1.5 text-xs font-light text-charcoal-500">Click to replace</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-gold-500">
                    <ImageIcon size={18} strokeWidth={1.5} className={bannerUploading ? 'animate-pulse' : ''} />
                  </div>
                  <p className="mt-2 text-xs font-medium text-navy-900">{bannerUploading ? 'Uploading...' : 'Upload banner'}</p>
                </>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Description (optional)</label>
            <textarea
              rows={2}
              value={collection.description}
              onChange={(e) => setCollection((prev) => ({ ...prev, description: e.target.value }))}
              className="input-luxury resize-none"
              placeholder="A brief description of this collection..."
            />
          </div>
        </div>
      </section>

      {/* STEP 2 — QUICK PRODUCT UPLOAD */}
      <section className="rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-ivory-100">2</span>
            <h2 className="text-lg font-serif font-medium text-navy-900">Quick Product Upload</h2>
          </div>
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-navy-700">
                <Layers size={13} /> {products.length} Uploaded
              </span>
              <span className="flex items-center gap-1.5 font-medium text-green-600">
                <Check size={13} /> {completedCount} Completed
              </span>
              {remainingCount > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-gold-700">
                  <AlertCircle size={13} /> {remainingCount} Remaining
                </span>
              )}
            </div>
          )}
        </div>

        {/* Upload dropzone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleImageUpload(e.dataTransfer.files); }}
          className={`mb-6 cursor-pointer rounded-luxury border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300 hover:bg-ivory-50'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { if (e.target.files) handleImageUpload(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-500">
            <Upload size={22} strokeWidth={1.5} className={uploading ? 'animate-pulse' : ''} />
          </div>
          <p className="mt-3 text-sm font-medium text-navy-900">{uploading ? 'Uploading images...' : 'Drag & drop or click to upload'}</p>
          <p className="mt-1 text-xs font-light text-charcoal-400">Select 10–50 images at once — one product card is created per image</p>
        </div>

        {validationErrors.products && products.length === 0 && (
          <p className="mb-4 text-xs text-red-500">{validationErrors.products}</p>
        )}

        {/* Apply to All */}
        {products.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-luxury border border-gold-200 bg-gold-50/30">
            <button
              onClick={() => setApplyAllExpanded(!applyAllExpanded)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gold-50/50"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gold-900">
                <Sparkles size={15} /> Apply to All Products
              </span>
              <span className="text-xs font-light text-gold-700">
                {applyAllExpanded ? 'Collapse' : 'Expand'}
              </span>
            </button>
            {applyAllExpanded && (
              <div className="border-t border-gold-100 p-4">
                <p className="mb-3 text-xs font-light text-charcoal-500">Set values once and apply them to every product. Only non-empty fields are applied.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Fabric</label>
                    <select
                      value={applyAll.fabric_main}
                      onChange={(e) => setApplyAll((prev) => ({ ...prev, fabric_main: e.target.value }))}
                      className="input-luxury !py-2 text-sm appearance-none"
                    >
                      <option value="">Skip</option>
                      {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Work</label>
                    <select
                      value={applyAll.work_type}
                      onChange={(e) => setApplyAll((prev) => ({ ...prev, work_type: e.target.value }))}
                      className="input-luxury !py-2 text-sm appearance-none"
                    >
                      <option value="">Skip</option>
                      {workTypeOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Product Type</label>
                    <select
                      value={applyAll.product_type}
                      onChange={(e) => setApplyAll((prev) => ({ ...prev, product_type: e.target.value }))}
                      className="input-luxury !py-2 text-sm appearance-none"
                    >
                      <option value="">Skip</option>
                      {productTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Customisation</label>
                    <select
                      value={applyAll.customisation_level}
                      onChange={(e) => setApplyAll((prev) => ({ ...prev, customisation_level: e.target.value }))}
                      className="input-luxury !py-2 text-sm appearance-none"
                    >
                      <option value="">Skip</option>
                      {customisationLevelOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-3 grid gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Description</label>
                    <textarea
                      rows={2}
                      value={applyAll.description}
                      onChange={(e) => setApplyAll((prev) => ({ ...prev, description: e.target.value }))}
                      className="input-luxury resize-none text-sm"
                      placeholder="Leave empty to skip..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-charcoal-500">Components</label>
                    <div className="flex flex-wrap gap-1.5">
                      {componentOptions.map((c) => (
                        <button key={c} type="button" onClick={() => toggleApplyArray('components', c)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${applyAll.components.includes(c) ? 'border-gold-500 bg-gold-50 text-gold-900' : 'border-navy-50 bg-white text-charcoal-500 hover:border-gold-300'}`}>
                          {applyAll.components.includes(c) && <Check size={10} className="mr-0.5 inline" />}{c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-charcoal-500">Accessories</label>
                    <div className="flex flex-wrap gap-1.5">
                      {accessoryOptions.map((a) => (
                        <button key={a} type="button" onClick={() => toggleApplyArray('accessories', a)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${applyAll.accessories.includes(a) ? 'border-gold-500 bg-gold-50 text-gold-900' : 'border-navy-50 bg-white text-charcoal-500 hover:border-gold-300'}`}>
                          {applyAll.accessories.includes(a) && <Check size={10} className="mr-0.5 inline" />}{a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-charcoal-500">Customisation Options</label>
                    <div className="flex flex-wrap gap-1.5">
                      {customisationOptionList.map((c) => (
                        <button key={c} type="button" onClick={() => toggleApplyArray('customisation_options', c)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${applyAll.customisation_options.includes(c) ? 'border-gold-500 bg-gold-50 text-gold-900' : 'border-navy-50 bg-white text-charcoal-500 hover:border-gold-300'}`}>
                          {applyAll.customisation_options.includes(c) && <Check size={10} className="mr-0.5 inline" />}{c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">SEO Title</label>
                      <input type="text" value={applyAll.seo_title} onChange={(e) => setApplyAll((prev) => ({ ...prev, seo_title: e.target.value }))} className="input-luxury !py-2 text-sm" placeholder="Leave empty to skip..." />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">SEO Description</label>
                      <input type="text" value={applyAll.seo_description} onChange={(e) => setApplyAll((prev) => ({ ...prev, seo_description: e.target.value }))} className="input-luxury !py-2 text-sm" placeholder="Leave empty to skip..." />
                    </div>
                  </div>
                </div>

                <button
                  onClick={applyToAll}
                  className="mt-4 flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400"
                >
                  <CopyCheck size={14} /> Apply to All {products.length} Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product cards grid */}
        {products.length > 0 && (
          <>
            <p className="mb-3 text-xs font-light text-charcoal-400">Drag cards to reorder. Click any card for quick actions.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <QuickProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  nameErr={validationErrors[`name-${p.id}`]}
                  codeErr={validationErrors[`code-${p.id}`]}
                  isDragging={dragOverId === p.id}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onDuplicate={duplicateProduct}
                  onReplaceImage={handleReplaceImage}
                  onToggleExpand={toggleExpand}
                  onToggleArray={toggleArray}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>

            {/* Add more images button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-luxury border-2 border-dashed border-navy-100 py-4 text-sm font-medium text-charcoal-500 transition-colors hover:border-gold-300 hover:bg-ivory-50 hover:text-navy-900"
            >
              <Plus size={16} /> Upload more images
            </button>
          </>
        )}
      </section>
    </AdminLayout>
  );
}
