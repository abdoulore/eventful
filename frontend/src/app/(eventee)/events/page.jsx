'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import EventGrid from '../../../components/events/EventGrid';
import EventFilters from '../../../components/events/EventFilters';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', page: 1, limit: 12 });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      params.set('page', filters.page);
      params.set('limit', filters.limit);

      const res = await api.get(`/events?${params.toString()}`);
      setEvents(res.data.data.events);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchEvents, filters.search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchEvents, filters.search]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-white/80">
          <div className="container py-12">
            <p className="section-kicker mb-3">Event marketplace</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 mb-3">Discover events</h1>
            <p className="text-ink-600 text-sm sm:text-base mb-7 max-w-2xl">
              Search concerts, theatre shows, sports, cultural gatherings, and creator-led nights near you.
            </p>
            <EventFilters filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* Results */}
        <div className="container py-8">
          {pagination && !loading && (
            <p className="text-sm font-semibold text-ink-500 mb-5">
              {pagination.total} event{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}

          <EventGrid events={events} loading={loading} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="p-2 rounded-xl border border-white/80 bg-white hover:bg-surface-100
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages ||
                  Math.abs(p - filters.page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && arr[i - 1] !== p - 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-ink-400 text-sm">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors
                        ${filters.page === p
                          ? 'bg-ink-900 text-white'
                          : 'border border-white/80 bg-white text-ink-700 hover:bg-surface-100'
                        }`}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === pagination.totalPages}
                className="p-2 rounded-xl border border-white/80 bg-white hover:bg-surface-100
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
