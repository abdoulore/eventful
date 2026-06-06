'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/layout/Navbar';
import Sidebar from '../../../../components/layout/Sidebar';
import StatsCard from '../../../../components/analytics/StatsCard';
import { TicketSalesChart, RevenueChart } from '../../../../components/analytics/SalesChart';
import { Calendar, Ticket, Users, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { isAuthenticated, isCreator } from '../../../../lib/auth';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [ticketTrend, setTicketTrend] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isCreator()) { router.push('/login'); return; }

    const fetchAll = async () => {
      try {
        const [overviewRes, ticketRes, revenueRes, topRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/trend/tickets'),
          api.get('/analytics/trend/revenue'),
          api.get('/analytics/top-events'),
        ]);
        setOverview(overviewRes.data.data);
        setTicketTrend(ticketRes.data.data);
        setRevenueTrend(revenueRes.data.data);
        setTopEvents(topRes.data.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-ink-900">Analytics</h1>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-5 h-28 animate-pulse bg-surface-50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard label="Total Events"  value={overview?.totalEvents ?? 0}                  icon={Calendar}   color="brand"  />
                <StatsCard label="Tickets Sold"  value={overview?.totalTicketsSold ?? 0}             icon={Ticket}     color="green"  />
                <StatsCard label="Total Scans"   value={overview?.totalScans ?? 0}                   icon={Users}      color="yellow" />
                <StatsCard label="Total Revenue" value={formatCurrency(overview?.totalRevenue ?? 0)} icon={DollarSign} color="green"  />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="font-semibold text-ink-900 mb-4">Ticket Sales (Last 30 Days)</h2>
                {loading ? <div className="h-56 bg-surface-50 rounded-xl animate-pulse" /> : <TicketSalesChart data={ticketTrend} />}
              </div>
              <div className="card p-6">
                <h2 className="font-semibold text-ink-900 mb-4">Revenue (Last 30 Days)</h2>
                {loading ? <div className="h-56 bg-surface-50 rounded-xl animate-pulse" /> : <RevenueChart data={revenueTrend} />}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-ink-900 mb-4">Top Events by Ticket Sales</h2>
              {loading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-surface-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : topEvents.length === 0 ? (
                <p className="text-sm text-ink-500 text-center py-6">No events yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left pb-3 text-xs font-medium text-ink-500">Event</th>
                      <th className="text-left pb-3 text-xs font-medium text-ink-500 hidden sm:table-cell">Date</th>
                      <th className="text-right pb-3 text-xs font-medium text-ink-500">Tickets</th>
                      <th className="text-right pb-3 text-xs font-medium text-ink-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {topEvents.map((event, i) => (
                      <tr key={event.id} className="hover:bg-surface-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-ink-400 w-4">{i + 1}</span>
                            <p className="font-medium text-ink-900 truncate max-w-[200px]">{event.title}</p>
                          </div>
                        </td>
                        <td className="py-3 hidden sm:table-cell text-xs text-ink-500">{formatDate(event.startDate)}</td>
                        <td className="py-3 text-right font-medium text-ink-900">{event.ticketsSold}</td>
                        <td className="py-3 text-right font-semibold text-green-600">{formatCurrency(event.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}