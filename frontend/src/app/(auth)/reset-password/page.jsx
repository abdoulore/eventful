'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!token) errs.token = 'Reset link is missing or invalid';
    if (!form.password || form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setDone(true);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reset password');
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
            <h1 className="font-display text-3xl font-bold text-ink-900">Choose a new password</h1>
            <p className="text-sm text-ink-500 mt-1">
              Your reset link expires 30 minutes after it was sent.
            </p>
          </div>

          {done ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-700">
                Your password has been reset. You can sign in with your new password.
              </div>
              <Link href="/login" className="btn-primary text-sm w-full justify-center">
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errors.token && <p className="text-sm text-red-500">{errors.token}</p>}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-700">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="enter your new password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-700">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="re-enter your new password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`input ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <button type="submit" disabled={loading || !token} className="btn-primary w-full mt-2 justify-center">
                {loading ? 'Saving...' : 'Reset password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
