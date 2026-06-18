'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../../../components/layout/Navbar';
import Sidebar from '../../../../components/layout/Sidebar';
import Badge from '../../../../components/ui/Badge';
import { DollarSign, Search } from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../../../lib/utils';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';

const statusVariant = {
  PENDING:  'warning',
  SUCCESS:  'success',
  FAILED:   'danger',
  REFUNDED: 'default',
};

export default function PaymentsPage() {
  const [data, setData] = useState({ payments: [], totalRevenue: 0 });
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/creator');
        setData(res.data.data);
        setFiltered(res.data.data.payments);
      } catch {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    let result = data.payments;
    if (statusFilter !== 'ALL') result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.user?.name.toLowerCase().includes(q) ||
        p.user?.email.toLowerCase().includes(q) ||
        p.event?.title.toLowerCase().includes(q) ||
        p.paystackReference.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, data.payments]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-ink-900">Payments</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Revenue',      value: formatCurrency(data.totalRevenue),                              color: 'text-green-600' },
                { label: 'Successful',         value: data.payments.filter((p) => p.status === 'SUCCESS').length,     color: 'text-ink-900'   },
                { label: 'Total Transactions', value: data.payments.length,                                           color: 'text-ink-900'   },
              ].map(({ label, value, color }) => (
                <div key={label} className="card p-5">
                  <p className="text-xs text-ink-500 mb-1">{label}</p>
                  <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                <input type="text" placeholder="Search customer, email, event, or reference" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors
                      ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-100 text-ink-600 hover:bg-surface-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="card p-4 h-14 animate-pulse bg-surface-50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="card p-10 text-center">
                <DollarSign size={24} className="text-ink-300 mx-auto mb-2" />
                <p className="text-sm text-ink-500">No payments found.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 hidden md:table-cell">Event</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 hidden lg:table-cell">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 hidden lg:table-cell">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {filtered.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-ink-900">{payment.user?.name}</p>
                          <p className="text-xs text-ink-500">{payment.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-ink-700 truncate max-w-[160px]">{payment.event?.title}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink-900">{formatCurrency(payment.amount)}</td>
                        <td className="px-4 py-3"><Badge variant={statusVariant[payment.status]}>{payment.status}</Badge></td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-ink-500">
                          {payment.paidAt ? formatDateTime(payment.paidAt) : '—'}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <code className="text-xs bg-surface-100 px-2 py-0.5 rounded">{payment.paystackReference.slice(0, 12)}...</code>
                        </td>
                      </tr>
                    ))}
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
