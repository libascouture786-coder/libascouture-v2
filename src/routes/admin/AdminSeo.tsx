import { useEffect, useState } from 'react';
import { Save, Search, Loader2, Globe } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchSeoSettings, updateSeoSetting } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { SeoSetting } from '@/lib/admin-types';

export function AdminSeo() {
  const [settings, setSettings] = useState<SeoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<SeoSetting | null>(null);
  const [form, setForm] = useState<Partial<SeoSetting>>({});
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    fetchSeoSettings().then((data) => { setSettings(data); setLoading(false); });
  }, []);

  let display = settings;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((s) => s.entity_type.toLowerCase().includes(q) || (s.url_slug ?? '').toLowerCase().includes(q) || (s.meta_title ?? '').toLowerCase().includes(q));
  }

  const openEditor = (s: SeoSetting) => {
    setEditing(s);
    setForm({
      meta_title: s.meta_title,
      meta_description: s.meta_description,
      url_slug: s.url_slug,
      canonical_url: s.canonical_url,
      og_title: s.og_title,
      og_description: s.og_description,
      og_image: s.og_image,
      twitter_card_image: s.twitter_card_image,
      is_indexed: s.is_indexed,
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await updateSeoSetting(editing.id, form);
    setSettings((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...form } : s));
    setSaving(false);
    setEditing(null);
    notify('SEO settings saved.');
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-h2 font-serif font-medium text-navy-900">SEO Manager</h1>
        <p className="mt-1 text-sm font-light text-charcoal-500">Manage meta tags, Open Graph, and indexing for pages, products, and categories.</p>
      </div>

      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by entity type, slug, or title..." className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-luxury" />)}</div>
      ) : (
        <div className="space-y-2">
          {display.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-luxury border border-navy-50 bg-white p-4 shadow-soft transition-colors hover:border-gold-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <Globe size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900">{s.entity_type}{s.entity_id ? ` · ${s.entity_id}` : ''}</p>
                <p className="text-xs font-light text-charcoal-400">{s.meta_title ?? 'No title'} · /{s.url_slug ?? 'no-slug'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${s.is_indexed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {s.is_indexed ? 'Indexed' : 'No-index'}
              </span>
              <button onClick={() => openEditor(s)} className="rounded-luxury bg-navy-900 px-4 py-2 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800">Edit</button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative h-full w-full max-w-lg overflow-y-auto bg-ivory-50 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-navy-50 bg-ivory-50 px-6 py-4">
              <h2 className="text-lg font-serif font-medium text-navy-900">SEO: {editing.entity_type}</h2>
              <button onClick={() => setEditing(null)} className="text-charcoal-400 hover:text-navy-900 text-sm">Close</button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Meta Title</label>
                <input type="text" value={form.meta_title ?? ''} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} maxLength={60} className="input-luxury w-full" />
                <p className="mt-1 text-[10px] font-light text-charcoal-400">{(form.meta_title ?? '').length}/60 characters</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Meta Description</label>
                <textarea value={form.meta_description ?? ''} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} maxLength={160} rows={3} className="input-luxury w-full resize-none" />
                <p className="mt-1 text-[10px] font-light text-charcoal-400">{(form.meta_description ?? '').length}/160 characters</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">URL Slug</label>
                <input type="text" value={form.url_slug ?? ''} onChange={(e) => setForm({ ...form, url_slug: e.target.value })} className="input-luxury w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Canonical URL</label>
                <input type="url" value={form.canonical_url ?? ''} onChange={(e) => setForm({ ...form, canonical_url: e.target.value })} className="input-luxury w-full" />
              </div>
              <div className="border-t border-navy-50 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-charcoal-400">Open Graph</p>
                <div className="space-y-3">
                  <input type="text" value={form.og_title ?? ''} onChange={(e) => setForm({ ...form, og_title: e.target.value })} placeholder="OG Title" className="input-luxury w-full" />
                  <textarea value={form.og_description ?? ''} onChange={(e) => setForm({ ...form, og_description: e.target.value })} placeholder="OG Description" rows={2} className="input-luxury w-full resize-none" />
                  <input type="url" value={form.og_image ?? ''} onChange={(e) => setForm({ ...form, og_image: e.target.value })} placeholder="OG Image URL" className="input-luxury w-full" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Twitter Card Image</label>
                <input type="url" value={form.twitter_card_image ?? ''} onChange={(e) => setForm({ ...form, twitter_card_image: e.target.value })} className="input-luxury w-full" />
              </div>
              <label className="flex items-center gap-2 text-sm font-light text-charcoal-600">
                <input type="checkbox" checked={form.is_indexed ?? true} onChange={(e) => setForm({ ...form, is_indexed: e.target.checked })} className="h-4 w-4 accent-navy-900" /> Allow search engines to index
              </label>
              <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-luxury bg-navy-900 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save SEO Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
