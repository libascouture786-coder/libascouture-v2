import { useEffect, useState } from 'react';
import {
  Eye, EyeOff, ChevronUp, ChevronDown, Loader2, GripVertical,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchHomepageSections, updateHomepageSection } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { HomepageSection } from '@/lib/admin-types';

export function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
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
    </AdminLayout>
  );
}
