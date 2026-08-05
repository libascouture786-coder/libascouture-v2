import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

type Props = {
  label: string;
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  required?: boolean;
  placeholder?: string;
  compact?: boolean;
  allowCustom?: boolean;
};

export function MultiComboField({
  label, values, options, onChange, required, placeholder = 'Search or type', compact = false, allowCustom = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    const opts = options as string[];
    if (!query.trim()) return opts;
    const q = query.toLowerCase();
    return opts.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const addCustom = () => {
    const val = query.trim();
    if (!val) return;
    if (!values.includes(val)) onChange([...values, val]);
    setQuery('');
  };

  const removeAt = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  const sizeClasses = compact
    ? 'px-2 py-1.5 text-xs'
    : 'px-3.5 py-2.5 text-sm';

  return (
    <div ref={ref} className="relative">
      <label className={`mb-1 block ${compact ? 'text-[9px]' : 'text-xs'} uppercase tracking-[0.12em] text-charcoal-600`}>
        {label}{required && ' *'}
      </label>
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        className={`flex flex-wrap items-center gap-1 rounded-luxury border border-navy-50 bg-ivory-50 ${sizeClasses} min-h-[42px] cursor-text transition-colors focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-200`}
      >
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-medium text-gold-900">
            {v}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeAt(i); }} className="text-charcoal-400 hover:text-red-500">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filtered.length > 0 && filtered[0].toLowerCase() === query.toLowerCase()) {
                toggle(filtered[0]);
                setQuery('');
              } else if (allowCustom) {
                addCustom();
              }
            }
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'Backspace' && !query && values.length > 0) {
              removeAt(values.length - 1);
            }
          }}
          className="flex-1 border-0 bg-transparent p-0 text-inherit placeholder:text-charcoal-300 focus:outline-none focus:ring-0"
          placeholder={values.length === 0 ? placeholder : ''}
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); setQuery(''); }}
          className="text-charcoal-300"
        >
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-40 mt-1 max-h-48 w-full overflow-y-auto rounded-luxury border border-navy-50 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-charcoal-400">
              {allowCustom && query.trim() ? (
                <button type="button" onMouseDown={(e) => { e.preventDefault(); addCustom(); }} className="text-gold-700 hover:underline">
                  Press Enter to add "{query.trim()}"
                </button>
              ) : 'No options'}
            </div>
          ) : (
            filtered.map((o) => {
              const selected = values.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); toggle(o); setQuery(''); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-gold-50 ${selected ? 'bg-gold-50 font-medium text-gold-900' : 'text-charcoal-700'}`}
                >
                  {o}
                  {selected && <Check size={12} strokeWidth={3} className="text-gold-600" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
