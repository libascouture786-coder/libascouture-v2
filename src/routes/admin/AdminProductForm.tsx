import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, Copy, Loader2, Plus, X, Upload,
  Check,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { logActivity, fetchCategories } from '@/lib/admin-api';
import { useToast } from '@/context/ToastContext';
import {
  occasionOptions, fabricOptions,
  embroideryOptions, colorSwatches,
} from '@/config/customisation';

const productTypes = ['Handwork', 'Machine Work', 'Mixed Work', 'Custom Couture', 'Ready Piece'];
const priceTypes = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'price_on_request', label: 'Price on Request' },
];
const availabilityOptions = [
  { value: 'ready_to_ship', label: 'Ready In Stock' },
  { value: 'made_on_order', label: 'Made On Order' },
  { value: 'signature', label: 'Signature Collection' },
  { value: 'limited_availability', label: 'Limited Availability' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'archived', label: 'Archived' },
];
const includeOptions = ['Lehenga', 'Blouse', 'Kurti', 'Dupatta', 'Double Dupatta', 'Veil', 'Trail', 'Potli', 'Belt', 'Can Can', 'Tassels', 'Extra Fabric'];
const customisationFields = ['Colour', 'Fabric', 'Blouse', 'Neckline', 'Sleeves', 'Dupatta', 'Trail', 'Veil', 'Potli', 'Embroidery Level', 'Measurement Adjustments'];

type Section = 'details' | 'content' | 'fabric' | 'media' | 'seo' | 'settings';

