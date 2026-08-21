'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSettings, DEFAULT_SETTINGS } from '@/lib/data';
import type { Settings } from '@/lib/types';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="mt-24 border-t border-sand bg-cloud">
      <div className="mx-auto grid max-w-content gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <span className="frame inline-block px-3 py-1 font-sans text-base font-light tracking-[0.4em] text-ink">
            PALKI
          </span>
          <p className="mt-5 max-w-xs font-display text-lg leading-relaxed text-ink/70">
            Au fil de la beauté. Institut de beauté à Ixelles.
          </p>
        </div>

        <div>
          <p className="eyebrow">Nous trouver</p>
          <address className="mt-4 not-italic leading-relaxed text-ink/80">
            {settings.adresse}
            <br />
            <a
              href={`tel:${settings.telephone.replace(/\s/g, '')}`}
              className="mt-3 inline-block transition-colors hover:text-plum"
            >
              {settings.telephone}
            </a>
          </address>
        </div>

        <div>
          <p className="eyebrow">Navigation</p>
          <ul className="mt-4 space-y-2 text-ink/80">
            {[
              ['/soins', 'Nos soins'],
              ['/tarifs', 'Nos tarifs'],
              ['/galerie', 'Galerie'],
              ['/promotions', 'Promotions'],
              ['/rendez-vous', 'Prendre rendez-vous'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-plum">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-sand">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-2 px-6 py-6 text-xs uppercase tracking-[0.2em] text-ink/50 sm:flex-row">
          <span>© 2024 - {new Date().getFullYear()} Palki</span>
          <span>Site web par <a href="https://ryansdee.netlify.app/" target="_blank" rel="noopener noreferrer" className="transition-colors underline hover:text-plum">Ryansdee</a></span>
          <span>Au fil de la beauté</span>
        </div>
      </div>
    </footer>
  );
}
