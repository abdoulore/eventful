'use client';

import { useState } from 'react';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import QRDisplay from './QRDisplay';
import { MapPin, Calendar, QrCode } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

const statusVariant = {
  ACTIVE:    'success',
  SCANNED:   'default',
  CANCELLED: 'danger',
};

export default function TicketCard({ ticket }) {
  const [showQR, setShowQR] = useState(false);
  const { event } = ticket;

  return (
    <>
      <div className="card overflow-hidden">
        {/* Top stripe */}
        <div className={`h-1.5 ${ticket.status === 'ACTIVE' ? 'bg-brand-500' : ticket.status === 'SCANNED' ? 'bg-ink-300' : 'bg-red-400'}`} />

        <div className="p-5 flex gap-4">
          {/* Event image */}
          <div className="w-16 h-16 rounded-xl bg-surface-100 overflow-hidden shrink-0">
            {event?.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <QrCode size={20} className="text-ink-300" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-ink-900 text-sm leading-snug truncate">
                {event?.title}
              </h3>
              <Badge variant={statusVariant[ticket.status]} className="shrink-0">
                {ticket.status}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-ink-500">
                <Calendar size={11} />
                {formatDateTime(event?.startDate)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink-500">
                <MapPin size={11} />
                {event?.location}
              </div>
            </div>
          </div>
        </div>

        {/* Divider with dashes */}
        <div className="mx-5 border-t border-dashed border-surface-200" />

        <div className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">Ticket code</p>
            <code className="text-xs text-ink-700">{ticket.ticketCode.slice(0, 12)}...</code>
          </div>
          {ticket.status === 'ACTIVE' && (
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-600
                hover:text-brand-700 transition-colors"
            >
              <QrCode size={14} />
              Show QR
            </button>
          )}
        </div>
      </div>

      <Modal
        open={showQR}
        onClose={() => setShowQR(false)}
        title={event?.title}
        size="sm"
      >
        <QRDisplay ticketCode={ticket.ticketCode} eventTitle={event?.title} />
      </Modal>
    </>
  );
}