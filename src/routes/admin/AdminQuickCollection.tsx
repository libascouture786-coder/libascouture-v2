import { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Loader2, ChevronDown, ChevronUp, Trash2,
  GripVertical, Save, Eye, Plus, Image as ImageIcon,
  Check, AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity, insertCollection, setCollectionProducts } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import {
  fabricOptions, colorSwatches,
} from '@/config/customisation';

/* ── Option sets (reuse existing config) ─────────────────────────── */
const occasionOptions = ['Wedding', 'Engagement', 'Other Functions'] as const;

const productTypeOptions = [
  'Bridal Lehenga', 'Reception', 'Engagement', 'Nikah', 'Walima',
  'Mehendi', 'Haldi', 'Sangeet', 'Saree', 'Suit', 'Sharara',
  'Gharara', 'Anarkali', 'Indo Western',
] as const;

const accessoryOptions = [
  'Potli', 'Tassels (Latkan)', 'Extra Belt', 'Second Dupatta',
  'Veil Dupatta', 'Cape', 'Jacket', 'Can Can',
] as const;

const workTypeOptions = ['Hand Work', 'Machine Work', 'Mix Work'] as const;

const customisationLevelOptions = [
  'Fully Customisable', 'Partially Customisable', 'Not Customisable',
] as const;

const componentOptions = [
  'Lehenga', 'Choli / Blouse', 'Dupatta', 'Second Dupatta',
  'Veil', 'Cape', 'Jacket', 'Belt',
] as const;

const customisationOptionList = [
  'Colour Change', 'Fabric Change', 'Blouse', 'Sleeves', 'Neckline',
  'Double Dupatta', 'Veil', 'Trail', 'Potli', 'Heavy Embroidery',
  'Light Embroidery', 'Other Requests',
] as const;

/* ── Types ────────────────────────────────────────────────────────── */
type QuickProduct = {
  id: string;
  imageUrl: string;
  name: string;
  code: string;
  color: string;
  // optional — only used when "More Details" expanded
  expanded: boolean;
  fabric_main: string;
  work_type: string;
  product_type: string;
  components: string[];
  accessories: string[];
  customisation_options: string[];
  customisation_level: string;
  description: string;
  seo_title: string;
  seo_description: string;
};

type CollectionForm = {
  name: string;
  slug: string;
  banner_image: string;
  occasion: string;
  description: string;
};

const emptyCollection: CollectionForm = {
  name: '', slug: '', banner_image: '', occasion: 'Wedding', description: '',
};

