'use client';

import { useEffect, useState } from 'react';
import {
  getSettings,
  getHoraires,
  DEFAULT_SETTINGS,
  DEFAULT_HORAIRES,
} from '@/lib/data';
import type { Settings, HoraireJour } from '@/lib/types';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

// Sujets de contact WhatsApp et message prérempli associé.
type SujetKey =
  | 'infos'
  | 'rdv'
  | 'services'
  | 'tarif'
  | 'autre';

const SUJETS: { key: SujetKey; label: string; message: string }[] = [
  {
    key: 'infos',
    label: "Demande d'informations",
    message:
      "Bonjour 👋\nJe vous contacte depuis votre site internet.\nJe souhaiterais obtenir plus d'informations concernant vos services.",
  },
  {
    key: 'rdv',
    label: 'Prendre rendez-vous',
    message:
      'Bonjour 👋\nJe vous contacte depuis votre site internet.\nJe souhaiterais prendre rendez-vous avec vous.',
  },
  {
    key: 'services',
    label: 'Question concernant les services',
    message:
      "Bonjour 👋\nJe vous contacte depuis votre site internet.\nJ'aurais une question concernant vos services.",
  },
  {
    key: 'tarif',
    label: 'Demande de prix / tarif',
    message:
      'Bonjour 👋\nJe vous contacte depuis votre site internet.\nJe souhaiterais obtenir des informations concernant vos tarifs.',
  },
  {
    key: 'autre',
    label: 'Autre demande',
    message:
      'Bonjour 👋\nJe vous contacte depuis votre site internet.\nJe souhaiterais vous contacter concernant : ',
  },
];

// Transforme un numéro (ex. "+32 498 12 34 56") au format wa.me ("32498123456").
const toWhatsAppNumber = (tel: string): string =>
  tel.replace(/\D/g, '');

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [horaires, setHoraires] = useState<HoraireJour[]>(DEFAULT_HORAIRES);
  const [sujet, setSujet] = useState<SujetKey>('infos');

  useEffect(() => {
    getSettings(ORG_ID).then(setSettings);
    getHoraires(ORG_ID).then((h) => h.length && setHoraires(h));
  }, []);

  const mapsQuery = encodeURIComponent(settings.adresse);

  const numeroWhatsApp = toWhatsAppNumber(settings.telephone);
  const message =
    SUJETS.find((s) => s.key === sujet)?.message ?? SUJETS[0].message;
  const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
    message
  )}`;

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
          <button
            type="button"
            onClick={() => {
              window.location.href = `tel:${settings.telephone.replace(/\D/g, '')}`;
            }}
            className="mt-3 inline-block font-display text-2xl text-ink transition-colors hover:text-plum"
          >
            {settings.telephone.replace(/^\+?32/, '0')}
          </button>

          <p className="eyebrow mt-10">Nous écrire sur WhatsApp</p>
          <div className="mt-3 max-w-sm">
            <label htmlFor="sujet" className="sr-only">
              Sujet de votre demande
            </label>
            <select
              id="sujet"
              value={sujet}
              onChange={(e) => setSujet(e.target.value as SujetKey)}
              className="w-full border border-sand bg-transparent px-4 py-3 font-sans text-sm text-ink outline-none transition-colors focus:border-plum"
            >
              {SUJETS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-plum px-6 py-3 font-sans text-sm uppercase tracking-[0.15em] text-cloud transition-colors hover:bg-ink"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
                aria-hidden
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Nous contacter sur WhatsApp
            </a>
          </div>
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