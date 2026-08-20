'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/soins', label: 'Soins' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/promotions', label: 'Promotions' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? 'border-sand bg-porcelain shadow-[0_1px_0_rgba(54,43,39,0.04)]'
          : 'border-transparent bg-porcelain'
      }`}
    >
      <nav className="mx-auto flex h-20 max-w-content items-center justify-between px-6">
        <Link href="/" className="frame px-3 py-1" aria-label="Palki, accueil">
          <span className="font-sans text-lg font-light tracking-[0.4em] text-ink">
            PALKI
          </span>
        </Link>

        <ul className="hidden items-center gap-9 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-xs uppercase tracking-[0.2em] transition-colors hover:text-plum ${
                  isActive(l.href) ? 'text-plum' : 'text-ink/70'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Link href="/rendez-vous" className="btn-solid !py-3 !px-6">
            Rendez-vous
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          <span
            className={`h-px w-6 bg-ink transition-transform ${
              open ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-px w-6 bg-ink transition-opacity ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`h-px w-6 bg-ink transition-transform ${
              open ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {open && (
        <div className="border-t border-sand bg-porcelain lg:hidden">
          <ul className="mx-auto flex max-w-content flex-col px-6 py-4">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block py-3 text-sm uppercase tracking-[0.2em] ${
                    isActive(l.href) ? 'text-plum' : 'text-ink/80'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Link href="/rendez-vous" className="btn-solid w-full">
                Prendre rendez-vous
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
