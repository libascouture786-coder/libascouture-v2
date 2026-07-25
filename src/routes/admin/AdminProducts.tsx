import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Check, X, Eye,
  Star, Package, Loader2,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/admin-api';
import type { ProductWithImages } from '@/lib/types';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'signature', label: 'Signature' },
  { value: 'made_on_order', label: 'Made to Order' },
  { value: 'ready_to_ship', label: 'Ready to Ship' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'archived', label: 'Archived' },
];

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'az', label: 'Alphabetical' },
  { value: 'code', label: 'Design Code' },
];

export function AdminProducts() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('latest');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data: prodData, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { setLoading(false); return; }
    const { data: imgData } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });
    const withImages: ProductWithImages[] = (prodData ?? []).map((p) => ({
      ...p,
      images: (imgData ?? []).filter((img) => img.product_id === p.id),
    }));
    setProducts(withImages);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  let filtered = products;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.code ?? '').toLowerCase().includes(q) ||
      (p.category_slug ?? '').toLowerCase().includes(q)
    );
  }
  if (statusFilter) filtered = filtered.filter((p) => p.status === statusFilter);

  switch (sort) {
    case 'oldest': filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
    case 'featured': filtered = [...filtered].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
    case 'newest': filtered = [...filtered].sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0)); break;
    case 'az': filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'code': filtered = [...filtered].sort((a, b) => (a.code ?? '').localeCompare(b.code ?? '')); break;
    default: break;
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    const updates: Record<string, unknown> = {};
    if (bulkAction === 'publish') updates.is_active = true;
    if (bulkAction === 'archive') updates.status = 'archived';
    if (bulkAction === 'hide') updates.status = 'hidden';
    if (bulkAction === 'feature') updates.is_featured = true;
    if (bulkAction === 'unfeature') updates.is_featured = false;

    await supabase.from('products').update(updates).in('id', ids);
    await logActivity('product_updated', `Bulk ${bulkAction} applied to ${ids.length} products`, 'product');
    setBulkLoading(false);
    setBulkAction('');
    setSelected(new Set());
    fetchProducts();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Products</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">{filtered.length} products in catalogue</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-luxury bg-navy-900 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-ivory-100 transition-colors hover:bg-navy-800"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, category..."
            className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:ring-2 focus:ring-gold-200 focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-sm text-charcoal-800 focus:border-gold-400 focus:outline-none">
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-sm text-charcoal-800 focus:border-gold-400 focus:outline-none">
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-luxury border border-gold-200 bg-gold-50 px-4 py-3">
          <span className="text-sm font-medium text-gold-800">{selected.size} selected</span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="rounded-luxury border border-navy-100 bg-white px-3 py-1.5 text-xs text-charcoal-800 focus:outline-none">
            <option value="">Choose action...</option>
            <option value="publish">Publish</option>
            <option value="archive">Archive</option>
            <option value="hide">Hide</option>
            <option value="feature">Mark Featured</option>
            <option value="unfeature">Unmark Featured</option>
          </select>
          <button onClick={handleBulkAction} disabled={bulkLoading || !bulkAction} className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-1.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
            {bulkLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Apply
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs font-light text-charcoal-500 hover:text-navy-900">
            <X size={14} /> Clear
          </button>
        </div>
      )}

      {/* Product table */}
      <div className="overflow-hidden rounded-luxury-lg border border-navy-50 bg-white shadow-soft">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-luxury" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
            <p className="mt-3 text-sm font-light text-charcoal-400">No products found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-50 bg-ivory-100">
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-navy-200 text-gold-500 focus:ring-gold-400" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Flags</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-[0.1em] text-charcoal-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-navy-50 transition-colors hover:bg-ivory-100">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 rounded border-navy-200 text-gold-500 focus:ring-gold-400" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]?.url ?? ''} alt={p.title} className="h-12 w-12 rounded-luxury object-cover" loading="lazy" />
                          <div>
                            <Link to={`/admin/products/${p.id}`} className="text-sm font-medium text-navy-900 hover:text-gold-700">{p.title}</Link>
                            <p className="text-xs font-light text-charcoal-400">{p.price_type === 'price_on_request' ? 'Price on Request' : `₹${Number(p.price ?? 0).toLocaleString('en-IN')}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-light text-charcoal-600">{p.code ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-light text-charcoal-600 capitalize">{p.category_slug ?? '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status ?? ''} active={p.is_active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.is_featured && <span title="Featured" className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-50 text-gold-600"><Star size={10} fill="currentColor" /></span>}
                          {p.is_new && <span title="New" className="rounded-full bg-green-50 px-1.5 text-[9px] font-medium text-green-600">NEW</span>}
                          {p.is_best_seller && <span title="Best Seller" className="rounded-full bg-navy-50 px-1.5 text-[9px] font-medium text-navy-600">BEST</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/products/${p.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-luxury text-charcoal-400 hover:bg-ivory-200 hover:text-navy-900">
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-navy-50 lg:hidden">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-4">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 rounded border-navy-200 text-gold-500 focus:ring-gold-400" />
                  <img src={p.images?.[0]?.url ?? ''} alt={p.title} className="h-12 w-12 rounded-luxury object-cover" loading="lazy" />
                  <div className="flex-1">
                    <Link to={`/admin/products/${p.id}`} className="text-sm font-medium text-navy-900">{p.title}</Link>
                    <p className="text-xs font-light text-charcoal-400">{p.code ?? '—'} • {p.category_slug ?? '—'}</p>
                  </div>
                  <StatusBadge status={p.status ?? ''} active={p.is_active} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status, active }: { status: string; active: boolean }) {
  if (!active) return <span className="rounded-full bg-ivory-200 px-2.5 py-0.5 text-[10px] font-medium text-charcoal-500">Draft</span>;
  const config: Record<string, { label: string; class: string }> = {
    signature: { label: 'Signature', class: 'bg-gold-50 text-gold-700' },
    made_on_order: { label: 'Made to Order', class: 'bg-blue-50 text-blue-700' },
    ready_to_ship: { label: 'Ready to Ship', class: 'bg-green-50 text-green-700' },
    hidden: { label: 'Hidden', class: 'bg-charcoal-100 text-charcoal-500' },
    archived: { label: 'Archived', class: 'bg-red-50 text-red-600' },
  };
  const cfg = config[status] ?? { label: status || 'Active', class: 'bg-ivory-200 text-charcoal-600' };
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${cfg.class}`}>{cfg.label}</span>;
}