function makeProduct(imageUrl: string): QuickProduct {
  return {
    id: crypto.randomUUID(),
    imageUrl,
    name: '',
    code: '',
    color: '',
    expanded: false,
    fabric_main: '',
    work_type: 'Hand Work',
    product_type: '',
    components: [],
    accessories: [],
    customisation_options: [],
    customisation_level: 'Fully Customisable',
    description: '',
    seo_title: '',
    seo_description: '',
  };
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  /* ── Image upload (10–50 at once) ──────────────────────────────── */
  const handleImageUpload = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      const newProducts = uploaded.map((url) => makeProduct(url));
      setProducts((prev) => [...prev, ...newProducts]);
      notify(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded — ${newProducts.length} product card${newProducts.length > 1 ? 's' : ''} created.`, 'success');
    } catch {
      notify('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  }, [products.length, notify]);

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

  /* ── Product card operations ───────────────────────────────────── */
  const updateProduct = useCallback((id: string, patch: Partial<QuickProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p)));
  }, []);

  const moveProduct = useCallback((id: string, direction: 'up' | 'down') => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  const toggleArray = useCallback((id: string, field: keyof QuickProduct, value: string) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    }));
  }, []);

  /* ── Validation ────────────────────────────────────────────────── */
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!collection.name.trim()) errs.collectionName = 'Collection name is required';
    if (products.length === 0) errs.products = 'Upload at least one product image';
    products.forEach((p, i) => {
      if (!p.name.trim()) errs[`name-${p.id}`] = `Product ${i + 1}: Name required`;
      if (!p.code.trim()) errs[`code-${p.id}`] = `Product ${i + 1}: Design number required`;
    });
    return errs;
  }, [collection.name, products]);

  const isValid = Object.keys(validationErrors).length === 0;

  /* ─� Counts ─────────────────────────────────────────────────────── */
  const completedCount = products.filter((p) => p.name.trim() && p.code.trim()).length;
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

      // 1. Create the collection
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

      // 2. Create each product individually
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

        // Insert product image
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

      // 3. Link all products to the collection
      await setCollectionProducts(collectionId, createdProductIds);

      // 4. Set cover product to first product
      if (createdProductIds.length > 0) {
        await supabase.from('collections').update({ cover_product_id: createdProductIds[0] }).eq('id', collectionId);
      }

      await logActivity('collection_created', `Quick-created collection "${collection.name}" with ${createdProductIds.length} products`, 'collection', collectionId);

      notify(publish
        ? `Collection published with ${createdProductIds.length} products.`
        : `Collection saved as draft with ${createdProductIds.length} products.`, 'success');
      navigate('/admin/collections');
    } catch (err) {
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
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-ivory-100">2</span>
            <h2 className="text-lg font-serif font-medium text-navy-900">Quick Product Upload</h2>
          </div>
          {products.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-green-600">
                <Check size={13} /> {completedCount} Ready
              </span>
              {remainingCount > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-gold-700">
                  <AlertCircle size={13} /> {remainingCount} Need info
                </span>
              )}
              <span className="font-light text-charcoal-400">{products.length} total</span>
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

        {/* Product cards grid */}
        {products.length > 0 && (
          <div className="space-y-3">
            {products.map((p, i) => (
              <QuickProductCard
                key={p.id}
                product={p}
                index={i}
                total={products.length}
                errors={validationErrors}
                onUpdate={updateProduct}
                onRemove={removeProduct}
                onToggleExpand={toggleExpand}
                onMove={moveProduct}
                onToggleArray={toggleArray}
              />
            ))}

            {/* Add more images button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-luxury border-2 border-dashed border-navy-100 py-4 text-sm font-medium text-charcoal-500 transition-colors hover:border-gold-300 hover:bg-ivory-50 hover:text-navy-900"
            >
              <Plus size={16} /> Upload more images
            </button>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

/* ── Quick Product Card ───────────────────────────────────────────── */

function QuickProductCard({
  product,
  index,
  total,
  errors,
  onUpdate,
  onRemove,
  onToggleExpand,
  onMove,
  onToggleArray,
}: {
  product: QuickProduct;
  index: number;
  total: number;
  errors: Record<string, string>;
  onUpdate: (id: string, patch: Partial<QuickProduct>) => void;
  onRemove: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onToggleArray: (id: string, field: keyof QuickProduct, value: string) => void;
}) {
  const nameErr = errors[`name-${product.id}`];
  const codeErr = errors[`code-${product.id}`];
  const isReady = product.name.trim() && product.code.trim();

  return (
    <div className={`rounded-luxury border bg-white transition-all ${isReady ? 'border-green-200' : 'border-gold-200'}`}>
      {/* Card header — always visible */}
      <div className="flex items-start gap-4 p-4">
        {/* Reorder handle */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => onMove(product.id, 'up')}
            disabled={index === 0}
            className="text-charcoal-300 transition-colors hover:text-navy-900 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <GripVertical size={14} className="text-charcoal-200" />
          <button
            onClick={() => onMove(product.id, 'down')}
            disabled={index === total - 1}
            className="text-charcoal-300 transition-colors hover:text-navy-900 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Product image */}
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-luxury bg-navy-50">
          <img src={product.imageUrl} alt={product.name || `Product ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
        </div>

        {/* Required fields */}
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Product Name *</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => onUpdate(product.id, { name: e.target.value })}
              className="input-luxury !py-2 text-sm"
              placeholder="e.g. Crimson Zardozi Lehenga"
            />
            {nameErr && <p className="mt-0.5 text-[10px] text-red-500">{nameErr}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Design Number *</label>
            <input
              type="text"
              value={product.code}
              onChange={(e) => onUpdate(product.id, { code: e.target.value })}
              className="input-luxury !py-2 text-sm"
              placeholder="e.g. LC-BL-001"
            />
            {codeErr && <p className="mt-0.5 text-[10px] text-red-500">{codeErr}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Colour</label>
            <select
              value={product.color}
              onChange={(e) => onUpdate(product.id, { color: e.target.value })}
              className="input-luxury !py-2 text-sm appearance-none"
            >
              <option value="">Select colour</option>
              {colorSwatches.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleExpand(product.id)}
            className="flex items-center gap-1 rounded-luxury px-2.5 py-1.5 text-[11px] font-medium text-charcoal-600 transition-colors hover:bg-ivory-200"
          >
            {product.expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            More Details
          </button>
          <button
            onClick={() => onRemove(product.id)}
            className="flex h-8 w-8 items-center justify-center rounded-luxury text-red-500 transition-colors hover:bg-red-50"
            aria-label="Remove product"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expanded — optional fields */}
      {product.expanded && (
        <div className="border-t border-navy-50 bg-ivory-50/50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Fabric */}
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Fabric</label>
              <select
                value={product.fabric_main}
                onChange={(e) => onUpdate(product.id, { fabric_main: e.target.value })}
                className="input-luxury !py-2 text-sm appearance-none"
              >
                <option value="">Select fabric</option>
                {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Work</label>
              <select
                value={product.work_type}
                onChange={(e) => onUpdate(product.id, { work_type: e.target.value })}
                className="input-luxury !py-2 text-sm appearance-none"
              >
                {workTypeOptions.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {/* Product Type */}
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Product Type</label>
              <select
                value={product.product_type}
                onChange={(e) => onUpdate(product.id, { product_type: e.target.value })}
                className="input-luxury !py-2 text-sm appearance-none"
              >
                <option value="">Select type</option>
                {productTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Customisation Level */}
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Customisation</label>
              <select
                value={product.customisation_level}
                onChange={(e) => onUpdate(product.id, { customisation_level: e.target.value })}
                className="input-luxury !py-2 text-sm appearance-none"
              >
                {customisationLevelOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">Description</label>
              <textarea
                rows={2}
                value={product.description}
                onChange={(e) => onUpdate(product.id, { description: e.target.value })}
                className="input-luxury resize-none text-sm"
                placeholder="Optional product description..."
              />
            </div>

            {/* Components */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-charcoal-500">Components</label>
              <div className="flex flex-wrap gap-1.5">
                {componentOptions.map((c) => (
                  <Chip key={c} label={c} selected={product.components.includes(c)} onClick={() => onToggleArray(product.id, 'components', c)} />
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-charcoal-500">Accessories</label>
              <div className="flex flex-wrap gap-1.5">
                {accessoryOptions.map((a) => (
                  <Chip key={a} label={a} selected={product.accessories.includes(a)} onClick={() => onToggleArray(product.id, 'accessories', a)} />
                ))}
              </div>
            </div>

            {/* Customisation Options */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-[10px] uppercase tracking-wide text-charcoal-500">Customisation Options</label>
              <div className="flex flex-wrap gap-1.5">
                {customisationOptionList.map((c) => (
                  <Chip key={c} label={c} selected={product.customisation_options.includes(c)} onClick={() => onToggleArray(product.id, 'customisation_options', c)} />
                ))}
              </div>
            </div>

            {/* SEO */}
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">SEO Title</label>
              <input
                type="text"
                value={product.seo_title}
                onChange={(e) => onUpdate(product.id, { seo_title: e.target.value })}
                className="input-luxury !py-2 text-sm"
                placeholder="Optional SEO title..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-charcoal-500">SEO Description</label>
              <input
                type="text"
                value={product.seo_description}
                onChange={(e) => onUpdate(product.id, { seo_description: e.target.value })}
                className="input-luxury !py-2 text-sm"
                placeholder="Optional SEO description..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Chip toggle button ───────────────────────────────────────────── */
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        selected
          ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-soft'
          : 'border-navy-50 bg-white text-charcoal-500 hover:border-gold-300 hover:bg-ivory-50'
      }`}
    >
      {selected && <Check size={11} className="mr-1 inline" />}
      {label}
    </button>
  );
}
