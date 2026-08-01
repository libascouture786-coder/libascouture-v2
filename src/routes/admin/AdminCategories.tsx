import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Trash2, Save, Loader2, X, Search, Image as ImageIcon,
  Package, Check, Layers, Zap,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MediaPicker } from '@/components/admin/MediaPicker';
import {
  fetchCollections, insertCollection, updateCollection, deleteCollection,
  fetchCollectionProducts, setCollectionProducts, searchProducts,
} from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import type { Collection } from '@/lib/types';

const collectionTypeOptions = [
  'Seasonal', 'Bridal', 'Festive', 'Capsule', 'Editorial', 'Heritage', 'Signature',
] as const;

type CollectionForm = {
  name: string;
  slug: string;
  description: string;
  banner_image: string;
  collection_type: string;
  cover_product_id: string;
};

const emptyForm: CollectionForm = {
  name: '', slug: '', description: '', banner_image: '', collection_type: '', cover_product_id: '',
};

export function AdminCategories() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await fetchCollections();
    setCollections(data as Collection[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setCreating(true);
    setForm(emptyForm);
  };

  const openEdit = (col: Collection) => {
    setEditing(col);
    setForm({
      name: col.name,
      slug: col.slug,
      description: col.description ?? '',
      banner_image: col.banner_image ?? '',
      collection_type: col.collection_type ?? '',
      cover_product_id: col.cover_product_id ?? '',
    });
  };

  const save = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      notify('Collection name and slug are required.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      banner_image: form.banner_image.trim() || null,
      collection_type: form.collection_type || null,
      cover_product_id: form.cover_product_id || null,
    };
    try {
      if (editing) {
        await updateCollection(editing.id, payload);
        notify('Collection updated.');
      } else {
        await insertCollection(payload);
        notify('Collection created.');
      }
      setSaving(false);
      setEditing(null);
      setCreating(false);
      load();
    } catch {
      setSaving(false);
      notify('Failed to save collection.', 'error');
    }
  };

  const remove = async (id: string) => {
    await deleteCollection(id);
    notify('Collection deleted.');
    load();
  };

  const toggleActive = async (col: Collection) => {
    await updateCollection(col.id, { is_active: !col.is_active });
    load();
    notify(`Collection ${col.is_active ? 'deactivated' : 'activated'}.`);
  };

  const isOpen = creating || editing !== null;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Collections</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">{collections.length} collections</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin/quick-collection')} className="flex items-center gap-1.5 rounded-luxury border border-gold-300 bg-gold-50 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-gold-800 transition-colors hover:bg-gold-100">
            <Zap size={14} /> Quick Entry
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-ivory-100 transition-colors hover:bg-navy-800">
            <Plus size={14} /> New Collection
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-luxury-lg" />)}</div>
      ) : collections.length === 0 ? (
        <div className="rounded-luxury-lg border border-dashed border-navy-100 bg-white py-16 text-center">
          <Layers size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
          <p className="mt-3 text-sm font-light text-charcoal-400">No collections yet</p>
          <button onClick={openCreate} className="mt-4 inline-flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2 text-xs font-medium text-ivory-100 hover:bg-navy-800">
            <Plus size={14} /> Create your first collection
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div key={col.id} className="group overflow-hidden rounded-luxury-lg border border-navy-50 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-md">
              <div className="relative h-32 overflow-hidden bg-navy-50">
                {col.banner_image ? (
                  <img src={col.banner_image} alt={col.name} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-charcoal-300">
                    <ImageIcon size={28} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <button onClick={() => toggleActive(col)} className={`rounded-full px-2.5 py-0.5 text-[9px] font-medium shadow-soft ${col.is_active ? 'bg-green-50 text-green-700' : 'bg-ivory-200 text-charcoal-400'}`}>
                    {col.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                {col.collection_type && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-navy-950/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ivory-100 backdrop-blur-sm">
                    {col.collection_type}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-serif font-medium text-navy-900">{col.name}</p>
                <p className="text-xs font-light text-charcoal-400">/{col.slug}</p>
                {col.description && <p className="mt-1.5 text-xs font-light text-charcoal-500 line-clamp-2">{col.description}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => openEdit(col)} className="flex-1 rounded-luxury border border-navy-50 py-1.5 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200">Manage</button>
                  <button onClick={() => remove(col.id)} className="flex h-8 w-8 items-center justify-center rounded-luxury border border-navy-50 text-red-500 transition-colors hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <CollectionDrawer
          editing={editing}
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={save}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </AdminLayout>
  );
}

/* ── Drawer with collection metadata + product membership ────────── */

function CollectionDrawer({
  editing,
  form,
  setForm,
  saving,
  onSave,
  onClose,
}: {
  editing: Collection | null;
  form: CollectionForm;
  setForm: React.Dispatch<React.SetStateAction<CollectionForm>>;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const collectionId = editing?.id;
  const [memberProductIds, setMemberProductIds] = useState<string[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    if (!collectionId) { setMemberProductIds([]); setMembersLoading(false); return; }
    setMembersLoading(true);
    const rows = await fetchCollectionProducts(collectionId);
    setMemberProductIds(rows.map((r: { product_id: string }) => r.product_id));
    setMembersLoading(false);
  }, [collectionId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const saveAll = async () => {
    await onSave();
    if (collectionId) {
      await setCollectionProducts(collectionId, memberProductIds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-ivory-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-50 bg-ivory-50 px-6 py-4">
          <h2 className="text-lg font-serif font-medium text-navy-900">{editing ? 'Manage Collection' : 'New Collection'}</h2>
          <button onClick={onClose} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
        </div>

        <div className="space-y-5 p-6">
          {/* Collection Name */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Collection Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} className="input-luxury" placeholder="e.g. Royal Bridal 2025" />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. royal-bridal-2025" className="input-luxury" />
          </div>

          {/* Banner Image */}
          <MediaPicker
            value={form.banner_image}
            onChange={(url) => setForm({ ...form, banner_image: url })}
            label="Banner Image"
            folder="homepage_banners"
          />

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-luxury resize-none" placeholder="Describe this collection's theme and inspiration..." />
          </div>

          {/* Collection Type */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Collection Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {collectionTypeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, collection_type: form.collection_type === t ? '' : t })}
                  className={`rounded-luxury border px-3 py-2 text-xs font-medium transition-all ${
                    form.collection_type === t
                      ? 'border-gold-500 bg-gold-50 text-gold-900 shadow-gold'
                      : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300 hover:bg-ivory-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Product */}
          <CoverProductPicker
            coverProductId={form.cover_product_id}
            onSelect={(pid) => setForm({ ...form, cover_product_id: pid })}
          />

          {/* Product membership */}
          {editing && (
            <CollectionProductManager
              memberIds={memberProductIds}
              setMemberIds={setMemberProductIds}
              loading={membersLoading}
            />
          )}

          <button
            onClick={saveAll}
            disabled={saving || !form.name || !form.slug}
            className="flex w-full items-center justify-center gap-2 rounded-luxury bg-navy-900 py-3 text-xs font-medium uppercase tracking-[0.1em] text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editing ? 'Update Collection' : 'Create Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Cover product picker ─────────────────────────────────────────── */

function CoverProductPicker({
  coverProductId,
  onSelect,
}: {
  coverProductId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; title: string; code: string | null }[]>([]);
  const [selected, setSelected] = useState<{ id: string; title: string; code: string | null } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!coverProductId) { setSelected(null); return; }
    supabase.from('products').select('id, title, code').eq('id', coverProductId).maybeSingle().then(({ data }) => {
      setSelected(data ?? null);
    });
  }, [coverProductId]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const data = await searchProducts(query.trim());
      setResults(data);
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">Cover Product</label>
      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-luxury border border-gold-200 bg-gold-50/50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-gold-600" />
            <div>
              <p className="text-sm font-medium text-navy-900">{selected.title}</p>
              <p className="text-xs font-light text-charcoal-400">{selected.code ?? 'No code'}</p>
            </div>
          </div>
          <button onClick={() => { onSelect(''); setQuery(''); setResults([]); }} className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50" aria-label="Remove cover product">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Product Name or Design Number..."
            className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:ring-2 focus:ring-gold-200 focus:outline-none"
          />
          {searching && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-charcoal-300" />}
        </div>
      )}

      {!selected && results.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-luxury border border-navy-50 bg-white shadow-soft">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p.id); setQuery(''); setResults([]); }}
              className="flex w-full items-center justify-between gap-3 border-b border-navy-50 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-ivory-50"
            >
              <div>
                <p className="text-sm font-medium text-navy-900">{p.title}</p>
                <p className="text-xs font-light text-charcoal-400">{p.code ?? 'No code'}</p>
              </div>
              <Check size={16} className="shrink-0 text-gold-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Collection product membership manager ───────────────────────── */

function CollectionProductManager({
  memberIds,
  setMemberIds,
  loading,
}: {
  memberIds: string[];
  setMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; title: string; code: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [members, setMembers] = useState<{ id: string; title: string; code: string | null }[]>([]);

  useEffect(() => {
    if (memberIds.length === 0) { setMembers([]); return; }
    supabase.from('products').select('id, title, code').in('id', memberIds).then(({ data }) => {
      const ordered = (memberIds.map((id) => data?.find((p) => p.id === id)).filter(Boolean) as { id: string; title: string; code: string | null }[]);
      setMembers(ordered);
    });
  }, [memberIds]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const data = await searchProducts(query.trim());
      setResults(data.filter((p) => !memberIds.includes(p.id)));
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query, memberIds]);

  const addProduct = (p: { id: string; title: string; code: string | null }) => {
    setMemberIds([...memberIds, p.id]);
    setQuery('');
    setResults([]);
  };

  const removeProduct = (pid: string) => {
    setMemberIds(memberIds.filter((id) => id !== pid));
  };

  return (
    <div className="border-t border-navy-50 pt-5">
      <p className="mb-2.5 text-xs uppercase tracking-[0.12em] text-charcoal-600">Products in this Collection ({members.length})</p>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Add products by Name or Design Number..."
          className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:ring-2 focus:ring-gold-200 focus:outline-none"
        />
        {searching && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-charcoal-300" />}
      </div>

      {results.length > 0 && (
        <div className="mb-3 overflow-hidden rounded-luxury border border-navy-50 bg-white shadow-soft">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => addProduct(p)}
              className="flex w-full items-center justify-between gap-3 border-b border-navy-50 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-ivory-50"
            >
              <div>
                <p className="text-sm font-medium text-navy-900">{p.title}</p>
                <p className="text-xs font-light text-charcoal-400">{p.code ?? 'No code'}</p>
              </div>
              <Plus size={16} className="shrink-0 text-gold-600" />
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-luxury" />)}</div>
      ) : members.length === 0 ? (
        <p className="rounded-luxury border border-dashed border-navy-100 bg-ivory-50 px-4 py-3 text-center text-xs font-light text-charcoal-400">
          No products in this collection yet. Search above to add products.
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-luxury border border-navy-50 bg-white px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-50 text-[10px] font-medium text-navy-700">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-navy-900">{p.title}</p>
                  <p className="text-xs font-light text-charcoal-400">{p.code ?? 'No code'}</p>
                </div>
              </div>
              <button onClick={() => removeProduct(p.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50" aria-label={`Remove ${p.title}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
