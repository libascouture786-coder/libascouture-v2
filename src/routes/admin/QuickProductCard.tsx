import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Trash2, Copy, RefreshCw, GripVertical, ImageIcon, X, Search,
  Loader2, Check, ChevronRight, ChevronDown, Save, Maximize2,
} from 'lucide-react';
import { colorSwatches, fabricOptions } from '@/config/customisation';
import { fetchMedia } from '@/lib/admin-api';
import type { MediaAsset } from '@/lib/admin-types';
import type { QuickProduct } from './quick-collection-types';
import { workTypeOptions, productTypeOptions } from './quick-collection-types';

/* ── Searchable + typable combobox ───────────────────────────────── */
function ComboField({
  label, value, options, onChange, required, placeholder = 'Select or type',
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query) return options as string[];
    const q = query.toLowerCase();
    return (options as string[]).filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const displayValue = open ? query : value;

  return (
    <div>
      <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">
        {label}{required && ' *'}
      </label>
      <div ref={ref} className="relative">
        <input
          type="text"
          value={displayValue}
          onFocus={() => { setOpen(true); setQuery(value); }}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered.length > 0) { onChange(filtered[0]); setQuery(filtered[0]); }
              setOpen(false);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          onBlur={() => { setTimeout(() => setOpen(false), 100); }}
          className="w-full rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-200"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => { setOpen(!open); setQuery(value); }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-charcoal-300"
        >
          <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        {open && (
          <div className="absolute z-30 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-navy-50 bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-2 py-1.5 text-[10px] text-charcoal-400">
                {query ? `Press Enter to use "${query}"` : 'No options'}
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); onChange(o); setQuery(o); setOpen(false); }}
                  className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-[11px] transition-colors hover:bg-gold-50 ${
                    value === o ? 'bg-gold-50 font-medium text-gold-900' : 'text-charcoal-700'
                  }`}
                >
                  {o}
                  {value === o && <Check size={10} strokeWidth={3} className="text-gold-600" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Image preview modal ─────────────────────────────────────────── */
function ImagePreviewModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" />
      <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-luxury-lg bg-navy-950 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-900 transition-colors hover:bg-white">
          <X size={18} />
        </button>
        <img src={url} alt={name} className="max-h-[90vh] w-auto object-contain" />
      </div>
    </div>
  );
}

/* ── Save success modal ──────────────────────────────────────────── */
function SaveSuccessModal({
  onReturn, onContinue,
}: {
  onReturn: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm overflow-hidden rounded-luxury-lg bg-white shadow-2xl">
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <Check size={28} strokeWidth={3} className="text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-serif font-medium text-navy-900">Details Saved Successfully</h3>
          <p className="mt-1 text-xs font-light text-charcoal-500">Your product has been saved to the Quick Collection draft.</p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <button
              onClick={onReturn}
              className="w-full rounded-luxury bg-navy-900 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-ivory-100 transition-colors hover:bg-navy-800"
            >
              Return to Quick Collection
            </button>
            <button
              onClick={onContinue}
              className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  product: QuickProduct;
  index: number;
  codeErr?: string;
  typeErr?: string;
  isDragging: boolean;
  showSaveSuccess: boolean;
  onUpdate: (id: string, patch: Partial<QuickProduct>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReplaceImage: (id: string, file: File) => void;
  onReplaceImageUrl: (id: string, url: string) => void;
  onAddMoreDetails: (id: string) => void;
  onSaveInQuick: (id: string) => void;
  onDismissSaveSuccess: (id: string) => void;
  savingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
};

function QuickProductCardBase({
  product, index, codeErr, typeErr, isDragging, showSaveSuccess,
  onUpdate, onRemove, onDuplicate, onReplaceImage, onReplaceImageUrl, onAddMoreDetails, onSaveInQuick, onDismissSaveSuccess,
  savingId,
  onDragStart, onDragEnter, onDragEnd,
}: Props) {
  const replaceInputId = `replace-img-${product.id}`;
  const [libOpen, setLibOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(product.id); }}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter(product.id); }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col rounded-luxury border bg-white transition-all ${
        isDragging ? 'opacity-40 scale-95' : ''
      } border-navy-100`}
    >
      <div className="absolute left-1.5 top-1.5 z-10 cursor-grab rounded-md p-0.5 text-charcoal-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <GripVertical size={14} />
      </div>

      {/* Image — preserves original aspect ratio (portrait or landscape) */}
      <div className="relative flex items-center justify-center overflow-hidden rounded-t-luxury bg-navy-50" style={{ aspectRatio: '4 / 5' }}>
        <img
          src={product.imageUrl}
          alt={product.name || `Product ${index + 1}`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          draggable={false}
        />
        <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-navy-950/40 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-charcoal-600 transition-colors hover:bg-white"
            title="Preview image"
          >
            <Maximize2 size={13} />
          </button>
          <label
            htmlFor={replaceInputId}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-charcoal-600 transition-colors hover:bg-white"
            title="Replace image from device"
          >
            <RefreshCw size={13} />
          </label>
          <input
            id={replaceInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) onReplaceImage(product.id, e.target.files[0]); e.target.value = ''; }}
          />
          <button
            onClick={() => setLibOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-charcoal-600 transition-colors hover:bg-white"
            title="Choose from Media Library"
          >
            <ImageIcon size={13} />
          </button>
          <button
            onClick={() => onDuplicate(product.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-charcoal-600 transition-colors hover:bg-white"
            title="Duplicate"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onRemove(product.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-red-500 transition-colors hover:bg-white"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-navy-950/70 px-2 py-0.5 text-[9px] font-medium text-ivory-100 backdrop-blur-sm">
          {index + 1}
        </span>
        {product.savedProductId && (
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-green-500/90 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">
            <Check size={8} strokeWidth={3} /> Saved
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Product Code *</label>
          <input
            type="text"
            value={product.code}
            onChange={(e) => onUpdate(product.id, { code: e.target.value })}
            className="w-full rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-200"
            placeholder="LC-001"
          />
          {codeErr && <p className="mt-0.5 text-[9px] text-red-500">{codeErr}</p>}
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Product Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onUpdate(product.id, { name: e.target.value })}
            className="w-full rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-200"
            placeholder="Product name"
          />
        </div>
        <ComboField
          label="Product Type"
          value={product.product_type}
          options={productTypeOptions}
          onChange={(v) => onUpdate(product.id, { product_type: v })}
          required
          placeholder="Search or type"
        />
        {typeErr && <p className="-mt-1 text-[9px] text-red-500">{typeErr}</p>}
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Price</label>
          <input
            type="text"
            value={product.price}
            onChange={(e) => onUpdate(product.id, { price: e.target.value })}
            className="w-full rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-200"
            placeholder="e.g. 25000"
          />
        </div>
        <ComboField
          label="Color"
          value={product.color}
          options={colorSwatches.map((c) => c.name)}
          onChange={(v) => onUpdate(product.id, { color: v })}
          placeholder="Search or type"
        />
        <ComboField
          label="Fabric"
          value={product.fabric}
          options={fabricOptions}
          onChange={(v) => onUpdate(product.id, { fabric: v })}
          placeholder="Search or type"
        />
        <ComboField
          label="Work Type"
          value={product.work_type}
          options={workTypeOptions}
          onChange={(v) => onUpdate(product.id, { work_type: v })}
          placeholder="Search or type"
        />

        <button
          onClick={() => onSaveInQuick(product.id)}
          disabled={savingId === product.id}
          className="flex w-full items-center justify-center gap-1 rounded-md border border-navy-200 bg-white py-2 text-[10px] font-medium text-navy-900 transition-colors hover:bg-ivory-100 disabled:opacity-50"
        >
          {savingId === product.id ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save in Quick Collection
        </button>

        <button
          onClick={() => onAddMoreDetails(product.id)}
          className="flex items-center justify-center gap-1 rounded-md bg-navy-900 py-2 text-[10px] font-medium text-ivory-100 transition-colors hover:bg-navy-800"
        >
          Add More Details <ChevronRight size={11} />
        </button>
      </div>

      {libOpen && (
        <QuickImageLibraryModal
          onClose={() => setLibOpen(false)}
          onSelect={(url) => { onReplaceImageUrl(product.id, url); setLibOpen(false); }}
        />
      )}
      {previewOpen && (
        <ImagePreviewModal
          url={product.imageUrl}
          name={product.name || `Product ${index + 1}`}
          onClose={() => setPreviewOpen(false)}
        />
      )}
      {showSaveSuccess && (
        <SaveSuccessModal
          onReturn={() => onDismissSaveSuccess(product.id)}
          onContinue={() => onDismissSaveSuccess(product.id)}
        />
      )}
    </div>
  );
}

function QuickImageLibraryModal({ onClose, onSelect }: { onClose: () => void; onSelect: (url: string) => void }) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMedia().then((data) => { setMedia(data.filter((m) => m.type === 'image')); setLoading(false); });
  }, []);

  let display = media;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((m) => m.name.toLowerCase().includes(q));
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-luxury-lg bg-ivory-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-50 bg-white px-6 py-4">
          <h2 className="text-lg font-serif font-medium text-navy-900">Choose Image</h2>
          <button onClick={onClose} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search images..." className="w-full rounded-luxury border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm focus:border-gold-400 focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Loader2 size={24} className="animate-spin text-charcoal-300" /></div>
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
                <button key={asset.id} onClick={() => onSelect(asset.url)} className="group relative aspect-square overflow-hidden rounded-luxury border border-navy-50 bg-ivory-100 transition-all hover:border-gold-400 hover:shadow-soft">
                  <img src={asset.url} alt={asset.alt_text ?? asset.name} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 flex items-center justify-center bg-navy-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-navy-900"><Check size={16} strokeWidth={3} /></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const QuickProductCard = memo(QuickProductCardBase);
