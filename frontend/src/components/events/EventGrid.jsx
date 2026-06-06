import EventCard from './EventCard';
import { Calendar } from 'lucide-react';

export default function EventGrid({ events, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="h-44 bg-surface-100" />
            <div className="p-4 flex flex-col gap-3">
              <div className="h-4 bg-surface-100 rounded w-3/4" />
              <div className="h-3 bg-surface-100 rounded w-1/2" />
              <div className="h-3 bg-surface-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Calendar size={24} className="text-ink-300" />
        </div>
        <h3 className="font-semibold text-ink-900 mb-1">No events found</h3>
        <p className="text-sm text-ink-500">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}