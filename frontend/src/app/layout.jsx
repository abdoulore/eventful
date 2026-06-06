import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-50`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f1117',
              color: '#f8f9fb',
              borderRadius: '0.875rem',
              fontSize: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  );
}