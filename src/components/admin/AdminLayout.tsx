import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, Layers, Image, Wand2, CalendarHeart,
  Mail, Settings, FileText, Search as SearchIcon, BarChart3, LogOut,
  Bell, Menu, Check, AlertCircle, Info, Globe,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { getImage } from '@/config/images';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
} from '@/lib/admin-api';
import type { AdminNotification } from '@/lib/admin-types';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Collections', href: '/admin/collections', icon: Layers },
  { label: 'Media Library', href: '/admin/media', icon: Image },
  { label: 'Custom Design Requests', href: '/admin/custom-requests', icon: Wand2 },
  { label: 'Appointments', href: '/admin/appointments', icon: CalendarHeart },
  { label: 'Enquiries', href: '/admin/enquiries', icon: Mail },
  { label: 'Homepage Manager', href: '/admin/homepage', icon: LayoutDashboard },
  { label: 'Website Pages', href: '/admin/pages', icon: FileText },
  { label: 'SEO', href: '/admin/seo', icon: SearchIcon },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const priorityConfig = {
  high: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  medium: { icon: Info, color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/20' },
  low: { icon: Check, color: 'text-navy-300', bg: 'bg-navy-500/10', border: 'border-navy-500/20' },
};

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [searchResults, setSearchResults] = useState<{ label: string; href: string; type: string }[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchNotifications().then(setNotifications);
  }, [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchResults([]);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results: { label: string; href: string; type: string }[] = [];
    navItems.forEach((item) => {
      if (item.label.toLowerCase().includes(lower)) results.push({ label: item.label, href: item.href, type: 'Page' });
    });
    const productTypes = ['Bridal', 'Reception', 'Engagement', 'Mehendi', 'Haldi', 'Sangeet', 'Nikah', 'Walima', 'Sarees', 'Suits'];
    productTypes.forEach((pt) => {
      if (pt.toLowerCase().includes(lower)) results.push({ label: pt, href: `/collections/${pt.toLowerCase()}`, type: 'Collection' });
    });
    setSearchResults(results.slice(0, 8));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Sidebar — desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-navy-100 bg-white lg:flex">
        <SidebarContent onNavigate={() => {}} user={user} onSignOut={handleSignOut} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 h-full w-64 animate-slide-in-right overflow-y-auto border-r border-navy-100 bg-white no-scrollbar">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} user={user} onSignOut={handleSignOut} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-navy-100 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-luxury text-navy-900 hover:bg-ivory-200 lg:hidden">
            <Menu size={20} />
          </button>

          {/* Global search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-300" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products, collections, customers..."
              className="w-full rounded-luxury border border-navy-100 bg-ivory-100 py-2.5 pl-10 pr-4 text-sm text-charcoal-800 placeholder:text-charcoal-300 focus:border-gold-400 focus:ring-2 focus:ring-gold-200 focus:outline-none"
              aria-label="Global search"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-luxury border border-navy-100 bg-white shadow-soft-lg">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => { navigate(result.href); setSearchResults([]); setSearchQuery(''); }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-ivory-200"
                  >
                    <span className="text-sm font-light text-navy-900">{result.label}</span>
                    <span className="text-xs font-light text-charcoal-400">{result.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-luxury text-navy-900 transition-colors hover:bg-ivory-200"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-navy-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-luxury border border-navy-100 bg-white shadow-soft-lg sm:w-96">
                  <div className="flex items-center justify-between border-b border-navy-50 px-4 py-3">
                    <h3 className="text-sm font-medium text-navy-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs font-medium text-gold-700 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm font-light text-charcoal-400">No notifications</p>
                    ) : (
                      notifications.map((notif) => {
                        const cfg = priorityConfig[notif.priority] ?? priorityConfig.medium;
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={notif.id}
                            onClick={() => handleMarkRead(notif.id)}
                            className={`flex w-full items-start gap-3 border-b border-navy-50 px-4 py-3 text-left transition-colors hover:bg-ivory-200 ${!notif.is_read ? cfg.bg : ''}`}
                          >
                            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.color}`}>
                              <Icon size={14} />
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-navy-900">{notif.title}</p>
                              <p className="mt-0.5 text-xs font-light text-charcoal-500">{notif.message}</p>
                              <p className="mt-1 text-[10px] font-light text-charcoal-300">
                                {new Date(notif.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2 border-l border-navy-100 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-navy-900">{user?.email}</p>
                <p className="text-[10px] font-light text-charcoal-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="flex h-10 w-10 items-center justify-center rounded-luxury text-charcoal-500 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate, user, onSignOut }: { onNavigate: () => void; user: { email: string; role: string } | null; onSignOut: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-navy-50 px-5 py-4">
        <img src={getImage('logo')} alt="LIBAS COUTURE" className="h-8 w-auto object-contain" />
        <span className="text-xs uppercase tracking-[0.2em] text-gold-600">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar" aria-label="Admin navigation">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-luxury px-3 py-2.5 text-sm font-light transition-colors ${
                      isActive
                        ? 'bg-gold-50 font-medium text-gold-800'
                        : 'text-charcoal-600 hover:bg-ivory-200 hover:text-navy-900'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-navy-50 px-3 py-4">
        <div className="flex items-center gap-3 rounded-luxury bg-ivory-100 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-ivory-100">
            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
          </span>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-navy-900">{user?.email}</p>
            <p className="text-[10px] font-light text-charcoal-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button onClick={onSignOut} aria-label="Sign out" className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-400 hover:bg-red-50 hover:text-red-500">
            <LogOut size={14} />
          </button>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 px-3 py-2 text-xs font-light text-charcoal-400 hover:text-gold-700">
          <Globe size={12} /> View Website
        </a>
      </div>
    </div>
  );
}
