import { useEffect, useState } from 'react';
import {
  Upload, Search, Trash2, Image as ImageIcon, Video, Folder,
  Loader2, Grid3x3,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchMedia, insertMedia, deleteMedia } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { MediaAsset } from '@/lib/admin-types';

const folders = [
  { key: 'all', label: 'All Media', icon: Grid3x3 },
  { key: 'brand_assets', label: 'Brand Assets', icon: Folder },
  { key: 'homepage_banners', label: 'Homepage Banners', icon: Folder },
  { key: 'category_images', label: 'Category Images', icon: Folder },
  { key: 'product_images', label: 'Product Images', icon: Folder },
  { key: 'product_videos', label: 'Product Videos', icon: Video },
  { key: 'real_brides', label: 'Real Brides', icon: Folder },
  { key: 'atelier', label: 'Atelier', icon: Folder },
  { key: 'social_media', label: 'Social Media', icon: Folder },
  { key: 'custom_uploads', label: 'Custom Design Uploads', icon: Folder },
];

export function AdminMedia() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFolder, setUploadFolder] = useState('product_images');
  const [uploading, setUploading] = useState(false);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await fetchMedia(activeFolder === 'all' ? undefined : activeFolder);
    setMedia(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [activeFolder]);

  let display = media;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((m) => m.name.toLowerCase().includes(q) || m.folder.toLowerCase().includes(q));
  }
  if (sort === 'oldest') display = [...display].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  if (sort === 'az') display = [...display].sort((a, b) => a.name.localeCompare(b.name));

  const handleUpload = async () => {
    if (!uploadUrl.trim()) return;
    setUploading(true);
    const name = uploadUrl.split('/').pop()?.split('?')[0] ?? 'unnamed';
    const isVideo = /\.(mp4|webm|mov|avi)(\?|$)/i.test(uploadUrl);
    const asset = await insertMedia({
      name, url: uploadUrl.trim(), type: isVideo ? 'video' : 'image',
      folder: uploadFolder, size_bytes: null, width: null, height: null,
      alt_text: null, usage_type: null,
    });
    if (asset) {
      notify('Media uploaded successfully.');
      setUploadUrl('');
      load();
    } else {
      notify('Failed to upload media.', 'error');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMedia(id);
    notify('Media deleted.');
    load();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Media Library</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">{display.length} assets</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Folders sidebar */}
        <div className="space-y-1">
          {folders.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFolder(f.key)}
                className={`flex w-full items-center gap-2.5 rounded-luxury px-3 py-2.5 text-sm font-light transition-colors ${
                  activeFolder === f.key ? 'bg-gold-50 font-medium text-gold-800' : 'text-charcoal-600 hover:bg-ivory-200'
                }`}
              >
                <Icon size={16} strokeWidth={1.5} /> {f.label}
              </button>
            );
          })}
        </div>

        {/* Media grid */}
        <div>
          {/* Upload bar */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="Paste image/video URL to add..."
              className="input-luxury flex-1"
            />
            <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} className="input-luxury appearance-none sm:w-48">
              {folders.filter((f) => f.key !== 'all').map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
            <button onClick={handleUpload} disabled={uploading || !uploadUrl.trim()} className="flex items-center justify-center gap-1.5 rounded-luxury bg-navy-900 px-5 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
            </button>
          </div>

          {/* Search + sort */}
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none">
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="az">Alphabetical</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-luxury" />)}
            </div>
          ) : display.length === 0 ? (
            <div className="py-16 text-center">
              <ImageIcon size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
              <p className="mt-3 text-sm font-light text-charcoal-400">No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {display.map((asset) => (
                <div key={asset.id} className="group relative aspect-square overflow-hidden rounded-luxury border border-navy-50 bg-ivory-100">
                  {asset.type === 'video' ? (
                    <div className="flex h-full w-full items-center justify-center bg-navy-900">
                      <Video size={24} className="text-ivory-100" />
                    </div>
                  ) : (
                    <img src={asset.url} alt={asset.alt_text ?? asset.name} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="w-full p-2">
                      <p className="truncate text-[10px] font-light text-ivory-100">{asset.name}</p>
                      <p className="text-[9px] font-light text-ivory-200/60">{asset.folder}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-soft opacity-0 transition-all hover:scale-110 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
