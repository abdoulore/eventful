import Link from 'next/link';
import { MapPin, Calendar, Ticket } from 'lucide-react';
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
  const soldPercent = Math.round((sold / event.totalTickets) * 100);
  const isSoldOut = event.availableTickets === 0;

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-elevated transition-shadow duration-200">

        {/* Event image */}
        <div className="relative h-44 bg-surface-100 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
              <Ticket size={32} className="text-brand-300" />
            </div>
          )}

          <div className="absolute top-3 left-3">
            <Badge variant={categoryColors[event.category] || 'default'}>
              {event.category}
            </Badge>
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-ink-900 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors">
            {truncate(event.title, 60)}
          </h3>

          <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <Calendar size={12} />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-500">
              <MapPin size={12} />
              <span>{truncate(event.location, 40)}</span>
            </div>
          </div>

          {/* Ticket progress bar */}
          {!isSoldOut && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-ink-500 mb-1">
                <span>{event.availableTickets} left</span>
                <span>{soldPercent}% sold</span>
              </div>
              <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${soldPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
            <span className="text-sm font-semibold text-ink-900">
              {event.price === 0 ? 'Free' : formatCurrency(event.price)}
            </span>
            <span className="text-xs text-ink-500">
              by {event.creator?.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}