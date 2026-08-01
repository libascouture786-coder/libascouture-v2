import { useEffect, useState } from 'react';
import {
  Eye, EyeOff, ChevronUp, ChevronDown, Loader2, GripVertical,
  Pencil, X, Save,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { fetchHomepageSections, updateHomepageSection } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { HomepageSection } from '@/lib/admin-types';

export function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    fetchHomepageSections().then((data) => { setSections(data); setLoading(false); });
  }, []);

  const toggleVisible = async (section: HomepageSection) => {
    setSaving(section.id);
    await updateHomepageSection(section.id, { is_visible: !section.is_visible });
    setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, is_visible: !s.is_visible } : s));
    setSaving(null);
    notify(`${section.title} ${section.is_visible ? 'hidden' : 'shown'}.`);
  };

  const moveSection = async (index: number, dir: 'up' | 'down') => {
    const newOrder = [...sections];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    newOrder.forEach((s, i) => { s.sort_order = i; });
    setSections(newOrder);
    setSaving(newOrder[index].id);
    await updateHomepageSection(newOrder[index].id, { sort_order: newOrder[index].sort_order });
    await updateHomepageSection(newOrder[target].id, { sort_order: newOrder[target].sort_order });
    setSaving(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(editing.id);
    await updateHomepageSection(editing.id, { content: editing.content });
    setSections((prev) => prev.map((s) => s.id === editing.id ? { ...s, content: editing.content } : s));
    setSaving(null);
    setEditing(null);
    notify(`${editing.title} content saved.`);
  };

  const updateContent = (key: string, value: unknown) => {
    if (!editing) return;
    setEditing({ ...editing, content: { ...editing.content, [key]: value } });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-h2 font-serif font-medium text-navy-900">Homepage Manager</h1>
        <p className="mt-1 text-sm font-light text-charcoal-500">Control homepage sections — toggle visibility, reorder, and edit content.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-luxury" />)}</div>
      ) : (
        <div className="space-y-2">
          {sections.map((section, i) => (
            <div
              key={section.id}
              className={`flex items-center gap-3 rounded-luxury border bg-white p-4 shadow-soft transition-all ${
                section.is_visible ? 'border-navy-50' : 'border-navy-50 opacity-60'
              }`}
            >
              <GripVertical size={16} className="text-charcoal-300" />

              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveSection(i, 'up')} disabled={i === 0} className="text-charcoal-300 transition-colors hover:text-navy-900 disabled:opacity-30">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveSection(i, 'down')} disabled={i === sections.length - 1} className="text-charcoal-300 transition-colors hover:text-navy-900 disabled:opacity-30">
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900">{section.title}</p>
                <p className="text-xs font-light text-charcoal-400">{section.section_key.replace(/_/g, ' ')}</p>
              </div>

              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${section.is_visible ? 'bg-green-50 text-green-700' : 'bg-ivory-200 text-charcoal-400'}`}>
                {section.is_visible ? 'Visible' : 'Hidden'}
              </span>

              <button
                onClick={() => setEditing(section)}
                className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200 hover:text-navy-900"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => toggleVisible(section)}
                disabled={saving === section.id}
                className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200 disabled:opacity-50"
              >
                {saving === section.id ? <Loader2 size={16} className="animate-spin" /> : section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-luxury-lg bg-ivory-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-50 bg-white px-6 py-4">
              <h2 className="text-lg font-serif font-medium text-navy-900">Edit {editing.title}</h2>
              <button onClick={() => setEditing(null)} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <HomepageContentEditor section={editing} updateContent={updateContent} />
            </div>
            <div className="flex justify-end gap-2 border-t border-navy-50 bg-white px-6 py-4">
              <button onClick={() => setEditing(null)} className="rounded-luxury border border-navy-100 bg-white px-4 py-2 text-xs font-medium text-charcoal-600 hover:bg-ivory-200">Cancel</button>
              <button onClick={saveEdit} disabled={saving === editing.id} className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2 text-xs font-medium text-ivory-100 hover:bg-navy-800 disabled:opacity-50">
                {saving === editing.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Content
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* ── Homepage Content Editor ──────────────────────────────────────── */
function HomepageContentEditor({
  section,
  updateContent,
}: {
  section: HomepageSection;
  updateContent: (key: string, value: unknown) => void;
}) {
  const content = section.content ?? {};
  const keys = Object.keys(content);

  const imageKeys = keys.filter((k) => {
    const v = content[k];
    return typeof v === 'string' && (v.includes('.jpg') || v.includes('.png') || v.includes('.webp') || v.includes('http'));
  });
  const textKeys = keys.filter((k) => !imageKeys.includes(k));

  return (
    <div className="space-y-4">
      {imageKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Images</h3>
          {imageKeys.map((key) => (
            <MediaPicker
              key={key}
              value={content[key] as string}
              onChange={(url) => updateContent(key, url)}
              label={key.replace(/_/g, ' ')}
              folder="homepage_banners"
            />
          ))}
        </div>
      )}

      {textKeys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Text Content</h3>
          {textKeys.map((key) => {
            const val = content[key];
            if (Array.isArray(val)) {
              return (
                <div key={key}>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">{key.replace(/_/g, ' ')}</label>
                  <textarea
                    value={val.join(', ')}
                    onChange={(e) => updateContent(key, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    rows={2}
                    className="input-luxury w-full resize-none"
                  />
                </div>
              );
            }
            if (typeof val === 'object' && val !== null) {
              return (
                <div key={key}>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">{key.replace(/_/g, ' ')}</label>
                  <textarea
                    value={JSON.stringify(val, null, 2)}
                    onChange={(e) => {
                      try { updateContent(key, JSON.parse(e.target.value)); } catch { /* ignore parse errors while typing */ }
                    }}
                    rows={4}
                    className="input-luxury w-full resize-none font-mono text-xs"
                  />
                </div>
              );
            }
            return (
              <div key={key}>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-charcoal-600">{key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  value={String(val ?? '')}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="input-luxury w-full"
                />
              </div>
            );
          })}
        </div>
      )}

      {keys.length === 0 && (
        <p className="text-sm font-light text-charcoal-400">This section has no editable content fields.</p>
      )}
    </div>
  );
}
