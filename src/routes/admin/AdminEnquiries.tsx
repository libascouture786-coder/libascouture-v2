import { useEffect, useState } from 'react';
import { Search, Eye, X, Download, Phone, Mail, Calendar, MessageSquare, Flag } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PreviewButton } from '@/components/admin/PreviewButton';
import { fetchEnquiries, updateEnquiry } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import type { AdminEnquiry } from '@/lib/admin-types';

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'closed', label: 'Closed' },
];

const priorityFilters = [
  { key: 'all', label: 'All Priority' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  qualified: 'bg-green-50 text-green-700',
  closed: 'bg-ivory-200 text-charcoal-500',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-ivory-200 text-charcoal-500',
};

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selected, setSelected] = useState<AdminEnquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    fetchEnquiries().then((data) => { setEnquiries(data); setLoading(false); });
  }, []);

  let display = enquiries;
  if (statusFilter !== 'all') display = display.filter((e) => e.status === statusFilter);
  if (priorityFilter !== 'all') display = display.filter((e) => e.lead_priority === priorityFilter);
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((e) => e.name.toLowerCase().includes(q) || e.mobile.includes(q) || (e.email ?? '').toLowerCase().includes(q));
  }

  const updateStatus = async (id: string, status: string) => {
    await updateEnquiry(id, { status });
    notify(`Enquiry marked as ${status}.`);
    fetchEnquiries().then(setEnquiries);
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const updatePriority = async (id: string, lead_priority: 'high' | 'medium' | 'low') => {
    await updateEnquiry(id, { lead_priority });
    notify(`Priority set to ${lead_priority}.`);
    fetchEnquiries().then(setEnquiries);
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, lead_priority } : null);
  };

  const saveFollowUp = async () => {
    if (!selected) return;
    await updateEnquiry(selected.id, {
      follow_up_date: followUpDate || null,
      follow_up_notes: notes || null,
      follow_up_status: notes ? 'scheduled' : null,
    });
    notify('Follow-up saved.');
    fetchEnquiries().then(setEnquiries);
  };

  const exportCsv = () => {
    const headers = ['Name', 'Mobile', 'Email', 'Type', 'Product Code', 'Category', 'Occasion', 'Budget', 'Event Date', 'Priority', 'Status', 'Created At'];
    const rows = display.map((e) => [e.name, e.mobile, e.email ?? '', e.enquiry_type, e.product_code ?? '', e.category ?? '', e.occasion ?? '', e.budget ?? '', e.event_date ?? '', e.lead_priority, e.status, new Date(e.created_at).toLocaleString('en-IN')]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'enquiries.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Enquiries</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">{display.length} enquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <PreviewButton to="/contact" />
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, mobile, email..." className="w-full rounded-luxury border border-navy-100 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none" />
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none">
          {priorityFilters.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
        </select>
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
          <MessageSquare size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
          <p className="mt-3 text-sm font-light text-charcoal-400">No enquiries found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((enq) => (
            <div key={enq.id} className="flex items-center gap-4 rounded-luxury border border-navy-50 bg-white p-4 shadow-soft transition-colors hover:border-gold-200">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-navy-900">{enq.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${priorityColors[enq.lead_priority]}`}>
                    <Flag size={8} className="mr-0.5 inline" />{enq.lead_priority}
                  </span>
                </div>
                <p className="text-xs font-light text-charcoal-400">{enq.mobile}{enq.email ? ` · ${enq.email}` : ''}</p>
                <p className="mt-0.5 text-xs font-light text-charcoal-500">
                  {enq.enquiry_type}{enq.product_code ? ` · ${enq.product_code}` : ''}{enq.occasion ? ` · ${enq.occasion}` : ''}{enq.budget ? ` · ${enq.budget}` : ''}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[enq.status] ?? 'bg-ivory-200 text-charcoal-400'}`}>{enq.status}</span>
              <button onClick={() => { setSelected(enq); setNotes(enq.follow_up_notes ?? ''); setFollowUpDate(enq.follow_up_date ?? ''); }} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200">
                <Eye size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-ivory-50 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-navy-50 bg-ivory-50 px-6 py-4">
              <h2 className="text-lg font-serif font-medium text-navy-900">Enquiry Details</h2>
              <button onClick={() => setSelected(null)} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-navy-900">{selected.name}</p>
                <div className="flex items-center gap-2 text-xs font-light text-charcoal-500"><Phone size={12} /> {selected.mobile}</div>
                {selected.email && <div className="flex items-center gap-2 text-xs font-light text-charcoal-500"><Mail size={12} /> {selected.email}</div>}
                {selected.event_date && <div className="flex items-center gap-2 text-xs font-light text-charcoal-500"><Calendar size={12} /> Event: {selected.event_date}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Type</span><p className="font-light text-navy-900">{selected.enquiry_type}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Product Code</span><p className="font-light text-navy-900">{selected.product_code ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Category</span><p className="font-light text-navy-900">{selected.category ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Occasion</span><p className="font-light text-navy-900">{selected.occasion ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Budget</span><p className="font-light text-navy-900">{selected.budget ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Customisation</span><p className="font-light text-navy-900">{selected.customisation ?? '—'}</p></div>
              </div>
              {selected.notes && <div><p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Notes</p><p className="mt-1 text-sm font-light text-charcoal-600">{selected.notes}</p></div>}
              <div><p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Received</p><p className="text-sm font-light text-charcoal-500">{new Date(selected.created_at).toLocaleString('en-IN')}</p></div>

              <div className="border-t border-navy-50 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-charcoal-400">Status</p>
                <div className="flex flex-wrap gap-2">
                  {['new', 'contacted', 'qualified', 'closed'].map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} className={`rounded-luxury px-3 py-1.5 text-xs font-medium transition-colors ${selected.status === s ? 'bg-navy-900 text-ivory-100' : 'bg-white text-charcoal-500 hover:bg-ivory-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-charcoal-400">Priority</p>
                <div className="flex flex-wrap gap-2">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button key={p} onClick={() => updatePriority(selected.id, p)} className={`rounded-luxury px-3 py-1.5 text-xs font-medium transition-colors ${selected.lead_priority === p ? 'bg-navy-900 text-ivory-100' : 'bg-white text-charcoal-500 hover:bg-ivory-200'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="border-t border-navy-50 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-charcoal-400">Follow-up</p>
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="input-luxury mb-2 w-full" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Follow-up notes..." rows={3} className="input-luxury w-full resize-none" />
                <button onClick={saveFollowUp} className="mt-2 w-full rounded-luxury bg-navy-900 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800">Save Follow-up</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
