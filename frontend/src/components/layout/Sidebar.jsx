'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarPlus, Calendar, CreditCard, BarChart2 } from 'lucide-react';

const links = [
  { href: '/dashboard',              label: 'Overview',  icon: LayoutDashboard },
  { href: '/dashboard/events',       label: 'My Events', icon: Calendar        },
  { href: '/dashboard/events/new',   label: 'New Event', icon: CalendarPlus    },
  { href: '/dashboard/payments',     label: 'Payments',  icon: CreditCard      },
  { href: '/dashboard/analytics',    label: 'Analytics', icon: BarChart2       },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 hidden lg:flex flex-col gap-1 pt-2">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-100 hover:text-ink-900'}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}