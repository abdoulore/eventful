import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white mt-auto">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900">
            <img src="/images/logo.png" alt="Eventful" className="h-7 w-auto" />
          </Link>

          <p className="text-sm text-ink-500">
            © {new Date().getFullYear()} Eventful. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-sm text-ink-500">
            <Link href="/" className="hover:text-ink-900 transition-colors">Discover</Link>
            <Link href="/login" className="hover:text-ink-900 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-ink-900 transition-colors">Sign up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
