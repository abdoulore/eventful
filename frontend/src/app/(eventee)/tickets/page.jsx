'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import TicketCard from '../../../components/tickets/TicketCard';
import AuthGuard from '../../../components/auth/AuthGuard';
import { Ticket } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function TicketsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let cancelled = false;

    const loadTickets = async () => {
      try {
        const res = await api.get('/tickets/my-tickets');
        if (!cancelled) setTickets(res.data.data);
      } catch {
        if (!cancelled) toast.error('Failed to load tickets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const verifyPaymentAndLoadTickets = async () => {
      if (reference) {
        const storageKey = `eventful-payment-verified:${reference}`;
        const alreadyHandled = sessionStorage.getItem(storageKey) === '1';

        window.history.replaceState(null, '', window.location.pathname);

        if (!alreadyHandled) {
          sessionStorage.setItem(storageKey, '1');

          try {
            await api.get(`/payments/verify/${reference}`);
            if (!cancelled) toast.success('Payment confirmed! Your ticket is ready.');
          } catch {
            sessionStorage.removeItem(storageKey);
            if (!cancelled) toast.error('Could not verify payment');
          }
        }
      }

      await loadTickets();
    };

    verifyPaymentAndLoadTickets();

    return () => { cancelled = true; };
  }, [router, reference]);

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
    <AuthGuard role="EVENTEE">
      <Suspense fallback={null}>
        <TicketsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
