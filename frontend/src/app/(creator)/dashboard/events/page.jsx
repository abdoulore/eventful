'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/layout/Navbar';
import Sidebar from '../../../../components/layout/Sidebar';
import Badge from '../../../../components/ui/Badge';
import Modal from '../../../../components/ui/Modal';
import ShareButtons from '../../../../components/shared/ShareButtons';
import { Plus, Calendar, MapPin, Ticket, Pencil, Trash2, Users, Share2 } from 'lucide-react';
import { formatDate, formatCurrency, generateShareLinks } from '../../../../lib/utils';
import { isAuthenticated, isCreator } from '../../../../lib/auth';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';

const statusVariant = {
  DRAFT:     'default',
  PUBLISHED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'info',
};

export default function CreatorEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isCreator()) { router.push('/login'); return; }
    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events/creator/my-events?limit=50');
      setEvents(res.data.data.events);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/events/${deleteTarget.id}`);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success('Event deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-ink-900">My Events</h1>
              <Link href="/dashboard/events/new" className="btn-primary text-sm flex items-center gap-2">
                <Plus size={15} />
                New Event
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-5 h-24 animate-pulse bg-surface-50" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="card p-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                  <Calendar size={22} className="text-ink-300" />
                </div>
                <h3 className="font-semibold text-ink-900 mb-1">No events yet</h3>
                <p className="text-sm text-ink-500 mb-4">Create your first event to get started.</p>
                <Link href="/dashboard/events/new" className="btn-primary text-sm">Create Event</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {events.map((event) => (
                  <div key={event.id} className="card p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-100 overflow-hidden shrink-0">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Ticket size={20} className="text-ink-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-ink-900 text-sm truncate">{event.title}</p>
                        <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink-500">
                        <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(event.startDate)}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>
                        <span className="flex items-center gap-1"><Ticket size={11} />{event._count?.tickets ?? 0} sold</span>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-ink-900 shrink-0">{formatCurrency(event.price)}</p>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/dashboard/events/${event.id}/attendees`} className="p-2 rounded-lg hover:bg-surface-100 text-ink-500 transition-colors" title="Attendees">
                        <Users size={15} />
                      </Link>
                      <Link href={`/dashboard/events/${event.id}/edit`} className="p-2 rounded-lg hover:bg-surface-100 text-ink-500 transition-colors" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => setShareTarget(event)}
                        className="p-2 rounded-lg hover:bg-surface-100 text-ink-500 transition-colors"
                        title="Share"
                      >
                        <Share2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(event)} className="p-2 rounded-lg hover:bg-red-50 text-ink-500 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Event" size="sm">
        <p className="text-sm text-ink-600 mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleDelete} disabled={deleteLoading} className="btn-primary text-sm bg-red-500 hover:bg-red-600">
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      <Modal open={!!shareTarget} onClose={() => setShareTarget(null)} title="Share Event" size="sm">
        {shareTarget && (
          <ShareButtons
            shareLinks={generateShareLinks(shareTarget.id, shareTarget.title)}
            title={shareTarget.title}
          />
        )}
      </Modal>
    </div>
  );
}
