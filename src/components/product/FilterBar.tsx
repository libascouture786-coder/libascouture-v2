import type { ProductWithImages } from '@/lib/types';

export type SortOption = {
  value: string;
  label: string;
};

export const sortOptions: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'az', label: 'Alphabetical' },
];

export type FilterState = {
  occasions: string[];
  colors: string[];
  fabrics: string[];
  embroidery: string[];
  statuses: string[];
  workTypes: string[];
  new: boolean;
  featured: boolean;
  search: string;
  sort: string;
};

export const defaultFilters: FilterState = {
  occasions: [],
  colors: [],
  fabrics: [],
  embroidery: [],
  statuses: [],
  workTypes: [],
  new: false,
  featured: false,
  search: '',
  sort: 'featured',
};

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { searchFacets } from '@/config/site';

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
};

function FilterDropdown({ label, options, selected, onToggle }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:border-gold-400"
      >
        {label}
        {selected.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] text-navy-900">
            {selected.length}
          </span>
        )}
        <ChevronDown size={12} className={`transition-transform duration-luxury ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-luxury border border-navy-100 bg-white p-3 shadow-soft-lg">
          <div className="max-h-60 space-y-1 overflow-y-auto no-scrollbar">
            {options.map((opt) => (
              <label key={opt} className="flex cursor-pointer items-center gap-2.5 rounded-luxury px-2 py-1.5 hover:bg-ivory-200">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                  className="h-4 w-4 rounded border-navy-200 text-gold-500 focus:ring-gold-400"
                />
                <span className="text-xs font-light text-charcoal-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type FilterBarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
};

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const toggle = (key: keyof FilterState, value: string) => {
    const arr = filters[key] as string[];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="hidden items-center gap-3 lg:flex">
      <FilterDropdown label="Occasion" options={searchFacets.occasions} selected={filters.occasions} onToggle={(v) => toggle('occasions', v)} />
      <FilterDropdown label="Colour" options={searchFacets.colors} selected={filters.colors} onToggle={(v) => toggle('colors', v)} />
      <FilterDropdown label="Fabric" options={searchFacets.fabrics} selected={filters.fabrics} onToggle={(v) => toggle('fabrics', v)} />
      <FilterDropdown label="Embroidery" options={searchFacets.embroideryStyles} selected={filters.embroidery} onToggle={(v) => toggle('embroidery', v)} />

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs font-light text-charcoal-400">{resultCount} pieces</span>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
};

export function FilterSheet({ open, onClose, filters, onChange }: FilterSheetProps) {
  if (!open) return null;
  const toggle = (key: keyof FilterState, value: string) => {
    const arr = filters[key] as string[];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="fixed inset-0 z-[120] lg:hidden">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-luxury-lg bg-ivory-100 p-6 shadow-soft-lg animate-slide-up no-scrollbar">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-h3 font-serif font-medium text-navy-900">Filters</h2>
          <button onClick={onClose} aria-label="Close filters" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ivory-200">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-6">
          {([
            { label: 'Occasion', key: 'occasions' as const, options: searchFacets.occasions },
            { label: 'Colour', key: 'colors' as const, options: searchFacets.colors },
            { label: 'Fabric', key: 'fabrics' as const, options: searchFacets.fabrics },
            { label: 'Embroidery', key: 'embroidery' as const, options: searchFacets.embroideryStyles },
          ]).map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const selected = filters[group.key].includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggle(group.key, opt)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-light transition-colors ${
                        selected
                          ? 'border-gold-500 bg-gold-500 text-navy-900'
                          : 'border-navy-100 bg-white text-charcoal-600 hover:border-gold-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Sort</p>
            <select
              value={filters.sort}
              onChange={(e) => onChange({ ...filters, sort: e.target.value })}
              className="input-luxury"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary mt-6 w-full">
          Show Results
        </button>
      </div>
    </div>
  );
}

export function MobileFilterButton({ onClick, activeCount }: { onClick: () => void; activeCount: number }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:border-gold-400 lg:hidden"
    >
      <SlidersHorizontal size={14} />
      Filters
      {activeCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] text-navy-900">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export function applyFilters(products: ProductWithImages[], filters: FilterState): ProductWithImages[] {
  let result = [...products];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q),
    );
  }

  if (filters.occasions.length > 0) {
    result = result.filter((p) =>
      filters.occasions.some((o) => (p.occasions ?? []).some((po) => po.toLowerCase().includes(o.toLowerCase()))),
    );
  }
  if (filters.colors.length > 0) {
    result = result.filter((p) => filters.colors.some((c) => (p.colors ?? []).includes(c)));
  }
  if (filters.fabrics.length > 0) {
    result = result.filter((p) => {
      const productFabrics = [p.fabric_main, p.fabric_blouse, p.fabric_dupatta].filter(Boolean) as string[];
      return filters.fabrics.some((f) => productFabrics.some((pf) => pf.toLowerCase().includes(f.toLowerCase())));
    });
  }
  if (filters.embroidery.length > 0) {
    result = result.filter((p) => filters.embroidery.some((e) => (p.embroidery ?? []).includes(e)));
  }
  if (filters.statuses.length > 0) {
    result = result.filter((p) => p.status && filters.statuses.includes(p.status));
  }
  if (filters.workTypes.length > 0) {
    result = result.filter((p) => p.work_type && filters.workTypes.includes(p.work_type));
  }
  if (filters.new) {
    result = result.filter((p) => p.is_new);
  }
  if (filters.featured) {
    result = result.filter((p) => p.is_featured);
  }

  switch (filters.sort) {
    case 'newest':
      result.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
      break;
    case 'price_asc':
      result.sort((a, b) => (Number(a.price ?? 0) || 999999) - (Number(b.price ?? 0) || 999999));
      break;
    case 'price_desc':
      result.sort((a, b) => (Number(b.price ?? 0) || 0) - (Number(a.price ?? 0) || 0));
      break;
    case 'az':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  }

  return result;
}
