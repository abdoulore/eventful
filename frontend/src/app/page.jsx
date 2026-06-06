'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import EventGrid from '../components/events/EventGrid';
import { ArrowRight, Ticket, Star, Zap } from 'lucide-react';
import api from '../lib/api';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/events?limit=8&status=PUBLISHED');
        setEvents(res.data.data.events);
      } catch {
        // Fail silently on homepage
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-white border-b border-surface-200">
          <div className="container py-20 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap size={12} />
              Your passport to unforgettable moments
            </div>

            <h1 className="text-5xl font-semibold text-ink-900 leading-tight tracking-tight max-w-2xl mb-4">
              Discover events you'll love
            </h1>

            <p className="text-ink-500 text-lg max-w-xl mb-8">
              From pulsating concerts to captivating theatre, thrilling sports to enlightening
              cultural gatherings — all in one place.
            </p>

            <div className="flex items-center gap-3">
              <Link href="/events" className="btn-primary text-sm px-6 py-3">
                Browse Events
              </Link>
              <Link href="/register" className="btn-secondary text-sm px-6 py-3">
                Host an Event
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-14 pt-10 border-t border-surface-200 w-full justify-center">
              {[
                { label: 'Events monthly', value: '500+' },
                { label: 'Happy attendees', value: '20k+' },
                { label: 'Cities covered', value: '12' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-semibold text-ink-900">{value}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-surface-200 bg-surface-50">
          <div className="container py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Ticket,
                  title: 'Instant Tickets',
                  desc: 'Buy tickets in seconds. Your QR code is ready immediately after payment.',
                },
                {
                  icon: Star,
                  title: 'Curated Events',
                  desc: 'Every event is reviewed to ensure quality experiences across every category.',
                },
                {
                  icon: Zap,
                  title: 'Smart Reminders',
                  desc: 'Never miss an event. Set reminders exactly when you need them.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-ink-900 mb-1">{title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured events */}
        <section className="container py-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-ink-900">Featured Events</h2>
            <Link
              href="/events"
              className="flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <EventGrid events={events} loading={loading} />
        </section>

        {/* CTA */}
        <section className="bg-brand-600 text-white">
          <div className="container py-16 text-center">
            <h2 className="text-3xl font-semibold mb-3 tracking-tight">
              Ready to host your next event?
            </h2>
            <p className="text-brand-100 mb-8 max-w-md mx-auto text-sm">
              Create events, sell tickets, track analytics, and manage attendees all in one place.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-700
              font-medium px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm">
              Get started free <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}