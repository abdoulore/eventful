'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { getUser, clearAuth, isAuthenticated, isCreator } from '../../lib/auth';
import { getInitials } from '../../lib/utils';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue logout even if API call fails
    } finally {
      clearAuth();
      setUser(null);
      router.push('/');
      toast.success('Logged out successfully');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900">
            <img src="/images/logo.png" alt="Eventful" className="h-8 w-auto" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-ink-700 hover:text-ink-900 transition-colors">
              Discover
            </Link>

            {user ? (
              <>
                {isCreator() ? (
                  <Link href="/dashboard" className="text-sm text-ink-700 hover:text-ink-900 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/tickets" className="text-sm text-ink-700 hover:text-ink-900 transition-colors">
                    My Tickets
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-surface-200 flex flex-col gap-3">
            <Link href="/" className="text-sm text-ink-700 py-2">Discover</Link>
            {user ? (
              <>
                {isCreator() ? (
                  <Link href="/dashboard" className="text-sm text-ink-700 py-2">Dashboard</Link>
                ) : (
                  <Link href="/tickets" className="text-sm text-ink-700 py-2">My Tickets</Link>
                )}
                <button onClick={handleLogout} className="text-sm text-ink-500 py-2 text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-ink-700 py-2">Login</Link>
                <Link href="/register" className="text-sm text-ink-700 py-2">Sign up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
