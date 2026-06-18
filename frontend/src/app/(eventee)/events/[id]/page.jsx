'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import ShareButtons from '../../../../components/shared/ShareButtons';
import ReminderPicker from '../../../../components/shared/ReminderPicker';
import Badge from '../../../../components/ui/Badge';
import Modal from '../../../../components/ui/Modal';
import {
  MapPin, Calendar, Ticket, Users, Clock, ArrowLeft, CreditCard,
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../../../lib/utils';
import { isAuthenticated, isEventee } from '../../../../lib/auth';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
      } catch {
        toast.error('Event not found');
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, router]);

  const handleBuyTicket = async () => {
  if (!isAuthenticated()) { router.push('/login'); return; }
  if (!isEventee()) { toast.error('Only eventees can purchase tickets'); return; }

  setBuyLoading(true);
  try {
    const res = await api.post('/payments/initiate', { eventId: id });
    const data = res.data.data;

    if (data.free) {
      toast.success('Ticket registered successfully');
      router.push('/tickets');
    } else {
      window.location.href = data.authorizationUrl;
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to initiate payment');
  } finally {
    setBuyLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-10">
          <div className="animate-pulse flex flex-col gap-6">
            <div className="h-80 bg-surface-100 rounded-3xl" />
            <div className="h-8 bg-surface-100 rounded-xl w-1/2" />
            <div className="h-4 bg-surface-100 rounded-xl w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isSoldOut = event.availableTickets === 0;
  const sold = event.totalTickets - event.availableTickets;
  const soldPercent = event.totalTickets ? Math.round((sold / event.totalTickets) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">

          {/* Left: event details */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Cover image */}
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-surface-100 shadow-card">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[linear-gradient(135deg,#f5f7f4,#ffe1dd)]">
                  <Ticket size={48} className="text-brand-200" />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="card p-6 flex flex-col gap-4">
              <div>
                <Badge variant="info">{event.category}</Badge>
                <h1 className="mt-3 font-display text-3xl sm:text-4xl leading-tight text-ink-900">
                  {event.title}
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <div className="w-9 h-9 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Calendar size={15} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-400">Start</p>
                    <p className="font-semibold">{formatDateTime(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <div className="w-9 h-9 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Clock size={15} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-400">End</p>
                    <p className="font-semibold">{formatDateTime(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <div className="w-9 h-9 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-400">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-sm text-ink-600">
                  <div className="w-9 h-9 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Users size={15} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-400">Hosted by</p>
                    <p className="font-semibold">{event.creator?.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-ink-900 mb-3">About this event</h2>
              <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Share */}
            {event.shareLinks && (
              <div className="card p-6">
                <ShareButtons shareLinks={event.shareLinks} title={event.title} />
              </div>
            )}
          </div>

          {/* Right: ticket purchase */}
          <div className="flex flex-col gap-4">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-3xl font-bold text-ink-900">
                  {event.price === 0 ? 'Free' : formatCurrency(event.price)}
                </span>
                <Badge variant={isSoldOut ? 'danger' : 'success'}>
                  {isSoldOut ? 'Sold out' : 'Available'}
                </Badge>
              </div>

              {/* Ticket availability */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-semibold text-ink-500 mb-1.5">
                  <span>{event.availableTickets} tickets left</span>
                  <span>{soldPercent}% sold</span>
                </div>
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      soldPercent >= 80 ? 'bg-red-400' : 'bg-brand-500'
                    }`}
                    style={{ width: `${soldPercent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleBuyTicket}
                disabled={isSoldOut || buyLoading}
                className="btn-primary w-full justify-center mb-3"
              >
                {buyLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Redirecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={15} />
                    {isSoldOut ? 'Sold out' : 'Buy ticket'}
                  </span>
                )}
              </button>

              {isAuthenticated() && isEventee() && !isSoldOut && (
                <button
                  onClick={() => setShowReminder(true)}
                  className="btn-secondary w-full justify-center text-sm"
                >
                  Set Reminder
                </button>
              )}

              <p className="text-xs text-ink-400 text-center mt-4">
                Powered by Paystack. Secure checkout.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Reminder modal */}
      <Modal
        open={showReminder}
        onClose={() => setShowReminder(false)}
        title="Set a Reminder"
        size="sm"
      >
        <ReminderPicker eventId={id} onSuccess={() => setShowReminder(false)} />
      </Modal>

      <Footer />
    </div>
  );
}
