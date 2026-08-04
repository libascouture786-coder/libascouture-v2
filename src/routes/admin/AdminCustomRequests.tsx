import { useEffect, useState } from 'react';
import { Search, Eye, X, Palette } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PreviewButton } from '@/components/admin/PreviewButton';
import { fetchCustomisationRequests, updateCustomisationRequest } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';

type CustomRequest = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string | null;
  outfit_category: string | null;
  occasion: string | null;
  budget_range: string | null;
  design_style: string | null;
  fabric_preference: string | null;
  color_preference: string | null;
  embroidery_preference: string | null;
  customisation_options: string[] | null;
  timeline: string | null;
  details: string | null;
  inspiration_urls: string[] | null;
  consultation_type: string | null;
  status: string;
  created_at: string;
};

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_review', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  in_review: 'bg-blue-50 text-blue-700',
  approved: 'bg-green-50 text-green-700',
  completed: 'bg-navy-50 text-navy-700',
  rejected: 'bg-red-50 text-red-700',
};

export function AdminCustomRequests() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await fetchCustomisationRequests(statusFilter);
    setRequests(data as CustomRequest[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  let display = requests;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.mobile.includes(q));
  }

  const updateStatus = async (id: string, status: string) => {
    await updateCustomisationRequest(id, { status });
    notify(`Request marked as ${status}.`);
    load();
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Custom Design Requests</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">{display.length} requests</p>
        </div>
        <PreviewButton to="/create-your-own" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, mobile..." className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {statusFilters.map((f) => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`whitespace-nowrap rounded-luxury px-3 py-2 text-xs font-medium transition-colors ${statusFilter === f.key ? 'bg-navy-900 text-ivory-100' : 'bg-white text-charcoal-500 hover:bg-ivory-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-luxury" />)}</div>
      ) : display.length === 0 ? (
        <div className="py-16 text-center">
          <Palette size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
          <p className="mt-3 text-sm font-light text-charcoal-400">No custom design requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((req) => (
            <div key={req.id} className="flex items-center gap-4 rounded-luxury border border-navy-50 bg-white p-4 shadow-soft transition-colors hover:border-gold-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                <Palette size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900">{req.name}</p>
                <p className="text-xs font-light text-charcoal-400">{req.email} · {req.mobile}{req.city ? ` · ${req.city}` : ''}</p>
                <p className="mt-0.5 text-xs font-light text-charcoal-500">{req.outfit_category ?? 'N/A'} · {req.occasion ?? 'N/A'} · {req.budget_range ?? 'N/A'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[req.status ?? 'pending'] ?? 'bg-ivory-200 text-charcoal-400'}`}>
                {(req.status ?? 'pending').replace(/_/g, ' ')}
              </span>
              <button onClick={() => setSelected(req)} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200">
                <Eye size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-ivory-50 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-navy-50 bg-ivory-50 px-6 py-4">
              <h2 className="text-lg font-serif font-medium text-navy-900">Request Details</h2>
              <button onClick={() => setSelected(null)} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Customer</p>
                <p className="text-sm font-medium text-navy-900">{selected.name}</p>
                <p className="text-xs font-light text-charcoal-500">{selected.email} · {selected.mobile}{selected.city ? ` · ${selected.city}` : ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Outfit</span><p className="font-light text-navy-900">{selected.outfit_category ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Occasion</span><p className="font-light text-navy-900">{selected.occasion ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Budget</span><p className="font-light text-navy-900">{selected.budget_range ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Style</span><p className="font-light text-navy-900">{selected.design_style ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Fabric</span><p className="font-light text-navy-900">{selected.fabric_preference ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Color</span><p className="font-light text-navy-900">{selected.color_preference ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Embroidery</span><p className="font-light text-navy-900">{selected.embroidery_preference ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Timeline</span><p className="font-light text-navy-900">{selected.timeline ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Consultation</span><p className="font-light text-navy-900">{selected.consultation_type ?? '—'}</p></div>
              </div>
              {selected.customisation_options && selected.customisation_options.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Customisation Options</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selected.customisation_options.map((opt, i) => <span key={i} className="rounded-full bg-gold-50 px-2.5 py-0.5 text-[10px] font-medium text-gold-800">{opt}</span>)}
                  </div>
                </div>
              )}
              {selected.details && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Details</p>
                  <p className="mt-1 text-sm font-light text-charcoal-600">{selected.details}</p>
                </div>
              )}
              {selected.inspiration_urls && selected.inspiration_urls.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Inspiration Images</p>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {selected.inspiration_urls.map((url, i) => <img key={i} src={url} alt={`Inspiration ${i + 1}`} className="aspect-square rounded-luxury object-cover" />)}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Submitted</p>
                <p className="text-sm font-light text-charcoal-500">{new Date(selected.created_at).toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-navy-50 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-charcoal-400">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in_review', 'approved', 'completed', 'rejected'].map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} className={`rounded-luxury px-3 py-1.5 text-xs font-medium transition-colors ${(selected.status ?? 'pending') === s ? 'bg-navy-900 text-ivory-100' : 'bg-white text-charcoal-500 hover:bg-ivory-200'}`}>
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
