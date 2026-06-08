import { Manrope, Space_Grotesk, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const body = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
});

const display = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Eventful - Your Passport to Unforgettable Moments',
  description:
    'Discover and attend the best concerts, theatre performances, sports events and cultural gatherings near you.',
  openGraph: {
    title: 'Eventful',
    description: 'Your passport to unforgettable moments',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} ${geistMono.variable} antialiased bg-surface-50`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111712',
              color: '#f5f7f4',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  );
}
