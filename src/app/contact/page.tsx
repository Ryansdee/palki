'use client';

import { useEffect, useState } from 'react';
import {
  getSettings,
  getHoraires,
  DEFAULT_SETTINGS,
  DEFAULT_HORAIRES,
} from '@/lib/data';
import type { Settings, HoraireJour } from '@/lib/types';

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [horaires, setHoraires] = useState<HoraireJour[]>(DEFAULT_HORAIRES);

  useEffect(() => {
    getSettings().then(setSettings);
    getHoraires().then(setHoraires);
  }, []);

  const mapsQuery = encodeURIComponent(settings.adresse);

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Nous rencontrer</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Contact
        </h1>
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Adresse</p>
          <p className="mt-3 font-display text-2xl leading-relaxed text-ink">
            {settings.adresse}
          </p>

          <p className="eyebrow mt-10">Téléphone</p>
          <a
            href={`tel:${settings.telephone.replace(/\s/g, '')}`}
            className="mt-3 inline-block font-display text-2xl text-ink transition-colors hover:text-plum"
          >
            {settings.telephone}
          </a>

          <p className="eyebrow mt-10">Horaires</p>
          <ul className="mt-3 max-w-sm divide-y divide-sand border-t border-sand">
            {horaires.map((h) => (
              <li
                key={h.jour}
                className="flex justify-between py-3 capitalize text-ink/80"
              >
                <span>{h.jour}</span>
                <span className="text-ink/60">
                  {h.ferme || h.creneaux.length === 0
                    ? 'Fermé'
                    : h.creneaux
                        .map((c) => `${c.debut} – ${c.fin}`)
                        .join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="frame p-3">
          <iframe
            title="Plan d'accès Palki"
            src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
            className="h-full min-h-[420px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
