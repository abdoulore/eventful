import Link from 'next/link';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { formatDate, formatCurrency, truncate } from '../../lib/utils';
import Badge from '../ui/Badge';

const categoryColors = {
  Music:   'info',
  Tech:    'success',
  Sports:  'warning',
  Arts:    'danger',
  Food:    'default',
  Culture: 'info',
};

export default function EventCard({ event }) {
  const sold = event.totalTickets - event.availableTickets;
  const soldPercent = event.totalTickets ? Math.round((sold / event.totalTickets) * 100) : 0;
  const isSoldOut = event.availableTickets === 0;

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <article className="card flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-100">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f5f7f4,#ffe1dd)]">
              <Ticket size={34} className="text-brand-300" />
            </div>
          )}

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-900/60">
              <span className="rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-ink-900">
                Sold out
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Badge variant={categoryColors[event.category] || 'default'}>
              {event.category}
            </Badge>
            <span className="text-sm font-bold text-ink-900">
              {event.price === 0 ? 'Free' : formatCurrency(event.price)}
            </span>
          </div>

          <h3 className="text-base font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
            {truncate(event.title, 68)}
          </h3>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <Calendar size={13} />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <MapPin size={13} />
              <span>{truncate(event.location, 42)}</span>
            </div>
          </div>

          {!isSoldOut && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-500">
                <span>{event.availableTickets} left</span>
                <span>{soldPercent}% sold</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-surface-100 pt-4">
            <span className="text-xs font-semibold text-ink-500">
              by {event.creator?.name || 'Eventful creator'}
            </span>
            <span className="text-xs font-bold text-brand-700">Details</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
