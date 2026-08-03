import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Loader2, Save, Plus, Check, Layers, AlertCircle, FileEdit, X,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import { QuickProductCard } from './QuickProductCard';
import {
  type QuickProduct, occasionOptions, makeProduct, buildProductData,
  safeTrim, extractErrorMessage,
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
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [saveProgress, setSaveProgress] = useState({ done: 0, total: 0 });
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [restored, setRestored] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
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

  const toggleOccasion = (occasion: string) => {
    setOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
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
        const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        return pub.publicUrl;
      });
      const uploaded = await Promise.all(uploadPromises);
      setProducts((prev) => {
        const startIdx = prev.length;
        const newProducts = uploaded.map((url, i) => {
          const n = startIdx + i + 1;
          return makeProduct(url, `LC-${String(n).padStart(3, '0')}`);
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

  const handleReplaceImage = useCallback(async (id: string, file: File) => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) { notify('Failed to replace image.', 'error'); return; }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, imageUrl: pub.publicUrl } : p)));
  }, [notify]);

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
        ...prev[idx], id: crypto.randomUUID(),
        name: `${prev[idx].name} (Copy)`, code: '', savedProductId: null,
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
      const code = safeTrim(p.code);
      if (!code) errs[`code-${p.id}`] = 'Required';
      else if (seenCodes.has(code.toLowerCase())) errs[`code-${p.id}`] = 'Duplicate';
      else seenCodes.add(code.toLowerCase());
      if (!safeTrim(p.product_type)) errs[`type-${p.id}`] = 'Required';
    });
    return errs;
  }, [occasions, products]);

  const isValid = Object.keys(validationErrors).length === 0;

  const completedCount = useMemo(
    () => products.filter((p) => safeTrim(p.code) && safeTrim(p.product_type)).length, [products],
  );
  const remainingCount = products.length - completedCount;

  /* ── Shared save logic for a single product ─────────────────────── */
  const saveOneProduct = useCallback(async (p: QuickProduct, index: number, isActive: boolean, status: string): Promise<string | null> => {
    const code = safeTrim(p.code);
    if (!code) throw new Error(`Product ${index + 1} has no product code`);

    /* Check if a product with this code already exists in the database */
    let existingId: string | null = p.savedProductId;
    if (!existingId) {
      const { data: existing, error: lookupErr } = await supabase
        .from('products')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (lookupErr) throw lookupErr;
      if (existing?.id) existingId = existing.id;
    }

    const isUpdate = Boolean(existingId);
    const productData = buildProductData(p, occasions, isActive, index, status, isUpdate);

    let productId = existingId;

    if (productId) {
      const { error: updErr } = await supabase.from('products').update(productData).eq('id', productId);
      if (updErr) throw updErr;
    } else {
      const { data: newProd, error: prodErr } = await supabase
        .from('products').insert(productData).select('id').maybeSingle();
      if (prodErr) throw prodErr;
      productId = newProd?.id;
      if (!productId) throw new Error(`Database returned no product id for product ${index + 1}`);

      const { error: imgErr } = await supabase.from('product_images').insert({
        product_id: productId, url: p.imageUrl, alt: safeTrim(p.name) || safeTrim(p.code),
        sort_order: 0, view_type: 'hero',
      });
      if (imgErr) throw imgErr;
    }

    return productId;
  }, [occasions]);

  /* ── Save All Draft ─────────────────────────────────────────────── */
  const handleSaveAllDraft = async () => {
    if (!isValid) { notify('Please fill in product code and product type for every product.', 'error'); return; }
    setSaving(true);
    setSaveProgress({ done: 0, total: products.length });
    try {
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const productId = await saveOneProduct(p, i, false, 'signature');
        if (productId && !p.savedProductId) {
          setProducts((prev) => prev.map((item) => item.id === p.id ? { ...item, savedProductId: productId } : item));
        }
        setSaveProgress({ done: i + 1, total: products.length });
      }
      await logActivity('products_saved_draft', `Quick-saved ${products.length} products as draft for ${occasions.join(', ')}`, 'product', undefined);
      saveDraft(occasions, products);
      notify(`${products.length} products saved as draft.`, 'success');
    } catch (err) {
      notify(`Save Draft failed: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Publish All ─────────────────────────────────────────────────── */
  const handlePublishAll = async () => {
    if (!isValid) { notify('Please fill in product code and product type for every product.', 'error'); return; }
    setSaving(true);
    setSaveProgress({ done: 0, total: products.length });
    try {
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const productId = await saveOneProduct(p, i, true, 'made_on_order');
        if (productId && !p.savedProductId) {
          setProducts((prev) => prev.map((item) => item.id === p.id ? { ...item, savedProductId: productId } : item));
        }
        setSaveProgress({ done: i + 1, total: products.length });
      }
      await logActivity('products_published', `Quick-published ${products.length} products for ${occasions.join(', ')}`, 'product', undefined);
      clearDraft();
      notify(`${products.length} products published.`, 'success');
      navigate('/admin/products');
    } catch (err) {
      notify(`Publish All failed: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Save in Quick Collection (single product, no publish) ──────── */
  const handleSaveInQuick = useCallback(async (id: string) => {
    const p = products.find((item) => item.id === id);
    if (!p) return;
    if (!safeTrim(p.code)) { notify('Please fill in the product code first.', 'error'); return; }
    if (!safeTrim(p.product_type)) { notify('Please fill in the product type first.', 'error'); return; }

    setSavingId(id);
    try {
      const index = products.findIndex((item) => item.id === id);
      const productId = await saveOneProduct(p, index, false, 'signature');
      if (productId && !p.savedProductId) {
        setProducts((prev) => prev.map((item) => item.id === id ? { ...item, savedProductId: productId } : item));
      }
      setSaveSuccessId(id);
    } catch (err) {
      notify(`Save in Quick Collection failed: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setSavingId(null);
    }
  }, [products, saveOneProduct, notify]);

  const dismissSaveSuccess = useCallback((id: string) => {
    setSaveSuccessId((prev) => (prev === id ? null : prev));
  }, []);

  /* ── Add More Details ────────────────────────────────────────────── */
  const handleAddMoreDetails = useCallback(async (id: string) => {
    const p = products.find((item) => item.id === id);
    if (!p) return;
    if (!safeTrim(p.code)) { notify('Please fill in the product code first.', 'error'); return; }
    if (!safeTrim(p.product_type)) { notify('Please fill in the product type first.', 'error'); return; }

    if (p.savedProductId) {
      navigate(`/admin/products/${p.savedProductId}`);
      return;
    }

    setSavingId(id);
    try {
      const index = products.findIndex((item) => item.id === id);
      const productId = await saveOneProduct(p, index, false, 'signature');
      if (!productId) throw new Error('Database returned no product id');
      setProducts((prev) => prev.map((item) => item.id === id ? { ...item, savedProductId: productId } : item));
      notify('Product saved to Quick Collection draft. Opening full editor...', 'success');
      navigate(`/admin/products/${productId}`);
    } catch (err) {
      notify(`Failed to create product: ${extractErrorMessage(err)}`, 'error');
    } finally {
      setSavingId(null);
    }
  }, [products, saveOneProduct, navigate, notify]);

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
          {products.length > 0 && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200"
            >
              <FileEdit size={14} /> Preview All
            </button>
          )}
          <button
            onClick={handleSaveAllDraft}
            disabled={saving || products.length === 0}
            className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All Draft
          </button>
          <button
            onClick={handlePublishAll}
            disabled={saving || products.length === 0}
            className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Publish All
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
            <span>Saving products...</span>
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
                key={o} type="button" onClick={() => toggleOccasion(o)}
                className={`flex items-center justify-between rounded-luxury border px-5 py-4 text-sm font-medium transition-all ${
                  selected ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-soft' : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300 hover:bg-ivory-50'
                }`}
              >
                {o}
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${selected ? 'border-gold-500 bg-gold-500 text-navy-900' : 'border-navy-100'}`}>
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
              <span className="flex items-center gap-1.5 font-medium text-navy-700"><Layers size={13} /> {products.length} Uploaded</span>
              <span className="flex items-center gap-1.5 font-medium text-green-600"><Check size={13} /> {completedCount} Completed</span>
              {remainingCount > 0 && (
                <span className="flex items-center gap-1.5 font-medium text-gold-700"><AlertCircle size={13} /> {remainingCount} Remaining</span>
              )}
            </div>
          )}
        </div>

        {/* Upload dropzone */}
        <div
          role="button" tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleImageUpload(e.dataTransfer.files); }}
          className={`mb-6 cursor-pointer rounded-luxury border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300 hover:bg-ivory-50'}`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple
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
            <p className="mb-3 flex items-center gap-1.5 text-xs font-light text-charcoal-400">
              <FileEdit size={12} /> Drag cards to reorder. Product Code and Product Type are required. Use "Add More Details" to open the full product editor — the product is saved back to this draft without publishing.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p, i) => (
                <QuickProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  codeErr={validationErrors[`code-${p.id}`]}
                  typeErr={validationErrors[`type-${p.id}`]}
                  isDragging={dragOverId === p.id}
                  showSaveSuccess={saveSuccessId === p.id}
                  onUpdate={updateProduct}
                  onRemove={removeProduct}
                  onDuplicate={duplicateProduct}
                  onReplaceImage={handleReplaceImage}
                  onReplaceImageUrl={(id, url) => updateProduct(id, { imageUrl: url })}
                  onAddMoreDetails={handleAddMoreDetails}
                  onSaveInQuick={handleSaveInQuick}
                  onDismissSaveSuccess={dismissSaveSuccess}
                  savingId={savingId}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-luxury border-2 border-dashed border-navy-100 py-4 text-sm font-medium text-charcoal-500 transition-colors hover:border-gold-300 hover:bg-ivory-50 hover:text-navy-900"
            >
              <Plus size={16} /> Upload more images
            </button>
          </>
        )}
      </section>

      {/* Preview All modal */}
      {previewOpen && (
        <PreviewAllModal products={products} occasions={occasions} onClose={() => setPreviewOpen(false)} />
      )}
    </AdminLayout>
  );
}

