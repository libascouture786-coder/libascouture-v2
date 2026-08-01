import { memo, useEffect, useState } from 'react';
import {
  Trash2, Copy, RefreshCw, GripVertical, ImageIcon, X, Search,
  Loader2, Check, ChevronRight,
} from 'lucide-react';
import { colorSwatches, fabricOptions } from '@/config/customisation';
import { fetchMedia } from '@/lib/admin-api';
import type { MediaAsset } from '@/lib/admin-types';
import type { QuickProduct } from './quick-collection-types';
import { workTypeOptions } from './quick-collection-types';

type Props = {
  product: QuickProduct;
  index: number;
  codeErr?: string;
  isDragging: boolean;
  onUpdate: (id: string, patch: Partial<QuickProduct>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReplaceImage: (id: string, file: File) => void;
  onReplaceImageUrl: (id: string, url: string) => void;
  onAddMoreDetails: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
};

function QuickProductCardBase({
  product, index, codeErr, isDragging,
  onUpdate, onRemove, onDuplicate, onReplaceImage, onReplaceImageUrl, onAddMoreDetails,
  onDragStart, onDragEnter, onDragEnd,
}: Props) {
  const replaceInputId = `replace-img-${product.id}`;
  const [libOpen, setLibOpen] = useState(false);

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

      <div className="relative aspect-[4/5] overflow-hidden rounded-t-luxury bg-navy-50">
        <img
          src={product.imageUrl}
          alt={product.name || `Product ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
        <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-navy-950/40 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
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
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Color</label>
          <select
            value={product.color}
            onChange={(e) => onUpdate(product.id, { color: e.target.value })}
            className="w-full appearance-none rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 focus:border-gold-400 focus:outline-none"
          >
            <option value="">Select</option>
            {colorSwatches.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Fabric</label>
          <select
            value={product.fabric}
            onChange={(e) => onUpdate(product.id, { fabric: e.target.value })}
            className="w-full appearance-none rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 focus:border-gold-400 focus:outline-none"
          >
            <option value="">Select</option>
            {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Work Type</label>
          <select
            value={product.work_type}
            onChange={(e) => onUpdate(product.id, { work_type: e.target.value })}
            className="w-full appearance-none rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 focus:border-gold-400 focus:outline-none"
          >
            <option value="">Select</option>
            {workTypeOptions.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <button
          onClick={() => onAddMoreDetails(product.id)}
          className="mt-1 flex items-center justify-center gap-1 rounded-md bg-navy-900 py-2 text-[10px] font-medium text-ivory-100 transition-colors hover:bg-navy-800"
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
