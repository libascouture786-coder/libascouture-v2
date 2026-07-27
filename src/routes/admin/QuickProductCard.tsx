import { memo } from 'react';
import {
  ChevronDown, ChevronUp, Trash2, Copy, RefreshCw, GripVertical,
  Check,
} from 'lucide-react';
import { colorSwatches, fabricOptions } from '@/config/customisation';
import type { QuickProduct } from './quick-collection-types';
import {
  workTypeOptions, productTypeOptions, componentOptions,
  accessoryOptions, customisationOptionList, customisationLevelOptions,
} from './quick-collection-types';

type Props = {
  product: QuickProduct;
  index: number;
  nameErr?: string;
  codeErr?: string;
  isDragging: boolean;
  onUpdate: (id: string, patch: Partial<QuickProduct>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReplaceImage: (id: string, file: File) => void;
  onToggleExpand: (id: string) => void;
  onToggleArray: (id: string, field: keyof QuickProduct, value: string) => void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
};

function QuickProductCardBase({
  product, index, nameErr, codeErr, isDragging,
  onUpdate, onRemove, onDuplicate, onReplaceImage, onToggleExpand, onToggleArray,
  onDragStart, onDragEnter, onDragEnd,
}: Props) {
  const isReady = !!(product.name.trim() && product.code.trim());
  const replaceInputId = `replace-img-${product.id}`;

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(product.id); }}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter(product.id); }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col rounded-luxury border bg-white transition-all ${
        isDragging ? 'opacity-40 scale-95' : ''
      } ${isReady ? 'border-green-200' : 'border-gold-200'}`}
    >
      {/* Drag handle overlay */}
      <div className="absolute left-1.5 top-1.5 z-10 cursor-grab rounded-md p-0.5 text-charcoal-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
        <GripVertical size={14} />
      </div>

      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-luxury bg-navy-50">
        <img
          src={product.imageUrl}
          alt={product.name || `Product ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
        {/* Quick actions overlay */}
        <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-navy-950/40 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <label
            htmlFor={replaceInputId}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-charcoal-600 transition-colors hover:bg-white"
            title="Replace image"
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
        {/* Position badge */}
        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-navy-950/70 px-2 py-0.5 text-[9px] font-medium text-ivory-100 backdrop-blur-sm">
          {index + 1}
        </span>
        {/* Status indicator */}
        <span className={`absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full ${isReady ? 'bg-green-400' : 'bg-gold-400'}`} />
      </div>

      {/* Fields */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Name *</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onUpdate(product.id, { name: e.target.value })}
            className="w-full rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-200"
            placeholder="Product name"
          />
          {nameErr && <p className="mt-0.5 text-[9px] text-red-500">{nameErr}</p>}
        </div>
        <div>
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Design No. *</label>
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
          <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Colour</label>
          <select
            value={product.color}
            onChange={(e) => onUpdate(product.id, { color: e.target.value })}
            className="w-full appearance-none rounded-md border border-navy-50 bg-ivory-50 px-2 py-1.5 text-xs text-charcoal-800 focus:border-gold-400 focus:outline-none"
          >
            <option value="">Select</option>
            {colorSwatches.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* More Details toggle */}
        <button
          onClick={() => onToggleExpand(product.id)}
          className="flex items-center justify-center gap-1 rounded-md border border-navy-50 py-1.5 text-[10px] font-medium text-charcoal-500 transition-colors hover:bg-ivory-100"
        >
          {product.expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          More Details
        </button>
      </div>

      {/* Expanded optional fields */}
      {product.expanded && (
        <div className="border-t border-navy-50 bg-ivory-50/50 p-3">
          <div className="grid gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Fabric</label>
                <select
                  value={product.fabric_main}
                  onChange={(e) => onUpdate(product.id, { fabric_main: e.target.value })}
                  className="w-full appearance-none rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                >
                  <option value="">Select</option>
                  {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Work</label>
                <select
                  value={product.work_type}
                  onChange={(e) => onUpdate(product.id, { work_type: e.target.value })}
                  className="w-full appearance-none rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                >
                  {workTypeOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Product Type</label>
                <select
                  value={product.product_type}
                  onChange={(e) => onUpdate(product.id, { product_type: e.target.value })}
                  className="w-full appearance-none rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                >
                  <option value="">Select</option>
                  {productTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Customisation</label>
                <select
                  value={product.customisation_level}
                  onChange={(e) => onUpdate(product.id, { customisation_level: e.target.value })}
                  className="w-full appearance-none rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                >
                  {customisationLevelOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">Description</label>
              <textarea
                rows={2}
                value={product.description}
                onChange={(e) => onUpdate(product.id, { description: e.target.value })}
                className="w-full resize-none rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                placeholder="Optional..."
              />
            </div>

            <div>
              <label className="mb-1 block text-[9px] uppercase tracking-wide text-charcoal-400">Components</label>
              <div className="flex flex-wrap gap-1">
                {componentOptions.map((c) => (
                  <Chip key={c} label={c} selected={product.components.includes(c)} onClick={() => onToggleArray(product.id, 'components', c)} />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[9px] uppercase tracking-wide text-charcoal-400">Accessories</label>
              <div className="flex flex-wrap gap-1">
                {accessoryOptions.map((a) => (
                  <Chip key={a} label={a} selected={product.accessories.includes(a)} onClick={() => onToggleArray(product.id, 'accessories', a)} />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[9px] uppercase tracking-wide text-charcoal-400">Customisation</label>
              <div className="flex flex-wrap gap-1">
                {customisationOptionList.map((c) => (
                  <Chip key={c} label={c} selected={product.customisation_options.includes(c)} onClick={() => onToggleArray(product.id, 'customisation_options', c)} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">SEO Title</label>
                <input
                  type="text"
                  value={product.seo_title}
                  onChange={(e) => onUpdate(product.id, { seo_title: e.target.value })}
                  className="w-full rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                  placeholder="Optional..."
                />
              </div>
              <div>
                <label className="mb-0.5 block text-[9px] uppercase tracking-wide text-charcoal-400">SEO Description</label>
                <input
                  type="text"
                  value={product.seo_description}
                  onChange={(e) => onUpdate(product.id, { seo_description: e.target.value })}
                  className="w-full rounded-md border border-navy-50 bg-white px-2 py-1.5 text-xs focus:border-gold-400 focus:outline-none"
                  placeholder="Optional..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2 py-1 text-[10px] font-medium transition-all ${
        selected
          ? 'border-gold-500 bg-gold-50 text-gold-900'
          : 'border-navy-50 bg-white text-charcoal-500 hover:border-gold-300 hover:bg-ivory-50'
      }`}
    >
      {selected && <Check size={9} className="mr-0.5 inline" />}
      {label}
    </button>
  );
}

export const QuickProductCard = memo(QuickProductCardBase);
