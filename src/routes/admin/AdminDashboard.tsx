import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle, FileEdit, EyeOff, Layers, Mail, CalendarHeart,
  CheckCheck, Wand2, Users, Plus, Image as ImageIcon, Settings, FileText,
   Clock, ArrowRight, TrendingUp,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAdminStats, fetchRecentActivity } from '@/lib/admin-api';
import type { AdminStats, AdminActivity } from '@/lib/admin-types';

const activityIcons: Record<string, typeof Package> = {
  product_added: Package,
  product_updated: Package,
  collection_created: Layers,
  banner_updated: ImageIcon,
  appointment_received: CalendarHeart,
  custom_design_request: Wand2,
  media_uploaded: ImageIcon,
  enquiry_received: Mail,
};

const activityColors: Record<string, string> = {
  product_added: 'text-green-600 bg-green-50',
  product_updated: 'text-blue-600 bg-blue-50',
  collection_created: 'text-purple-600 bg-purple-50',
  banner_updated: 'text-gold-600 bg-gold-50',
  appointment_received: 'text-navy-600 bg-navy-50',
  custom_design_request: 'text-pink-600 bg-pink-50',
  media_uploaded: 'text-teal-600 bg-teal-50',
  enquiry_received: 'text-orange-600 bg-orange-50',
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchRecentActivity(8)]).then(([s, a]) => {
      setStats(s);
      setActivity(a);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? '—', icon: Package, href: '/admin/products', color: 'text-navy-600 bg-navy-50' },
    { label: 'Active Products', value: stats?.activeProducts ?? '—', icon: CheckCircle, href: '/admin/products', color: 'text-green-600 bg-green-50' },
    { label: 'Draft Products', value: stats?.draftProducts ?? '—', icon: FileEdit, href: '/admin/products', color: 'text-charcoal-500 bg-ivory-200' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts ?? '—', icon: EyeOff, href: '/admin/products', color: 'text-red-500 bg-red-50' },
    { label: 'Collections', value: stats?.totalCollections ?? '—', icon: Layers, href: '/admin/collections', color: 'text-purple-600 bg-purple-50' },
    { label: 'New Enquiries', value: stats?.newEnquiries ?? '—', icon: Mail, href: '/admin/enquiries', color: 'text-orange-600 bg-orange-50' },
    { label: 'Pending Appointments', value: stats?.pendingAppointments ?? '—', icon: CalendarHeart, href: '/admin/appointments', color: 'text-gold-600 bg-gold-50' },
    { label: 'Completed Appointments', value: stats?.completedAppointments ?? '—', icon: CheckCheck, href: '/admin/appointments', color: 'text-teal-600 bg-teal-50' },
    { label: 'Custom Design Requests', value: stats?.recentCustomDesignRequests ?? '—', icon: Wand2, href: '/admin/custom-requests', color: 'text-pink-600 bg-pink-50' },
    { label: 'Website Visitors', value: stats?.websiteVisitors ?? '—', icon: Users, href: '/admin/analytics', color: 'text-blue-600 bg-blue-50' },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Plus, href: '/admin/products/new' },
    { label: 'Add Collection', icon: Layers, href: '/admin/collections' },
    { label: 'Upload Media', icon: ImageIcon, href: '/admin/media' },
    { label: 'View Enquiries', icon: Mail, href: '/admin/enquiries' },
    { label: 'View Appointments', icon: CalendarHeart, href: '/admin/appointments' },
    { label: 'Homepage Manager', icon: FileText, href: '/admin/homepage' },
    { label: 'Manage Categories', icon: Settings, href: '/admin/categories' },
    { label: 'Website Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-h2 font-serif font-medium text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm font-light text-charcoal-500">Welcome back. Here's what's happening at LIBAS COUTURE.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-luxury-lg" />)
          : cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.href}
                  className="group rounded-luxury-lg border border-navy-50 bg-white p-4 shadow-soft transition-all duration-luxury hover:-translate-y-0.5 hover:shadow-soft-md sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full ${card.color}`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <ArrowRight size={14} className="text-charcoal-300 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-3 text-2xl font-serif font-medium text-navy-900">{card.value}</p>
                  <p className="mt-0.5 text-xs font-light text-charcoal-500">{card.label}</p>
                </Link>
              );
            })}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.1em] text-charcoal-500">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center gap-2 rounded-luxury border border-navy-50 bg-white px-4 py-2.5 text-sm font-light text-navy-900 shadow-soft transition-all duration-luxury hover:border-gold-300 hover:shadow-soft-md"
              >
                <Icon size={16} strokeWidth={1.5} className="text-gold-600" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8 rounded-luxury-lg border border-navy-50 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.1em] text-charcoal-500">Recent Activity</h2>
          <TrendingUp size={16} className="text-gold-500" />
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-luxury" />)}
          </div>
        ) : activity.length === 0 ? (
          <p className="py-8 text-center text-sm font-light text-charcoal-400">No recent activity</p>
        ) : (
          <div className="space-y-1">
            {activity.map((item) => {
              const Icon = activityIcons[item.action_type] ?? Clock;
              const colorClass = activityColors[item.action_type] ?? 'text-charcoal-500 bg-ivory-200';
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-luxury px-3 py-2.5 transition-colors hover:bg-ivory-100">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon size={15} strokeWidth={1.5} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-light text-navy-900">{item.description}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-light text-charcoal-400">
                      <Clock size={10} />
                      {new Date(item.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {item.admin_email && <span>• by {item.admin_email}</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
