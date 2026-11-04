'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';

const LINKS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/tarifs', label: 'Tarifs' },
  { href: '/admin/promotions', label: 'Promotions' },
  { href: '/admin/galeries', label: 'Galeries' },
  { href: '/admin/creneaux', label: 'Créneaux' },
  { href: '/admin/disponibilites', label: 'Disponibilités' },
  { href: '/admin/reservations', label: 'Réservations' },
    { href: '/admin/avis', label: 'Avis' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Palki
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active =
                l.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Voir le site
          </Link>
          <button
            onClick={() => signOut(getAuthClient())}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Nav mobile */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {LINKS.map((l) => {
          const active =
            l.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}