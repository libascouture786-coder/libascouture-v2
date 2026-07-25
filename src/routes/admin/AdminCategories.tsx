import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader2, FolderOpen, X } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchCategories, insertCategory, updateCategory, deleteCategory } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';

type Category = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_key: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
};

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ slug: '', title: '', excerpt: '', image_key: '' });
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await fetchCategories();
    setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setCreating(true);
    setForm({ slug: '', title: '', excerpt: '', image_key: '' });
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ slug: cat.slug, title: cat.title, excerpt: cat.excerpt ?? '', image_key: cat.image_key ?? '' });
  };

  const save = async () => {
    setSaving(true);
    if (editing) {
      await updateCategory(editing.id, { slug: form.slug, title: form.title, excerpt: form.excerpt || null, image_key: form.image_key || null });
      notify('Category updated.');
    } else {
      await insertCategory({ slug: form.slug, title: form.title, excerpt: form.excerpt || undefined, image_key: form.image_key || undefined });
      notify('Category created.');
    }
    setSaving(false);
    setEditing(null);
    setCreating(false);
    load();
  };

  const remove = async (id: string) => {
    await deleteCategory(id);
    notify('Category deleted.');
    load();
  };

  const toggleActive = async (cat: Category) => {
    await updateCategory(cat.id, { is_active: !cat.is_active });
    load();
    notify(`Category ${cat.is_active ? 'deactivated' : 'activated'}.`);
  };

  const isOpen = creating || editing !== null;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Categories & Collections</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800">
          <Plus size={14} /> New Category
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-luxury" />)}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="group rounded-luxury border border-navy-50 bg-white p-4 shadow-soft transition-colors hover:border-gold-200">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  <FolderOpen size={18} strokeWidth={1.5} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(cat)} className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-ivory-200 text-charcoal-400'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-navy-900">{cat.title}</p>
              <p className="text-xs font-light text-charcoal-400">/{cat.slug}</p>
              {cat.excerpt && <p className="mt-1 text-xs font-light text-charcoal-500 line-clamp-2">{cat.excerpt}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => openEdit(cat)} className="flex-1 rounded-luxury border border-navy-50 py-1.5 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200">Edit</button>
                <button onClick={() => remove(cat.id)} className="flex h-8 w-8 items-center justify-center rounded-luxury border border-navy-50 text-red-500 transition-colors hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => { setEditing(null); setCreating(false); }} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-ivory-50 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-navy-50 bg-ivory-50 px-6 py-4">
              <h2 className="text-lg font-serif font-medium text-navy-900">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-luxury w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. bridal-lehengas" className="input-luxury w-full" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Excerpt</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="input-luxury w-full resize-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Image Key</label>
                <input type="text" value={form.image_key} onChange={(e) => setForm({ ...form, image_key: e.target.value })} placeholder="e.g. collections/bridal" className="input-luxury w-full" />
              </div>
              <button onClick={save} disabled={saving || !form.title || !form.slug} className="flex w-full items-center justify-center gap-2 rounded-luxury bg-navy-900 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {editing ? 'Update' : 'Create'} Category
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
