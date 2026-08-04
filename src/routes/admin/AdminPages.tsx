import { useEffect, useState } from 'react';
import { Eye, EyeOff, Save, Loader2, FileText, Globe } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PreviewButton } from '@/components/admin/PreviewButton';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { fetchWebsitePages, updateWebsitePage } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { WebsitePage } from '@/lib/admin-types';

export function AdminPages() {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<WebsitePage | null>(null);
  const [title, setTitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    fetchWebsitePages().then((data) => { setPages(data); setLoading(false); });
  }, []);

  const openEditor = (page: WebsitePage) => {
    setEditing(page);
    setTitle(page.title);
    setHeroImage(page.hero_image ?? '');
    setIsVisible(page.is_visible);
    setIsPublished(page.is_published);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(editing.id);
    await updateWebsitePage(editing.id, { title, hero_image: heroImage || null, is_visible: isVisible, is_published: isPublished });
    setPages((prev) => prev.map((p) => p.id === editing.id ? { ...p, title, hero_image: heroImage || null, is_visible: isVisible, is_published: isPublished } : p));
    setSaving(null);
    setEditing(null);
    notify('Page updated successfully.');
  };

  const toggleVisible = async (page: WebsitePage) => {
    await updateWebsitePage(page.id, { is_visible: !page.is_visible });
    setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, is_visible: !p.is_visible } : p));
    notify(`${page.title} ${page.is_visible ? 'hidden' : 'shown'}.`);
  };

  const togglePublish = async (page: WebsitePage) => {
    await updateWebsitePage(page.id, { is_published: !page.is_published });
    setPages((prev) => prev.map((p) => p.id === page.id ? { ...p, is_published: !p.is_published } : p));
    notify(`${page.title} ${page.is_published ? 'unpublished' : 'published'}.`);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Website Pages</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">Manage page content, visibility, and publishing.</p>
        </div>
        <PreviewButton to="/" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-luxury" />)}</div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 rounded-luxury border border-navy-50 bg-white p-4 shadow-soft transition-colors hover:border-gold-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <FileText size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900">{page.title}</p>
                <p className="text-xs font-light text-charcoal-400">/{page.page_key.replace(/_/g, '-')}</p>
              </div>
              <div className="flex gap-1.5">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${page.is_published ? 'bg-green-50 text-green-700' : 'bg-ivory-200 text-charcoal-400'}`}>
                  {page.is_published ? 'Published' : 'Draft'}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${page.is_visible ? 'bg-blue-50 text-blue-700' : 'bg-ivory-200 text-charcoal-400'}`}>
                  {page.is_visible ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <button onClick={() => toggleVisible(page)} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200">
                {page.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => togglePublish(page)} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200">
                <Globe size={16} />
              </button>
              <button onClick={() => openEditor(page)} className="rounded-luxury bg-navy-900 px-4 py-2 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800">
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-ivory-50 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-navy-50 bg-ivory-50 px-6 py-4">
              <h2 className="text-lg font-serif font-medium text-navy-900">Edit Page</h2>
              <button onClick={() => setEditing(null)} className="text-charcoal-400 hover:text-navy-900 text-sm">Close</button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-luxury w-full" />
              </div>
              <MediaPicker
                value={heroImage}
                onChange={setHeroImage}
                label="Hero Image"
                folder="homepage_banners"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-light text-charcoal-600">
                  <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-4 w-4 accent-navy-900" /> Visible
                </label>
                <label className="flex items-center gap-2 text-sm font-light text-charcoal-600">
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4 accent-navy-900" /> Published
                </label>
              </div>
              <button onClick={save} disabled={saving !== null} className="flex w-full items-center justify-center gap-2 rounded-luxury bg-navy-900 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
