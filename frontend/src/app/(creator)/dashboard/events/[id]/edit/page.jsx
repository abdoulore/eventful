'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../../../../components/layout/Navbar';
import Sidebar from '../../../../../../components/layout/Sidebar';
import CoverImageUpload from '../../../../../../components/events/CoverImageUpload';
import { ArrowLeft } from 'lucide-react';
import api from '../../../../../../lib/api';
import toast from 'react-hot-toast';

const categories = ['Music', 'Tech', 'Sports', 'Arts', 'Food', 'Culture'];
const statuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const e = res.data.data;
        setForm({
          title: e.title,
          description: e.description,
          location: e.location,
          imageUrl: e.imageUrl || '',
          startDate: new Date(e.startDate).toISOString().slice(0, 16),
          endDate: new Date(e.endDate).toISOString().slice(0, 16),
          price: e.price,
          totalTickets: e.totalTickets,
          category: e.category,
          status: e.status,
        });
      } catch {
        toast.error('Event not found');
        router.push('/dashboard/events');
      } finally {
        setFetching(false);
      }
    };

    fetchEvent();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/events/${id}`, {
        ...form,
        price: Number(form.price),
        totalTickets: Number(form.totalTickets),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      toast.success('Event updated');
      router.push('/dashboard/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-8 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!form) return null;

  const field = (key, label, props = {}) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`input ${errors[key] ? 'border-red-400' : ''}`}
        {...props}
      />
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 container py-8">
        <div className="flex gap-8">
          <Sidebar />

          <div className="flex-1 min-w-0">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors">
              <ArrowLeft size={15} /> Back
            </button>

            <h1 className="text-2xl font-semibold text-ink-900 mb-6">Edit Event</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="card p-6 flex flex-col gap-4">
                <h2 className="font-semibold text-ink-900 text-sm">Event Details</h2>
                {field('title', 'Title')}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-700">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input resize-none" />
                </div>
                {field('location', 'Location')}
                <CoverImageUpload
                  value={form.imageUrl}
                  onChange={(imageUrl) => setForm((prev) => ({ ...prev, imageUrl }))}
                  onUploadingChange={setImageUploading}
                />
              </div>

              <div className="card p-6 flex flex-col gap-4">
                <h2 className="font-semibold text-ink-900 text-sm">Date & Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {field('startDate', 'Start Date & Time', {
                    type: 'datetime-local',
                    min: new Date().toISOString().slice(0, 16),
                    max: '2099-12-31T23:59',
                  })}
                  {field('endDate', 'End Date & Time', {
                    type: 'datetime-local',
                    min: new Date().toISOString().slice(0, 16),
                    max: '2099-12-31T23:59',
                  })}
                </div>
              </div>

              <div className="card p-6 flex flex-col gap-4">
                <h2 className="font-semibold text-ink-900 text-sm">Tickets & Pricing</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {field('price', 'Price (NGN)', { type: 'number', min: 0 })}
                  {field('totalTickets', 'Total Tickets', { type: 'number', min: 1 })}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-700">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                          ${form.category === cat ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-surface-200 text-ink-600 hover:border-surface-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-ink-700">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading || imageUploading} className="btn-primary text-sm w-full justify-center py-3">
                {imageUploading ? 'Uploading image...' : loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
