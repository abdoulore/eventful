'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/layout/Navbar';
import Sidebar from '../../../components/layout/Sidebar';
import StatsCard from '../../../components/analytics/StatsCard';
import { TicketSalesChart } from '../../../components/analytics/SalesChart';
import { Calendar, Ticket, Users, DollarSign, ArrowRight, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { isAuthenticated, isCreator } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isCreator()) { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        const [overviewRes, trendRes, topRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/trend/tickets'),
          api.get('/analytics/top-events'),
        ]);
        setOverview(overviewRes.data.data);
        setTrend(trendRes.data.data);
        setTopEvents(topRes.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-ink-900">Overview</h1>
                <p className="text-sm text-ink-500 mt-0.5">Your events at a glance</p>
              </div>
              <Link href="/dashboard/events/new" className="btn-primary text-sm flex items-center gap-2">
                <Plus size={15} />
                New Event
              </Link>
            </div>

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

            <div className="card p-6">
              <h2 className="font-semibold text-ink-900 mb-4">Ticket Sales (Last 30 Days)</h2>
              {loading ? (
                <div className="h-56 bg-surface-50 rounded-xl animate-pulse" />
              ) : (
                <TicketSalesChart data={trend} />
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-ink-900">Top Events</h2>
                <Link href="/dashboard/events" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-surface-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : topEvents.length === 0 ? (
                <p className="text-sm text-ink-500 py-4 text-center">No events yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-surface-100">
                  {topEvents.map((event) => (
                    <div key={event.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{event.title}</p>
                        <p className="text-xs text-ink-500">{formatDate(event.startDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-900">{formatCurrency(event.revenue)}</p>
                        <p className="text-xs text-ink-500">{event.ticketsSold} tickets</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}