'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import Badge from '../../../components/ui/Badge';
import AuthGuard from '../../../components/auth/AuthGuard';
import { Bell, BellOff, Calendar, Trash2 } from 'lucide-react';
import { formatDateTime, formatDate } from '../../../lib/utils';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function RemindersContent() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders/my-reminders');
      setReminders(res.data.data);
    } catch {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reminder removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove reminder');
    } finally {
      setDeleting(null);
    }
  };

  const upcoming = reminders.filter((r) => !r.sent && new Date(r.reminderAt) > new Date());
  const past = reminders.filter((r) => r.sent || new Date(r.reminderAt) <= new Date());

  const ReminderRow = ({ reminder }) => (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
        ${reminder.sent ? 'bg-surface-100' : 'bg-brand-50'}`}>
        {reminder.sent
          ? <BellOff size={16} className="text-ink-400" />
          : <Bell size={16} className="text-brand-600" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink-900 text-sm truncate">
          {reminder.event?.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-ink-500">
            <Bell size={10} />
            {formatDateTime(reminder.reminderAt)}
          </span>
          <span className="flex items-center gap-1 text-xs text-ink-500">
            <Calendar size={10} />
            Event: {formatDate(reminder.event?.startDate)}
          </span>
        </div>
      </div>

      <Badge variant={reminder.sent ? 'default' : 'info'}>
        {reminder.sent ? 'Sent' : 'Upcoming'}
      </Badge>

      {!reminder.sent && (
        <button
          onClick={() => handleDelete(reminder.id)}
          disabled={deleting === reminder.id}
          className="p-2 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-500 transition-colors shrink-0"
        >
          {deleting === reminder.id
            ? <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full" />
            : <Trash2 size={14} />
          }
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        <h1 className="text-2xl font-semibold text-ink-900 mb-6">My Reminders</h1>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 h-16 animate-pulse bg-surface-50" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
              <Bell size={24} className="text-ink-300" />
            </div>
            <h3 className="font-semibold text-ink-900 mb-1">No reminders set</h3>
            <p className="text-sm text-ink-500 mb-4">
              Set reminders from any event page so you never miss out.
            </p>
            <button onClick={() => router.push('/events')} className="btn-primary text-sm">
              Browse Events
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {upcoming.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-ink-700">Upcoming ({upcoming.length})</h2>
                {upcoming.map((r) => <ReminderRow key={r.id} reminder={r} />)}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-ink-500">Past ({past.length})</h2>
                {past.map((r) => <ReminderRow key={r.id} reminder={r} />)}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function RemindersPage() {
  return (
    <AuthGuard role="EVENTEE">
      <RemindersContent />
    </AuthGuard>
  );
}