'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventGrid from '../components/events/EventGrid';
import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import api from '../lib/api';
import { getUser } from '../lib/auth';
import { formatDate, formatCurrency } from '../lib/utils';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());

    const fetchFeatured = async () => {
      try {
        const res = await api.get('/events?limit=8&status=PUBLISHED');
        setEvents(res.data.data.events);
      } catch {
        // Keep the homepage usable when the API is unavailable.
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const spotlight = events?.[0];

  const role = user?.role;
  const isEventeeUser = role === 'EVENTEE';
  const hostHref = role === 'CREATOR' ? '/dashboard/events/new' : '/register';
  const hostLabel = role === 'CREATOR' ? 'Create an event' : 'Host an event';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/70">
          <div className="container grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 py-16 lg:py-20 items-center">
            <div className="max-w-2xl">
              <div className="section-kicker mb-5 flex items-center gap-2">
                <Sparkles size={14} />
                Events, tickets, reminders
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.98] text-ink-900">
                Discover events you'll actually want to leave home for.
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-8 text-ink-600">
                Find concerts, theatre, sport, culture, and creator-led gatherings with instant QR tickets and reminders that arrive on time.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/events" className="btn-primary inline-flex items-center justify-center gap-2 text-sm px-6 py-3">
                  Browse events
                  <ArrowRight size={15} />
                </Link>
                {!isEventeeUser && (
                  <Link href={hostHref} className="btn-secondary inline-flex items-center justify-center gap-2 text-sm px-6 py-3">
                    {hostLabel}
                  </Link>
                )}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-xl">
                {[
                  ['QR tickets', 'Ready after checkout'],
                  ['Creator tools', 'Sales and attendee views'],
                  ['Reminders', 'Before the date slips by'],
                ].map(([label, detail]) => (
                  <div key={label} className="rounded-2xl border border-white/80 bg-white/60 p-3 shadow-inset">
                    <p className="text-sm font-bold text-ink-900">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-6">
              <div className="quiet-panel overflow-hidden p-3 sm:p-4">
                <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-surface-900">
                  {spotlight?.imageUrl ? (
                    <img
                      src={spotlight.imageUrl}
                      alt={spotlight.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#121712,#2d3a30_54%,#e14a3b)]" />
                  )}

                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                    <span className="rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-ink-900">
                      Featured pick
                    </span>
                    <span className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white">
                      {spotlight?.price === 0 ? 'Free' : spotlight ? formatCurrency(spotlight.price) : 'Live soon'}
                    </span>
                  </div>
                </div>

                <div className="px-2 pb-2 pt-5">
                  <h2 className="font-display text-2xl leading-tight text-ink-900">
                    {spotlight?.title || 'A cleaner way to find your next event'}
                  </h2>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-ink-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-brand-700" />
                      <span>{spotlight ? formatDate(spotlight.startDate) : 'Publish, sell, and scan from one place'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-brand-700" />
                      <span>{spotlight?.location || 'Built for local event discovery'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6 items-stretch">
            <div className="quiet-panel p-7 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="section-kicker mb-4">Built for both sides</p>
                <h2 className="font-display text-3xl sm:text-4xl leading-tight text-ink-900">
                  Event discovery for guests, control room for creators.
                </h2>
              </div>
              <p className="mt-6 text-sm leading-7 text-ink-600 max-w-lg">
                Eventful keeps the public experience simple while giving organizers the parts that matter: publishing, ticket sales, attendees, analytics, and reminders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Ticket,
                  title: 'Instant tickets',
                  desc: 'Attendees get a QR code as soon as checkout clears.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Paystack checkout',
                  desc: 'Paid events hand off to a familiar secure payment flow.',
                },
                {
                  icon: CalendarDays,
                  title: 'Reminder timing',
                  desc: 'Guests can choose when they want a prompt before the event.',
                },
                {
                  icon: Sparkles,
                  title: 'Creator dashboard',
                  desc: 'Track revenue, sales, attendees, and event performance.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <article key={title} className="card p-5 transition-transform duration-200 hover:-translate-y-1">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon size={19} />
                  </div>
                  <h3 className="text-base font-bold text-ink-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-16">
          <div className="mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="section-kicker mb-2">Fresh listings</p>
              <h2 className="font-display text-3xl text-ink-900">Featured events</h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900 transition-colors"
            >
              View all events
              <ArrowRight size={15} />
            </Link>
          </div>

          <EventGrid events={events} loading={loading} />
        </section>

        {!isEventeeUser && (
          <section className="container pb-16">
            <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-elevated">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl sm:text-4xl leading-tight">
                  Ready to put your event in front of people?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                  Create events, sell tickets, track analytics, and manage attendees without stitching together extra tools.
                </p>
                <Link
                  href={hostHref}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {role === 'CREATOR' ? 'Create an event' : 'Start hosting'}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
