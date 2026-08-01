import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Loader2, Save, Plus, Check, Layers, AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import { QuickProductCard } from './QuickProductCard';
import {
  type QuickProduct, occasionOptions, makeProduct,
} from './quick-collection-types';

const AUTOSAVE_KEY = 'quick-collection-draft';
const AUTOSAVE_INTERVAL = 4000;

type AutosaveState = {
  occasions: string[];
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

function saveDraft(occasions: string[], products: QuickProduct[]) {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ occasions, products, savedAt: Date.now() }));
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

  const [occasions, setOccasions] = useState<string[]>([]);
  const [products, setProducts] = useState<QuickProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ done: 0, total: 0 });
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [restored, setRestored] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  /* ── Restore draft on mount ─────────────────────────────────────── */
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setOccasions(draft.occasions ?? []);
      setProducts(draft.products);
      setRestored(true);
    }
  }, []);

  /* ── Autosave ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (products.length === 0 && occasions.length === 0) return;
    setAutosaveStatus('saving');
    const t = setTimeout(() => {
      saveDraft(occasions, products);
      setAutosaveStatus('saved');
    }, AUTOSAVE_INTERVAL);
    return () => clearTimeout(t);
  }, [occasions, products]);

  /* ── Occasion toggle ────────────────────────────────────────────── */
  const toggleOccasion = (occasion: string) => {
    setOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((o) => o !== occasion)
        : [...prev, occasion]
    );
  };

  /* ── Image upload (parallel) ────────────────────────────────────── */
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
      setProducts((prev) => {
        const startIdx = prev.length;
        const newProducts = uploaded.map((url, i) => {
          const n = startIdx + i + 1;
          const code = `LC-${String(n).padStart(3, '0')}`;
          return makeProduct(url, code);
        });
        return [...prev, ...newProducts];
      });
      notify(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded.`, 'success');
    } catch {
      notify('Failed to upload images. Please try again.', 'error');
    } finally {
      setUploading(false);
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
        savedProductId: null,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
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

  /* ── Validation ─────────────────────────────────────────────────── */
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (occasions.length === 0) errs.occasions = 'Select at least one occasion';
    if (products.length === 0) errs.products = 'Upload at least one product image';
    const seenCodes = new Set<string>();
    products.forEach((p) => {
      if (!p.code.trim()) errs[`code-${p.id}`] = 'Required';
      else if (seenCodes.has(p.code.trim().toLowerCase())) errs[`code-${p.id}`] = 'Duplicate';
      else seenCodes.add(p.code.trim().toLowerCase());
    });
    return errs;
  }, [occasions, products]);

  const isValid = Object.keys(validationErrors).length === 0;

  /* ── Counts ─────────────────────────────────────────────────────── */
  const completedCount = useMemo(() => products.filter((p) => p.code.trim()).length, [products]);
  const remainingCount = products.length - completedCount;

  /* ── Save: create each product in the products table ────────────── */
  const handleSave = async (publish: boolean) => {
    if (!isValid) {
      notify('Please select at least one occasion and fill in design number for every product.', 'error');
      return;
    }
    setSaving(true);
    setSaveProgress({ done: 0, total: products.length });
    try {
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const title = p.name.trim() || p.code.trim();
        const productSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${i + 1}`;
        const priceVal = p.price.trim() ? parseFloat(p.price.trim()) : null;

        const productData = {
          slug: productSlug,
          title,
          code: p.code.trim(),
          excerpt: '',
          description: null,
          category_id: null,
          category_slug: 'bridal',
          price: priceVal,
          price_on_request: !priceVal,
          price_type: priceVal ? 'fixed' : 'price_on_request',
          status: publish ? 'made_on_order' : 'signature',
          work_type: p.work_type || 'Hand Work',
          occasion: occasions[0] ?? null,
          occasions,
          colors: p.color ? [p.color] : [],
          color: p.color || null,
          color_main: p.color || null,
          fabric: p.fabric || null,
          fabric_main: p.fabric || null,
          embroidery: [],
          includes: [],
          accessories: [],
          hand_work_details: [],
          customisation_options: [],
          customisation_level: 'Fully Customisable',
          customisable: true,
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
          seo_title: title,
          seo_description: null,
          image_alt_text: title,
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
          alt: title,
          sort_order: 0,
          view_type: 'hero',
        });
        if (imgErr) throw imgErr;

        setProducts((prev) => prev.map((item) =>
          item.id === p.id ? { ...item, savedProductId: productId } : item
        ));
        setSaveProgress({ done: i + 1, total: products.length });
      }

      await logActivity(
        'products_created',
        `Quick-created ${products.length} products for ${occasions.join(', ')}`,
        'product',
        undefined,
      );

      clearDraft();
      notify(
        publish
          ? `${products.length} products published.`
          : `${products.length} products saved as draft.`,
        'success',
      );
      navigate('/admin/products');
    } catch {
      notify('Failed to save products. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Add More Details: save product then open full form ─────────── */
  const handleAddMoreDetails = useCallback(async (id: string) => {
    const p = products.find((item) => item.id === id);
    if (!p) return;

    if (!p.code.trim()) {
      notify('Please fill in the product code first.', 'error');
      return;
    }

    try {
      const title = p.name.trim() || p.code.trim();
      const productSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
      const priceVal = p.price.trim() ? parseFloat(p.price.trim()) : null;

      if (p.savedProductId) {
        navigate(`/admin/products/${p.savedProductId}`);
        return;
      }

      const productData = {
        slug: productSlug,
        title,
        code: p.code.trim(),
        excerpt: '',
        description: null,
        category_id: null,
        category_slug: 'bridal',
        price: priceVal,
        price_on_request: !priceVal,
        price_type: priceVal ? 'fixed' : 'price_on_request',
        status: 'signature',
        work_type: p.work_type || 'Hand Work',
        occasion: occasions[0] ?? null,
        occasions,
        colors: p.color ? [p.color] : [],
        color: p.color || null,
        color_main: p.color || null,
        fabric: p.fabric || null,
        fabric_main: p.fabric || null,
        embroidery: [],
        includes: [],
        accessories: [],
        hand_work_details: [],
        customisation_options: [],
        customisation_level: 'Fully Customisable',
        customisable: true,
        highlights: [],
        care_instructions: null,
        website_placement: [],
        visibility: 'website',
        priority: 'Medium',
        related_product_ids: [],
        image_keys: [],
        is_active: false,
        is_featured: false,
        is_new: true,
        is_best_seller: false,
        sort_order: 0,
        thumbnail_index: 0,
        video_url: null,
        seo_title: title,
        seo_description: null,
        image_alt_text: title,
      };

      const { data: newProd, error: prodErr } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .maybeSingle();
      if (prodErr) throw prodErr;
      const productId = newProd?.id;
      if (!productId) throw new Error('Failed to create product');

      const { error: imgErr } = await supabase.from('product_images').insert({
        product_id: productId,
        url: p.imageUrl,
        alt: title,
        sort_order: 0,
        view_type: 'hero',
      });
      if (imgErr) throw imgErr;

      setProducts((prev) => prev.map((item) =>
        item.id === id ? { ...item, savedProductId: productId } : item
      ));

      navigate(`/admin/products/${productId}`);
    } catch {
      notify('Failed to create product for editing.', 'error');
    }
  }, [products, occasions, navigate, notify]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Quick Product Entry</h1>
          <p className="mt-0.5 text-sm font-light text-charcoal-500">Upload multiple products at once — fill in basic details, then expand any product with the full editor</p>
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
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish
          </button>
        </div>
      </div>

      {/* Restored banner */}
      {restored && products.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-luxury border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-xs text-blue-700">
          <span>Restored {products.length} product cards from your last session.</span>
          <button onClick={() => { clearDraft(); setProducts([]); setOccasions([]); setRestored(false); }} className="font-medium text-blue-800 hover:underline">Discard</button>
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

      {/* STEP 1 — OCCASION SELECTION */}
      <section className="mb-6 rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-ivory-100">1</span>
          <h2 className="text-lg font-serif font-medium text-navy-900">Select Occasions</h2>
          <span className="text-[10px] font-light text-charcoal-400">— choose all that apply</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {occasionOptions.map((o) => {
            const selected = occasions.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggleOccasion(o)}
                className={`flex items-center justify-between rounded-luxury border px-5 py-4 text-sm font-medium transition-all ${
                  selected
                    ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-soft'
                    : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300 hover:bg-ivory-50'
                }`}
              >
                {o}
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                  selected ? 'border-gold-500 bg-gold-500 text-navy-900' : 'border-navy-100'
                }`}>
                  {selected && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
        {validationErrors.occasions && <p className="mt-2 text-xs text-red-500">{validationErrors.occasions}</p>}
      </section>

      {/* STEP 2 — QUICK PRODUCT UPLOAD */}
      <section className="rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-ivory-100">2</span>
            <h2 className="text-lg font-serif font-medium text-navy-900">Product Upload</h2>
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
          <p className="mt-1 text-xs font-light text-charcoal-400">Select multiple images — one product card is created per image</p>
        </div>

        {validationErrors.products && products.length === 0 && (
          <p className="mb-4 text-xs text-red-500">{validationErrors.products}</p>
        )}

        {/* Product cards grid */}
        {products.length > 0 && (
          <>
            <p className="mb-3 text-xs font-light text-charcoal-400">Drag cards to reorder. Product Code is required. Use "Add More Details" to open the full product editor.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <QuickProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  codeErr={validationErrors[`code-${p.id}`]}
                  isDragging={dragOverId === p.id}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onDuplicate={duplicateProduct}
                  onReplaceImage={handleReplaceImage}
                  onReplaceImageUrl={(id, url) => updateProduct(id, { imageUrl: url })}
                  onAddMoreDetails={handleAddMoreDetails}
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
