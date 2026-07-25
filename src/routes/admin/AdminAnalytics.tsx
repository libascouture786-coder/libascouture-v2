import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Eye, Search, MousePointerClick, BarChart3, Users } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAnalyticsEvents } from '@/lib/admin-api';
import type { AnalyticsEvent } from '@/lib/admin-types';

export function AdminAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsEvents(500).then((data) => { setEvents(data); setLoading(false); });
  }, []);

  const stats = useMemo(() => {
    const pageViews = events.filter((e) => e.event_type === 'page_view');
    const searches = events.filter((e) => e.event_type === 'search');
    const clicks = events.filter((e) => e.event_type === 'product_click' || e.event_type === 'product_view');
    const uniqueSources = new Set(events.map((e) => e.source).filter(Boolean));

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        date: dateStr,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        views: pageViews.filter((e) => e.created_at.startsWith(dateStr)).length,
      };
    });

    const topSources = Object.entries(
      events.reduce<Record<string, number>>((acc, e) => {
        const s = e.source ?? 'direct';
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const topSearches = searches
      .map((e) => e.search_term)
      .filter(Boolean)
      .reduce<Record<string, number>>((acc, term) => {
        acc[term!] = (acc[term!] ?? 0) + 1;
        return acc;
      }, {});
    const topSearchList = Object.entries(topSearches).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return { pageViews: pageViews.length, searches: searches.length, clicks: clicks.length, uniqueSources: uniqueSources.size, last7Days, topSources, topSearchList };
  }, [events]);

  const maxViews = Math.max(...stats.last7Days.map((d) => d.views), 1);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-h2 font-serif font-medium text-navy-900">Analytics</h1>
        <p className="mt-1 text-sm font-light text-charcoal-500">Visitor activity and engagement insights.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-luxury" />)}</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Eye} label="Page Views" value={stats.pageViews} color="navy" />
            <StatCard icon={Search} label="Searches" value={stats.searches} color="gold" />
            <StatCard icon={MousePointerClick} label="Product Clicks" value={stats.clicks} color="green" />
            <StatCard icon={Users} label="Traffic Sources" value={stats.uniqueSources} color="blue" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* 7-day chart */}
            <div className="rounded-luxury border border-navy-50 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-navy-700" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-navy-900">Page Views (Last 7 Days)</h3>
              </div>
              <div className="flex h-40 items-end justify-between gap-2">
                {stats.last7Days.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="w-full rounded-t-md bg-gradient-to-t from-navy-200 to-navy-500 transition-all" style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: '4px' }} />
                    <span className="text-[10px] font-light text-charcoal-400">{d.label}</span>
                    <span className="text-[10px] font-medium text-navy-700">{d.views}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic sources */}
            <div className="rounded-luxury border border-navy-50 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-navy-700" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-navy-900">Top Traffic Sources</h3>
              </div>
              <div className="space-y-2">
                {stats.topSources.length === 0 ? (
                  <p className="text-sm font-light text-charcoal-400">No data yet</p>
                ) : stats.topSources.map(([source, count]) => {
                  const pct = (count / events.length) * 100;
                  return (
                    <div key={source} className="flex items-center gap-3">
                      <span className="w-20 text-xs font-light capitalize text-charcoal-500">{source}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-200">
                        <div className="h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-navy-700">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search insights */}
          <div className="mt-6 rounded-luxury border border-navy-50 bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Search size={18} className="text-navy-700" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-navy-900">Top Search Terms</h3>
            </div>
            {stats.topSearchList.length === 0 ? (
              <p className="text-sm font-light text-charcoal-400">No searches recorded yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.topSearchList.map(([term, count]) => (
                  <span key={term} className="flex items-center gap-1.5 rounded-full bg-ivory-200 px-3 py-1.5 text-xs font-light text-charcoal-600">
                    {term} <span className="rounded-full bg-navy-900 px-1.5 py-0.5 text-[9px] font-medium text-ivory-100">{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    navy: 'bg-navy-50 text-navy-700',
    gold: 'bg-gold-50 text-gold-700',
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="rounded-luxury border border-navy-50 bg-white p-5 shadow-soft">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-navy-700" style={{ backgroundColor: colorMap[color]?.split(' ')[0] }}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-serif font-medium text-navy-900">{value}</p>
      <p className="text-xs font-light text-charcoal-400">{label}</p>
    </div>
  );
}
