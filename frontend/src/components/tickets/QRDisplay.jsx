'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

export default function QRDisplay({ ticketCode, eventTitle }) {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-${ticketCode}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `ticket-${ticketCode.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-2xl border border-surface-200">
        <QRCodeSVG
          id={`qr-${ticketCode}`}
          value={ticketCode}
          size={160}
          level="H"
          includeMargin
        />
      </div>
      <p className="text-xs text-ink-500 text-center">
        Show this QR code at the event entrance
      </p>
      <button
        onClick={handleDownload}
        className="btn-secondary text-xs flex items-center gap-1.5"
      >
        <Download size={13} />
        Download QR
      </button>
    </div>
  );
}