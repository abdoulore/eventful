'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../../../components/layout/Navbar';
import Sidebar from '../../../../../../components/layout/Sidebar';
import Badge from '../../../../../../components/ui/Badge';
import { ArrowLeft, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDateTime } from '../../../../../../lib/utils';
import api from '../../../../../../lib/api';
import toast from 'react-hot-toast';

const ticketStatusVariant = {
  ACTIVE:    'warning',
  SCANNED:   'success',
  CANCELLED: 'danger',
};

const ticketStatusIcon = {
  ACTIVE:    Clock,
  SCANNED:   CheckCircle,
  CANCELLED: XCircle,
};

export default function AttendeesPage() {
  const router = useRouter();
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await api.get(`/events/${id}/attendees`);
        setAttendees(res.data.data);
        setFiltered(res.data.data);
      } catch {
        toast.error('Failed to load attendees');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [id, router]);

  useEffect(() => {
    if (!search) { setFiltered(attendees); return; }
    const q = search.toLowerCase();
    setFiltered(attendees.filter((a) =>
      a.user?.name.toLowerCase().includes(q) ||
      a.user?.email.toLowerCase().includes(q) ||
      a.ticketCode.toLowerCase().includes(q)
    ));
  }, [search, attendees]);

  const stats = {
    total:     attendees.length,
    scanned:   attendees.filter((a) => a.status === 'SCANNED').length,
    active:    attendees.filter((a) => a.status === 'ACTIVE').length,
    cancelled: attendees.filter((a) => a.status === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors w-fit">
              <ArrowLeft size={15} /> Back
            </button>

            <h1 className="text-2xl font-semibold text-ink-900">Attendees</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total',     value: stats.total,     color: 'text-ink-900'    },
                { label: 'Scanned',   value: stats.scanned,   color: 'text-green-600'  },
                { label: 'Active',    value: stats.active,    color: 'text-yellow-600' },
                { label: 'Cancelled', value: stats.cancelled, color: 'text-red-500'    },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-4 text-center">
                  <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
              <input type="text" placeholder="Search attendee, email, or ticket code" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="card p-4 h-14 animate-pulse bg-surface-50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-sm text-ink-500">No attendees found.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Attendee</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 hidden sm:table-cell">Ticket Code</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 hidden md:table-cell">Scanned At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {filtered.map((attendee) => {
                      const StatusIcon = ticketStatusIcon[attendee.status];
                      return (
                        <tr key={attendee.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-ink-900">{attendee.user?.name}</p>
                            <p className="text-xs text-ink-500">{attendee.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
  <code
    className="text-xs bg-surface-100 px-2 py-0.5 rounded cursor-pointer hover:bg-surface-200 transition-colors"
    title={attendee.ticketCode}
    onClick={() => {
      navigator.clipboard.writeText(attendee.ticketCode);
      toast.success('Ticket code copied');
    }}
  >
    {attendee.ticketCode.slice(0, 8)}...
  </code>
</td>
                          <td className="px-4 py-3">
                            <Badge variant={ticketStatusVariant[attendee.status]}>
                              <StatusIcon size={10} className="mr-1" />
                              {attendee.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-xs text-ink-500">
                            {attendee.scannedAt ? formatDateTime(attendee.scannedAt) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
