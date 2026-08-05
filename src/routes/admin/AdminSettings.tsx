import { useEffect, useState } from 'react';
import { Save, Loader2, Settings, Phone, Clock, Globe, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PreviewButton } from '@/components/admin/PreviewButton';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { fetchSetting, updateSetting } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';

type BrandSettings = {
  brand_name: string;
  logo_url: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instagram_url: string;
  facebook_url: string;
  pinterest_url: string;
  youtube_url: string;
  monday_friday: string;
  saturday: string;
  sunday: string;
  maintenance_mode: boolean;
  maintenance_message: string;
};

const defaultSettings: BrandSettings = {
  brand_name: 'LIBAS COUTURE',
  logo_url: '',
  tagline: 'Bridal Couture Atelier',
  description: 'Luxury bridal couture and customisation atelier.',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'atelier@libascouture.com',
  address: '123 Fashion Street, Mumbai',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  instagram_url: 'https://instagram.com/libascouture',
  facebook_url: '',
  pinterest_url: '',
  youtube_url: '',
  monday_friday: '10:00 AM - 7:00 PM',
  saturday: '10:00 AM - 8:00 PM',
  sunday: 'By Appointment Only',
  maintenance_mode: false,
  maintenance_message: 'We are updating our atelier. Please check back soon.',
};

export function AdminSettings() {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    fetchSetting('brand_settings').then((data) => {
      if (data) setSettings({ ...defaultSettings, ...(data as Partial<BrandSettings>) });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await updateSetting('brand_settings', settings as unknown as Record<string, unknown>);
    setSaving(false);
    notify('Settings saved successfully.');
  };

  const update = <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <AdminLayout><div className="skeleton h-96 rounded-luxury" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-serif font-medium text-navy-900">Global Settings</h1>
          <p className="mt-1 text-sm font-light text-charcoal-500">Manage brand, contact, social, hours, and maintenance mode.</p>
        </div>
        <div className="flex items-center gap-2">
          <PreviewButton to="/" />
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-luxury bg-navy-900 px-5 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Settings
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Brand */}
        <Section title="Brand" icon={Settings}>
          <Field label="Brand Name"><input type="text" value={settings.brand_name} onChange={(e) => update('brand_name', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Tagline"><input type="text" value={settings.tagline} onChange={(e) => update('tagline', e.target.value)} className="input-luxury w-full" /></Field>
          <div className="sm:col-span-2">
            <MediaPicker
              value={settings.logo_url}
              onChange={(url) => update('logo_url', url)}
              label="Brand Logo"
              folder="brand_assets"
            />
          </div>
          <Field label="Description" full><textarea value={settings.description} onChange={(e) => update('description', e.target.value)} rows={2} className="input-luxury w-full resize-none" /></Field>
        </Section>

        {/* Contact */}
        <Section title="Contact" icon={Phone}>
          <Field label="Phone"><input type="text" value={settings.phone} onChange={(e) => update('phone', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="WhatsApp"><input type="text" value={settings.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Email"><input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Address" full><input type="text" value={settings.address} onChange={(e) => update('address', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="City"><input type="text" value={settings.city} onChange={(e) => update('city', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="State"><input type="text" value={settings.state} onChange={(e) => update('state', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Pincode"><input type="text" value={settings.pincode} onChange={(e) => update('pincode', e.target.value)} className="input-luxury w-full" /></Field>
        </Section>

        {/* Social */}
        <Section title="Social Media" icon={Globe}>
          <Field label="Instagram"><input type="url" value={settings.instagram_url} onChange={(e) => update('instagram_url', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Facebook"><input type="url" value={settings.facebook_url} onChange={(e) => update('facebook_url', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Pinterest"><input type="url" value={settings.pinterest_url} onChange={(e) => update('pinterest_url', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="YouTube"><input type="url" value={settings.youtube_url} onChange={(e) => update('youtube_url', e.target.value)} className="input-luxury w-full" /></Field>
        </Section>

        {/* Hours */}
        <Section title="Business Hours" icon={Clock}>
          <Field label="Mon - Fri"><input type="text" value={settings.monday_friday} onChange={(e) => update('monday_friday', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Saturday"><input type="text" value={settings.saturday} onChange={(e) => update('saturday', e.target.value)} className="input-luxury w-full" /></Field>
          <Field label="Sunday"><input type="text" value={settings.sunday} onChange={(e) => update('sunday', e.target.value)} className="input-luxury w-full" /></Field>
        </Section>

        {/* Maintenance */}
        <Section title="Maintenance Mode" icon={AlertTriangle}>
          <div className="col-span-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-light text-charcoal-600">
              <input type="checkbox" checked={settings.maintenance_mode} onChange={(e) => update('maintenance_mode', e.target.checked)} className="h-4 w-4 accent-navy-900" /> Enable maintenance mode
            </label>
          </div>
          <Field label="Maintenance Message" full><textarea value={settings.maintenance_message} onChange={(e) => update('maintenance_message', e.target.value)} rows={2} className="input-luxury w-full resize-none" /></Field>
        </Section>
      </div>
    </AdminLayout>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Settings; children: React.ReactNode }) {
  return (
    <div className="rounded-luxury border border-navy-50 bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-navy-700" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-navy-900">{title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-charcoal-400">{label}</label>
      {children}
    </div>
  );
}