/* ── Preview All modal — shows all products before publishing ────── */
function PreviewAllModal({
  products, occasions, onClose,
}: {
  products: QuickProduct[];
  occasions: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-luxury-lg bg-ivory-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-50 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-serif font-medium text-navy-900">Preview Before Publishing</h2>
            <p className="mt-0.5 text-xs font-light text-charcoal-500">
              {products.length} products · Occasions: {occasions.join(', ') || 'None selected'}
            </p>
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-luxury border border-navy-50 bg-white">
                <div className="flex items-center justify-center bg-navy-50" style={{ aspectRatio: '4 / 5' }}>
                  <img src={p.imageUrl} alt={p.name || p.code} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-xs font-medium text-navy-900">{p.name || p.code}</p>
                  <p className="text-[10px] text-charcoal-400">Code: {p.code}</p>
                  {p.product_type && <p className="text-[10px] text-charcoal-400">Type: {p.product_type}</p>}
                  {p.price && <p className="text-[10px] text-charcoal-400">Price: {p.price}</p>}
                  {p.color && <p className="text-[10px] text-charcoal-400">Color: {p.color}</p>}
                  {p.fabric && <p className="text-[10px] text-charcoal-400">Fabric: {p.fabric}</p>}
                  {p.work_type && <p className="text-[10px] text-charcoal-400">Work: {p.work_type}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-navy-50 bg-white px-6 py-4">
          <button onClick={onClose} className="w-full rounded-luxury bg-navy-900 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-ivory-100 transition-colors hover:bg-navy-800">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
