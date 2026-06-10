'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="rounded-2xl bg-white/70 px-5 py-3 shadow-inset">
            <img src="/images/logo.png" alt="Eventful" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-ink-900">Reset password</h1>
            <p className="text-sm text-ink-500 mt-1">
              Enter your email and we will send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-700">
                If an account exists for that email, a password reset link has been sent.
              </div>
              <Link href="/login" className="btn-primary text-sm w-full justify-center">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-700">Email</label>
                <input
                  type="email"
                  placeholder="enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 justify-center">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
