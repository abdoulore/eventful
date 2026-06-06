'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import TicketCard from '../../../components/tickets/TicketCard';
import { Ticket } from 'lucide-react';
import { isAuthenticated, isEventee } from '../../../lib/auth';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function TicketsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated() || !isEventee()) { router.push('/login'); return; }

    // Handle Paystack callback — verify payment if reference exists
    const reference = searchParams.get('reference');
    if (reference) {
      api.get(`/payments/verify/${reference}`)
        .then(() => toast.success('Payment confirmed! Your ticket is ready.'))
        .catch(() => toast.error('Could not verify payment'))
        .finally(() => router.replace('/tickets'));
    }

    fetchTickets();
  }, [router, searchParams]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-ink-900">My Tickets</h1>
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'SCANNED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                  ${filter === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-100 text-ink-600 hover:bg-surface-200'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-surface-50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <Ticket size={24} className="text-ink-300" />
            </div>
            <h3 className="font-semibold text-ink-900 mb-1">No tickets yet</h3>
            <p className="text-sm text-ink-500 mb-4">Browse events and purchase your first ticket.</p>
            <button onClick={() => router.push('/events')} className="btn-primary text-sm">
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={null}>
      <TicketsPageContent />
    </Suspense>
  );
}
