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
  { href: '/admin/disponibilites', label: 'Disponibilités' },
  { href: '/admin/reservations', label: 'Réservations' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-sand bg-cloud">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-sans text-sm font-light tracking-[0.4em] text-ink">
            PALKI
          </span>
          <nav className="flex flex-wrap gap-5">
            {LINKS.map((l) => {
              const active =
                l.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-xs uppercase tracking-[0.15em] transition-colors hover:text-plum ${
                    active ? 'text-plum' : 'text-ink/60'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.15em] text-ink/60 hover:text-plum"
          >
            Voir le site
          </Link>
          <button
            onClick={() => signOut(getAuthClient())}
            className="text-xs uppercase tracking-[0.15em] text-ink/60 hover:text-plum"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