export function AdminProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();

  const [categories, setCategories] = useState<{ id: string; slug: string; title: string }[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('details');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [form, setForm] = useState({
    title: '', slug: '', code: '', excerpt: '', description: '', story: '',
    styling_notes: '', event_suitability: '',
    category_id: '', category_slug: '', occasion: '', occasions: [] as string[],
    price: '', price_type: 'price_on_request', status: 'made_on_order',
    work_type: 'Handwork', fabric_main: '', fabric_blouse: '', fabric_dupatta: '',
    fabric_lining: '', colors: [] as string[], embroidery: [] as string[],
    includes: [] as string[], customisation_options: [] as string[],
    customisable: true, delivery_time: '', measurement_notes: '',
    is_featured: false, is_new: false, is_best_seller: false, is_active: false,
    seo_title: '', seo_description: '', image_alt_text: '',
  });

  useEffect(() => {
    fetchCategories().then((cats) => setCategories(cats.map((c: { id: string; slug: string; title: string }) => ({ id: c.id, slug: c.slug, title: c.title }))));
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (data) {
      setForm({
        title: data.title ?? '', slug: data.slug ?? '', code: data.code ?? '',
        excerpt: data.excerpt ?? '', description: data.description ?? '', story: data.story ?? '',
        styling_notes: data.styling_notes ?? '', event_suitability: data.event_suitability ?? '',
        category_id: data.category_id ?? '', category_slug: data.category_slug ?? '',
        occasion: data.occasion ?? '', occasions: data.occasions ?? [],
        price: data.price?.toString() ?? '', price_type: data.price_type ?? 'price_on_request',
        status: data.status ?? 'made_on_order', work_type: data.work_type ?? 'Handwork',
        fabric_main: data.fabric_main ?? '', fabric_blouse: data.fabric_blouse ?? '',
        fabric_dupatta: data.fabric_dupatta ?? '', fabric_lining: data.fabric_lining ?? '',
        colors: data.colors ?? [], embroidery: data.embroidery ?? [],
        includes: data.includes ?? [], customisation_options: data.customisation_options ?? [],
        customisable: data.customisable ?? true, delivery_time: data.delivery_time ?? '',
        measurement_notes: data.measurement_notes ?? '',
        is_featured: data.is_featured ?? false, is_new: data.is_new ?? false,
        is_best_seller: data.is_best_seller ?? false, is_active: data.is_active ?? false,
        seo_title: data.seo_title ?? '', seo_description: data.seo_description ?? '',
        image_alt_text: data.image_alt_text ?? '',
      });
      const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', id).order('sort_order');
      setImageUrls((imgs ?? []).map((img: { url: string }) => img.url));
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const update = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const toggleArray = (field: string, value: string) => {
    setForm((prev) => {
      const arr = prev[field as keyof typeof prev] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Product name is required';
    if (!form.code.trim()) errs.code = 'Design code is required';
    if (!form.category_id) errs.category_id = 'Category is required';
    if (!form.price_type) errs.price_type = 'Price type is required';
    if (!form.status) errs.status = 'Availability is required';
    if (imageUrls.length === 0) errs.images = 'At least one product image is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) { notify('Please complete all required fields.', 'error'); return; }
    setSaving(true);
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const productData = {
      ...form,
      slug,
      price: form.price ? parseFloat(form.price) : null,
      is_active: publish ? true : form.is_active,
      occasions: form.occasions,
      colors: form.colors,
      embroidery: form.embroidery,
      includes: form.includes,
      customisation_options: form.customisation_options,
    };

    try {
      let productId = id;
      if (isEdit && id) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
        await logActivity('product_updated', `Updated product: ${form.title}`, 'product', id);
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select('id').maybeSingle();
        if (error) throw error;
        productId = data?.id;
        await logActivity('product_added', `Added product: ${form.title}`, 'product', productId);
      }

      if (productId && imageUrls.length > 0) {
        if (isEdit) await supabase.from('product_images').delete().eq('product_id', productId);
        const imgInserts = imageUrls.map((url, i) => ({
          product_id: productId,
          url,
          alt: form.image_alt_text || form.title,
          sort_order: i,
          view_type: i === 0 ? 'hero' : 'gallery',
        }));
        await supabase.from('product_images').insert(imgInserts);
      }

      notify(publish ? 'Product published successfully.' : 'Product saved as draft.');
      navigate('/admin/products');
    } catch (err) {
      notify('Failed to save product. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    const slugDup = `${form.slug}-copy`;
    const { error } = await supabase.from('products').insert({
      ...form, slug: slugDup, code: `${form.code}-COPY`, title: `${form.title} (Copy)`,
      is_active: false, is_featured: false, is_new: false,
    });
    if (!error) { notify('Product duplicated successfully.'); navigate('/admin/products'); }
  };

  const sections: { key: Section; label: string }[] = [
    { key: 'details', label: 'Product Details' },
    { key: 'content', label: 'Content & Story' },
    { key: 'fabric', label: 'Fabric & Embroidery' },
    { key: 'media', label: 'Media & Gallery' },
    { key: 'seo', label: 'SEO Settings' },
    { key: 'settings', label: 'Flags & Settings' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="flex h-9 w-9 items-center justify-center rounded-luxury border border-navy-100 bg-white text-navy-900 transition-colors hover:bg-ivory-200">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-h2 font-serif font-medium text-navy-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
            <p className="mt-0.5 text-sm font-light text-charcoal-500">{isEdit ? form.title : 'Create a new couture piece'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <button onClick={handleDuplicate} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-charcoal-600 transition-colors hover:bg-ivory-200">
              <Copy size={14} /> Duplicate
            </button>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury border border-navy-100 bg-white px-4 py-2.5 text-xs font-medium text-navy-900 transition-colors hover:bg-ivory-200 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-1.5 rounded-luxury bg-gold-500 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Publish
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-navy-50 no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-light transition-colors ${
              activeSection === s.key
                ? 'border-gold-500 font-medium text-navy-900'
                : 'border-transparent text-charcoal-400 hover:text-navy-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-luxury-lg border border-navy-50 bg-white p-6 shadow-soft">
        {/* Details */}
        {activeSection === 'details' && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product Name *" error={errors.title}>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="input-luxury" placeholder="e.g. Royal Zardozi Bridal Lehenga" />
              </Field>
              <Field label="Design Code *" error={errors.code}>
                <input type="text" value={form.code} onChange={(e) => update('code', e.target.value)} className="input-luxury" placeholder="e.g. LC-2045" />
              </Field>
              <Field label="Category *" error={errors.category_id}>
                <select value={form.category_id} onChange={(e) => {
                  const cat = categories.find((c) => c.id === e.target.value);
                  update('category_id', e.target.value);
                  if (cat) update('category_slug', cat.slug);
                }} className="input-luxury appearance-none">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
              <Field label="Occasion">
                <select value={form.occasion} onChange={(e) => update('occasion', e.target.value)} className="input-luxury appearance-none">
                  <option value="">Select occasion</option>
                  {occasionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Product Type">
                <select value={form.work_type} onChange={(e) => update('work_type', e.target.value)} className="input-luxury appearance-none">
                  {productTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Price Type *" error={errors.price_type}>
                <select value={form.price_type} onChange={(e) => update('price_type', e.target.value)} className="input-luxury appearance-none">
                  {priceTypes.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              {form.price_type !== 'price_on_request' && (
                <Field label="Price (₹)">
                  <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)} className="input-luxury" placeholder="0" />
                </Field>
              )}
              <Field label="Availability *" error={errors.status}>
                <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input-luxury appearance-none">
                  {availabilityOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Short Summary">
              <textarea rows={2} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} className="input-luxury resize-none" placeholder="A brief one-line summary for product cards..." />
            </Field>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Occasions</p>
              <div className="flex flex-wrap gap-2">
                {occasionOptions.map((o) => (
                  <Chip key={o} label={o} selected={form.occasions.includes(o)} onClick={() => toggleArray('occasions', o)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeSection === 'content' && (
          <div className="space-y-5">
            <Field label="Detailed Description">
              <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className="input-luxury resize-none" placeholder="Full product description..." />
            </Field>
            <Field label="Couture Story">
              <textarea rows={3} value={form.story} onChange={(e) => update('story', e.target.value)} className="input-luxury resize-none" placeholder="The story behind this piece..." />
            </Field>
            <Field label="Styling Notes">
              <textarea rows={2} value={form.styling_notes} onChange={(e) => update('styling_notes', e.target.value)} className="input-luxury resize-none" placeholder="Styling suggestions..." />
            </Field>
            <Field label="Event Suitability">
              <input type="text" value={form.event_suitability} onChange={(e) => update('event_suitability', e.target.value)} className="input-luxury" placeholder="e.g. Wedding, Reception, Engagement" />
            </Field>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Included Items</p>
              <div className="flex flex-wrap gap-2">
                {includeOptions.map((item) => (
                  <Chip key={item} label={item} selected={form.includes.includes(item)} onClick={() => toggleArray('includes', item)} />
                ))}
              </div>
            </div>
            <Field label="Delivery Time">
              <input type="text" value={form.delivery_time} onChange={(e) => update('delivery_time', e.target.value)} className="input-luxury" placeholder="e.g. 6-8 weeks" />
            </Field>
            <Field label="Measurement Notes">
              <textarea rows={2} value={form.measurement_notes} onChange={(e) => update('measurement_notes', e.target.value)} className="input-luxury resize-none" placeholder="Measurement guidance..." />
            </Field>
          </div>
        )}

        {/* Fabric & Embroidery */}
        {activeSection === 'fabric' && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Outfit Fabric">
                <select value={form.fabric_main} onChange={(e) => update('fabric_main', e.target.value)} className="input-luxury appearance-none">
                  <option value="">Select fabric</option>
                  {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Blouse Fabric">
                <select value={form.fabric_blouse} onChange={(e) => update('fabric_blouse', e.target.value)} className="input-luxury appearance-none">
                  <option value="">Select fabric</option>
                  {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Dupatta Fabric">
                <select value={form.fabric_dupatta} onChange={(e) => update('fabric_dupatta', e.target.value)} className="input-luxury appearance-none">
                  <option value="">Select fabric</option>
                  {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Lining Fabric">
                <select value={form.fabric_lining} onChange={(e) => update('fabric_lining', e.target.value)} className="input-luxury appearance-none">
                  <option value="">Select fabric</option>
                  {fabricOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Colours</p>
              <div className="flex flex-wrap gap-3">
                {colorSwatches.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => toggleArray('colors', c.name)}
                    className={`flex items-center gap-2 rounded-luxury border p-2 transition-all ${form.colors.includes(c.name) ? 'border-gold-500 shadow-gold' : 'border-navy-50 hover:border-gold-300'}`}
                  >
                    <span className="h-6 w-6 rounded-full border border-navy-100" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs font-light text-charcoal-600">{c.name}</span>
                    {form.colors.includes(c.name) && <Check size={12} className="text-gold-600" strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Embroidery</p>
              <div className="flex flex-wrap gap-2">
                {embroideryOptions.map((e) => (
                  <Chip key={e} label={e} selected={form.embroidery.includes(e)} onClick={() => toggleArray('embroidery', e)} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-charcoal-600">Customisation Options</p>
              <div className="flex flex-wrap gap-2">
                {customisationFields.map((c) => (
                  <Chip key={c} label={c} selected={form.customisation_options.includes(c)} onClick={() => toggleArray('customisation_options', c)} />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-luxury border border-navy-50 bg-ivory-100 p-4">
              <input type="checkbox" checked={form.customisable} onChange={(e) => update('customisable', e.target.checked)} className="h-5 w-5 rounded border-navy-200 text-gold-500 focus:ring-gold-400" />
              <div>
                <p className="text-sm font-medium text-navy-900">Customisable</p>
                <p className="text-xs font-light text-charcoal-500">Allow customers to request customisations</p>
              </div>
            </label>
          </div>
        )}

        {/* Media */}
        {activeSection === 'media' && (
          <div className="space-y-5">
            <Field label="Gallery Images *" error={errors.images}>
              <div className="rounded-luxury border-2 border-dashed border-navy-100 p-6 text-center">
                <Upload size={28} strokeWidth={1.25} className="mx-auto text-gold-500" />
                <p className="mt-3 text-sm font-light text-charcoal-500">Drag & drop images or paste URLs below</p>
                <p className="mt-1 text-xs font-light text-charcoal-300">5–15 images recommended</p>
              </div>
            </Field>
            <div className="flex gap-2">
              <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="input-luxury flex-1" placeholder="Paste image URL..." />
              <button
                onClick={() => { if (newImageUrl.trim()) { setImageUrls((prev) => [...prev, newImageUrl.trim()]); setNewImageUrl(''); } }}
                className="flex items-center gap-1.5 rounded-luxury bg-navy-900 px-4 py-2.5 text-xs font-medium text-ivory-100 transition-colors hover:bg-navy-800"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {imageUrls.map((url, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-luxury border border-navy-50">
                    <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-soft transition-transform hover:scale-110"
                    >
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-gold-500 px-2 py-0.5 text-[9px] font-medium text-navy-900">Hero</span>}
                  </div>
                ))}
              </div>
            )}
            <Field label="Image Alt Text">
              <input type="text" value={form.image_alt_text} onChange={(e) => update('image_alt_text', e.target.value)} className="input-luxury" placeholder="Descriptive alt text for SEO..." />
            </Field>
          </div>
        )}

        {/* SEO */}
        {activeSection === 'seo' && (
          <div className="space-y-5">
            <Field label="SEO Title">
              <input type="text" value={form.seo_title} onChange={(e) => update('seo_title', e.target.value)} className="input-luxury" placeholder="SEO-optimized title..." />
            </Field>
            <Field label="SEO Description">
              <textarea rows={3} value={form.seo_description} onChange={(e) => update('seo_description', e.target.value)} className="input-luxury resize-none" placeholder="Meta description for search engines..." />
            </Field>
            <Field label="URL Slug">
              <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)} className="input-luxury" placeholder="auto-generated from title" />
            </Field>
          </div>
        )}

        {/* Settings */}
        {activeSection === 'settings' && (
          <div className="space-y-4">
            {[
              { key: 'is_featured', label: 'Featured', desc: 'Show in featured sections' },
              { key: 'is_new', label: 'New Arrival', desc: 'Mark as new arrival' },
              { key: 'is_best_seller', label: 'Best Seller', desc: 'Mark as best seller' },
              { key: 'is_active', label: 'Active', desc: 'Product is visible on website' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-3 rounded-luxury border border-navy-50 bg-ivory-100 p-4">
                <input
                  type="checkbox"
                  checked={form[flag.key as keyof typeof form] as boolean}
                  onChange={(e) => update(flag.key, e.target.checked)}
                  className="h-5 w-5 rounded border-navy-200 text-gold-500 focus:ring-gold-400"
                />
                <div>
                  <p className="text-sm font-medium text-navy-900">{flag.label}</p>
                  <p className="text-xs font-light text-charcoal-500">{flag.desc}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-charcoal-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-light transition-all ${selected ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-navy-50 bg-white text-charcoal-600 hover:border-gold-300'}`}
    >
      {label}
    </button>
  );
}
