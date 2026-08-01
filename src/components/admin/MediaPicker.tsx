import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Upload, Search, Trash2, X, Image as ImageIcon, Video, Loader2,
  Folder, Grid3x3, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchMedia, insertMedia } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { MediaAsset } from '@/lib/admin-types';

type MediaType = 'image' | 'video' | 'both';

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

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  mediaType?: MediaType;
  folder?: string;
  className?: string;
};

export function MediaPicker({
  value,
  onChange,
  label = 'Image',
  mediaType = 'image',
  folder = 'product_images',
  className = '',
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  const accept = mediaType === 'video' ? 'video/*' : mediaType === 'both' ? 'image/*,video/*' : 'image/*';

  const handleFileUpload = async (files: FileList) => {
    const file = Array.from(files).find((f) =>
      mediaType === 'video' ? f.type.startsWith('video/') :
      mediaType === 'image' ? f.type.startsWith('image/') :
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      const isVideo = file.type.startsWith('video/');
      await insertMedia({
        name: file.name, url: pub.publicUrl, type: isVideo ? 'video' : 'image',
        folder, size_bytes: file.size, width: null, height: null,
        alt_text: null, usage_type: null,
      });
      onChange(pub.publicUrl);
      notify(`${isVideo ? 'Video' : 'Image'} uploaded.`);
    } catch {
      notify('Failed to upload. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const isVideoUrl = /\.(mp4|webm|mov|avi)(\?|$)/i.test(value);

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">{label}</label>
      )}

      {value ? (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-luxury border border-navy-50 bg-ivory-100">
            {isVideoUrl ? (
              <video src={value} controls className="h-40 w-full object-contain" />
            ) : (
              <img src={value} alt="Preview" className="h-40 w-full object-cover" />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-3 py-2 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Replace
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-3 py-2 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200"
            >
              <ImageIcon size={13} /> Library
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center justify-center gap-1.5 rounded-luxury border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
          className={`cursor-pointer rounded-luxury border-2 border-dashed p-6 text-center transition-colors ${dragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300 hover:bg-ivory-50'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = ''; }}
          />
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold-50 text-gold-500">
            {uploading ? <Loader2 size={20} className="animate-pulse" /> : (mediaType === 'video' ? <Video size={20} strokeWidth={1.5} /> : <ImageIcon size={20} strokeWidth={1.5} />)}
          </div>
          <p className="mt-2 text-sm font-medium text-navy-900">{uploading ? 'Uploading...' : `Upload ${mediaType === 'video' ? 'video' : 'image'}`}</p>
          <p className="mt-1 text-xs font-light text-charcoal-400">Drag & drop or click to browse</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPickerOpen(true); }}
            className="mt-2 text-xs font-medium text-gold-700 hover:underline"
          >
            Or choose from Media Library
          </button>
        </div>
      )}

      {pickerOpen && (
        <MediaLibraryModal
          onClose={() => setPickerOpen(false)}
          onSelect={(url) => { onChange(url); setPickerOpen(false); }}
          mediaType={mediaType}
          folder={folder}
        />
      )}
    </div>
  );
}

/* ── Media Library Modal ─────────────────────────────────────────── */

function MediaLibraryModal({
  onClose,
  onSelect,
  mediaType,
  folder: defaultFolder,
}: {
  onClose: () => void;
  onSelect: (url: string) => void;
  mediaType: MediaType;
  folder: string;
}) {
  void defaultFolder;
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchMedia(activeFolder === 'all' ? undefined : activeFolder);
    setMedia(data);
    setLoading(false);
  }, [activeFolder]);

  useEffect(() => { load(); }, [load]);

  let display = media;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((m) => m.name.toLowerCase().includes(q) || m.folder.toLowerCase().includes(q));
  }
  if (mediaType === 'image') display = display.filter((m) => m.type === 'image');
  if (mediaType === 'video') display = display.filter((m) => m.type === 'video');

  const handleUpload = async (files: FileList) => {
    const file = Array.from(files).find((f) =>
      mediaType === 'video' ? f.type.startsWith('video/') :
      mediaType === 'image' ? f.type.startsWith('image/') :
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
      const isVideo = file.type.startsWith('video/');
      await insertMedia({
        name: file.name, url: pub.publicUrl, type: isVideo ? 'video' : 'image',
        folder: activeFolder === 'all' ? 'product_images' : activeFolder,
        size_bytes: file.size, width: null, height: null, alt_text: null, usage_type: null,
      });
      notify('Uploaded to library.');
      load();
    } catch {
      notify('Failed to upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-luxury-lg bg-ivory-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-50 bg-white px-6 py-4">
          <h2 className="text-lg font-serif font-medium text-navy-900">Media Library</h2>
          <button onClick={onClose} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Folders sidebar */}
          <div className="w-48 shrink-0 space-y-1 overflow-y-auto border-r border-navy-50 bg-white p-3">
            {folders.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFolder(f.key)}
                  className={`flex w-full items-center gap-2 rounded-luxury px-3 py-2 text-xs font-light transition-colors ${
                    activeFolder === f.key ? 'bg-gold-50 font-medium text-gold-800' : 'text-charcoal-600 hover:bg-ivory-200'
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} /> {f.label}
                </button>
              );
            })}
          </div>

          {/* Main area */}
          <div className="flex flex-1 flex-col overflow-hidden p-4">
            {/* Upload + search */}
            <div className="mb-3 flex gap-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files); }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-luxury border-2 border-dashed px-3 py-2 text-xs font-medium transition-colors ${dragActive ? 'border-gold-500 bg-gold-50' : 'border-navy-100 hover:border-gold-300'}`}
              >
                <input ref={fileInputRef} type="file" accept={mediaType === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={(e) => { if (e.target.files) handleUpload(e.target.files); e.target.value = ''; }} />
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload
              </div>
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-luxury border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm focus:border-gold-400 focus:outline-none" />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-luxury" />)}
                </div>
              ) : display.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <ImageIcon size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
                    <p className="mt-2 text-sm font-light text-charcoal-400">No media found</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {display.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => onSelect(asset.url)}
                      className="group relative aspect-square overflow-hidden rounded-luxury border border-navy-50 bg-ivory-100 transition-all hover:border-gold-400 hover:shadow-soft"
                    >
                      {asset.type === 'video' ? (
                        <div className="flex h-full w-full items-center justify-center bg-navy-900">
                          <Video size={24} className="text-ivory-100" />
                        </div>
                      ) : (
                        <img src={asset.url} alt={asset.alt_text ?? asset.name} className="h-full w-full object-cover" loading="lazy" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-navy-900">
                          <Check size={16} strokeWidth={3} />
                        </span>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 truncate bg-navy-950/60 px-1.5 py-0.5 text-[9px] font-light text-ivory-100">{asset.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
