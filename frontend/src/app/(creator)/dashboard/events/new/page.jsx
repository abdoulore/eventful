'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../../components/layout/Navbar';
import Sidebar from '../../../../../components/layout/Sidebar';
import CoverImageUpload from '../../../../../components/events/CoverImageUpload';
import { ArrowLeft } from 'lucide-react';
import api from '../../../../../lib/api';
import toast from 'react-hot-toast';

const categories = ['Music', 'Tech', 'Sports', 'Arts', 'Food', 'Culture'];

const reminderPresets = [
  { label: '1 hour before',  value: '1', unit: 'hours' },
  { label: '3 hours before', value: '3', unit: 'hours' },
  { label: '1 day before',   value: '1', unit: 'days'  },
  { label: '3 days before',  value: '3', unit: 'days'  },
  { label: '1 week before',  value: '1', unit: 'weeks' },
];

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', location: '', imageUrl: '',
    startDate: '', endDate: '', price: '', totalTickets: '', category: '',
    reminderValue: '1', reminderUnit: 'days',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.title || form.title.length < 3) errs.title = 'Title must be at least 3 characters';
    if (!form.description || form.description.length < 10) errs.description = 'Description too short';
    if (!form.location) errs.location = 'Location is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (!form.price && form.price !== 0) errs.price = 'Price is required';
    if (!form.totalTickets) errs.totalTickets = 'Ticket count is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.reminderValue || Number(form.reminderValue) < 1) errs.reminderValue = 'Reminder value must be at least 1';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        totalTickets: Number(form.totalTickets),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reminderValue: Number(form.reminderValue),
        reminderUnit: form.reminderUnit,
      };
      if (!payload.imageUrl) delete payload.imageUrl;

      const res = await api.post('/events', payload);
      const eventId = res.data.data.id;

      await api.put(`/events/${eventId}`, { status: 'PUBLISHED' });

      setCreatedEventId(eventId);
      toast.success('Event created and published');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`input ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`}
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
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </button>

            <h1 className="text-2xl font-semibold text-ink-900 mb-6">Create New Event</h1>

            {createdEventId ? (
              <div className="card p-8 flex flex-col gap-6">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-ink-900">Event Published!</h2>
                  <p className="text-sm text-ink-500">
                    Attendees will automatically receive a reminder{' '}
                    <strong>{form.reminderValue} {form.reminderUnit} before</strong> the event starts.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/dashboard/events')}
                    className="btn-primary text-sm w-full justify-center"
                  >
                    Go to My Events
                  </button>
                  <button
                    onClick={() => router.push(`/events/${createdEventId}`)}
                    className="btn-secondary text-sm w-full justify-center"
                  >
                    View Event Page
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="card p-6 flex flex-col gap-4">
                  <h2 className="font-semibold text-ink-900 text-sm">Event Details</h2>
                  {field('title', 'Title', { placeholder: 'Lagos Jazz Night at Terra Kulture' })}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-ink-700">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      placeholder="Tell guests what to expect, who should come, and what is included."
                      className={`input resize-none ${errors.description ? 'border-red-400' : ''}`}
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                  </div>
                  {field('location', 'Location', { placeholder: 'Terra Kulture, Victoria Island, Lagos' })}
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
                    {field('price', 'Price (NGN)', { type: 'number', min: 0, placeholder: '5000 or 0 for free' })}
                    {field('totalTickets', 'Total Tickets', { type: 'number', min: 1, placeholder: '150' })}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-ink-700">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm({ ...form, category: cat })}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                            ${form.category === cat
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-surface-200 text-ink-600 hover:border-surface-300'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                  </div>
                </div>

                <div className="card p-6 flex flex-col gap-4">
                  <h2 className="font-semibold text-ink-900 text-sm">Default Reminder for Attendees</h2>
                  <p className="text-xs text-ink-500">
                    Every eventee who buys a ticket will automatically receive a reminder email this long before the event.
                  </p>

                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-2">
                    {reminderPresets.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setForm({ ...form, reminderValue: p.value, reminderUnit: p.unit })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                          ${form.reminderValue === p.value && form.reminderUnit === p.unit
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-surface-200 text-ink-600 hover:border-surface-300'
                          }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom input */}
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={form.reminderValue}
                      onChange={(e) => setForm({ ...form, reminderValue: e.target.value })}
                      className={`input w-24 text-center ${errors.reminderValue ? 'border-red-400' : ''}`}
                    />
                    <select
                      value={form.reminderUnit}
                      onChange={(e) => setForm({ ...form, reminderUnit: e.target.value })}
                      className="input flex-1"
                    >
                      <option value="minutes">Minutes before</option>
                      <option value="hours">Hours before</option>
                      <option value="days">Days before</option>
                      <option value="weeks">Weeks before</option>
                    </select>
                  </div>
                  {errors.reminderValue && <p className="text-xs text-red-500">{errors.reminderValue}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || imageUploading}
                  className="btn-primary text-sm w-full justify-center py-3"
                >
                  {imageUploading ? 'Uploading image...' : loading ? 'Creating...' : 'Create & Publish Event'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
