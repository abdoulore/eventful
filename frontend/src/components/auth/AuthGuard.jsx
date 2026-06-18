'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '../../lib/auth';
import toast from 'react-hot-toast';

const homeFor = (role) => (role === 'CREATOR' ? '/dashboard' : '/events');

/**
 * Guards a subtree so only the right kind of account can see it.
 * - Not logged in        -> /login
 * - Logged in, wrong role -> their own home (never the login screen)
 * Renders nothing until the check passes, so host/guest UI never flashes.
 */
export default function AuthGuard({ role, children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const user = getUser();
    if (role && user?.role !== role) {
      toast.error(role === 'CREATOR' ? 'That area is for hosts.' : 'That area is for guests.');
      router.replace(homeFor(user?.role));
      return;
    }

    setAuthorized(true);
  }, [role, router]);

  if (!authorized) return null;
  return children;
}
