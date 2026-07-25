import { useEffect, useState } from 'react';
import { Search, Eye, X, Calendar, MapPin, User, Phone, Mail, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAppointments, updateAppointment } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';

type Appointment = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string | null;
  consultation_type: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  outfit_category: string | null;
  occasion: string | null;
  budget_range: string | null;
  timeline: string | null;
  notes: string | null;
  is_outstation: boolean | null;
  status: string | null;
  created_at: string;
};

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'rescheduled', label: 'Rescheduled' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  rescheduled: 'bg-blue-50 text-blue-700',
  completed: 'bg-navy-50 text-navy-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await fetchAppointments(statusFilter);
    setAppointments(data as Appointment[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  let display = appointments;
  if (search) {
    const q = search.toLowerCase();
    display = display.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.mobile.includes(q));
  }

  const updateStatus = async (id: string, status: string) => {
    await updateAppointment(id, { status });
    notify(`Appointment ${status}.`);
    load();
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-h2 font-serif font-medium text-navy-900">Appointments</h1>
        <p className="mt-1 text-sm font-light text-charcoal-500">{display.length} appointments</p>
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
          <Calendar size={32} className="mx-auto text-charcoal-300" strokeWidth={1} />
          <p className="mt-3 text-sm font-light text-charcoal-400">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((apt) => (
            <div key={apt.id} className="flex items-center gap-4 rounded-luxury border border-navy-50 bg-white p-4 shadow-soft transition-colors hover:border-gold-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <Calendar size={18} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-navy-900">{apt.name}</p>
                  {apt.is_outstation && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-medium text-blue-600">Outstation</span>}
                </div>
                <p className="text-xs font-light text-charcoal-400">{apt.email} · {apt.mobile}{apt.city ? ` · ${apt.city}` : ''}</p>
                <p className="mt-0.5 text-xs font-light text-charcoal-500">
                  {apt.consultation_type ?? 'N/A'} · {apt.preferred_date ?? 'No date'} · {apt.preferred_time ?? 'No time'}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusColors[apt.status ?? 'pending'] ?? 'bg-ivory-200 text-charcoal-400'}`}>
                {(apt.status ?? 'pending').replace(/_/g, ' ')}
              </span>
              <button onClick={() => setSelected(apt)} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-50 text-charcoal-500 transition-colors hover:bg-ivory-200">
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
              <h2 className="text-lg font-serif font-medium text-navy-900">Appointment Details</h2>
              <button onClick={() => setSelected(null)} className="text-charcoal-400 hover:text-navy-900"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><User size={14} className="text-charcoal-400" /><span className="font-medium text-navy-900">{selected.name}</span></div>
                <div className="flex items-center gap-2 text-xs font-light text-charcoal-500"><Mail size={12} /> {selected.email}</div>
                <div className="flex items-center gap-2 text-xs font-light text-charcoal-500"><Phone size={12} /> {selected.mobile}</div>
                {selected.city && <div className="flex items-center gap-2 text-xs font-light text-charcoal-500"><MapPin size={12} /> {selected.city}{selected.is_outstation ? ' (Outstation)' : ''}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Consultation</span><p className="font-light text-navy-900">{selected.consultation_type ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Date</span><p className="font-light text-navy-900">{selected.preferred_date ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Time</span><p className="font-light text-navy-900">{selected.preferred_time ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Outfit</span><p className="font-light text-navy-900">{selected.outfit_category ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Occasion</span><p className="font-light text-navy-900">{selected.occasion ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Budget</span><p className="font-light text-navy-900">{selected.budget_range ?? '—'}</p></div>
                <div><span className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Timeline</span><p className="font-light text-navy-900">{selected.timeline ?? '—'}</p></div>
              </div>
              {selected.notes && (
                <div><p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Notes</p><p className="mt-1 text-sm font-light text-charcoal-600">{selected.notes}</p></div>
              )}
              <div><p className="text-xs font-medium uppercase tracking-wider text-charcoal-400">Requested</p><p className="text-sm font-light text-charcoal-500">{new Date(selected.created_at).toLocaleString('en-IN')}</p></div>
              <div className="border-t border-navy-50 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-charcoal-400">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { s: 'confirmed', icon: CheckCircle2 },
                    { s: 'rescheduled', icon: CalendarClock },
                    { s: 'completed', icon: CheckCircle2 },
                    { s: 'cancelled', icon: XCircle },
                  ].map(({ s, icon: Icon }) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} className={`flex items-center gap-1.5 rounded-luxury px-3 py-1.5 text-xs font-medium transition-colors ${(selected.status ?? 'pending') === s ? 'bg-navy-900 text-ivory-100' : 'bg-white text-charcoal-500 hover:bg-ivory-200'}`}>
                      <Icon size={12} /> {s}
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
