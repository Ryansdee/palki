'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ServiceCard from '@/components/ServiceCard';
import {
  getServices,
  DEFAULT_SERVICES,
  getHoraires,
  DEFAULT_HORAIRES,
  getSettings,
  DEFAULT_SETTINGS,
  JOURS,
} from '@/lib/data';
import type { Service, HoraireJour, Settings } from '@/lib/types';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const jourActuel = () => JOURS[(new Date().getDay() + 6) % 7];

// Org du site public. Repli sur l'org Palki si la variable d'env n'est pas
// définie (mono-institut). Pour du multi-domaine, résous par host.
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

// Texte affiché pour un jour donné (ouvert avec plages / sur RDV / fermé).
const libelleHoraire = (h: HoraireJour): string => {
  if (h.surRdv) return 'Sur rendez-vous';
  if (h.ferme || h.creneaux.length === 0) return 'Fermé';
  return h.creneaux.map((c) => `${c.debut} – ${c.fin}`).join(', ');
};

// Normalise un handle ou une URL en lien complet.
const socialUrl = (base: string, value: string): string => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${base}${value.replace(/^@/, '')}`;
};

export default function Home() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [horaires, setHoraires] = useState<HoraireJour[]>(DEFAULT_HORAIRES);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getServices(ORG_ID).then((s) => s.length && setServices(s));
    getHoraires(ORG_ID).then((h) => h.length && setHoraires(h));
    getSettings(ORG_ID).then(setSettings);
  }, []);

  const today = jourActuel();

  const instagram = socialUrl('https://instagram.com/', settings.instagram ?? '');
  const tiktok = socialUrl('https://tiktok.com/@', settings.tiktok ?? '');

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1900&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/40" />

        <div className="relative z-10 px-6 text-center text-cloud">
          <p className="eyebrow text-cloud/80">Au fil de la beauté</p>
          <div className="frame mx-auto mt-6 inline-block px-10 py-6">
            <h1 className="font-display text-6xl font-light tracking-[0.3em] sm:text-7xl">
              PALKI
            </h1>
          </div>
          <p className="mx-auto mt-8 max-w-md font-display text-xl leading-relaxed text-cloud/90">
            Votre moment de beauté à Ixelles, pour un soin du visage, une épilation au fil ou un henné naturel.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/rendez-vous" className="btn-solid">
              Prendre rendez-vous
            </Link>
            <Link
              href="/soins"
              className="btn-outline border-cloud/40 text-cloud hover:border-cloud hover:text-cloud"
            >
              Découvrir nos soins
            </Link>
          </div>

          {/* Réseaux sociaux */}
          {(instagram || tiktok) && (
            <div className="mt-10 flex items-center justify-center gap-4">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cloud/40 text-cloud transition-colors hover:border-cloud hover:bg-cloud hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cloud/40 text-cloud transition-colors hover:border-cloud hover:bg-cloud hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Intro ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-6 py-24">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div className="relative">
            <div className="frame p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://palki.be/wp-content/uploads/2022/08/image-1.png"
                alt="https://palki.be/wp-content/uploads/2022/08/image-1.png"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
          <div>
            <p className="eyebrow">Bienvenue</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Un institut à votre image, au cœur d&apos;Ixelles
            </h2>
            <p className="mt-6 leading-relaxed text-ink/70">
              Venez profiter d'un moment de beauté et de détente dans notre institut, où nous vous proposons des soins personnalisés pour révéler votre éclat naturel.
            </p>
            <p className="mt-4 leading-relaxed text-ink/70">
              Que vous souhaitiez un soin du visage, une épilation au fil ou un henné naturel, notre équipe est là pour vous offrir une expérience unique et agréable.
            </p>
            <Link href="/soins" className="link-underline mt-8">
              Lire plus <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disponibilités ────────────────────────────────────── */}
      <section className="border-y border-sand bg-cloud">
        <div className="mx-auto grid max-w-content gap-12 px-6 py-20 md:grid-cols-[1fr,1.15fr] md:items-center">
          <div>
            <p className="eyebrow">Horaires</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Nos disponibilités
            </h2>
            <p className="mt-6 leading-relaxed text-ink/70">
              Les horaires peuvent évoluer d&apos;une semaine à l&apos;autre. Pour
              être sûre de votre créneau, réservez directement en ligne.
            </p>
            <Link href="/rendez-vous" className="btn-solid mt-8">
              Prendre rendez-vous
            </Link>
          </div>

          <div className="frame p-8">
            <ul>
              {horaires.map((h) => {
                const actif = h.jour === today;
                return (
                  <li
                    key={h.jour}
                    className={`flex items-center justify-between border-b border-sand py-3.5 last:border-0 ${
                      actif ? 'text-plum' : 'text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-3 font-sans text-sm uppercase tracking-[0.18em]">
                      {cap(h.jour)}
                      {actif && (
                        <span className="rounded-full bg-plum px-2 py-0.5 text-[10px] tracking-[0.15em] text-cloud">
                          Aujourd&apos;hui
                        </span>
                      )}
                    </span>
                    <span className="font-display text-lg">
                      {libelleHoraire(h)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Aperçu des soins ──────────────────────────────────── */}
      <section className="mx-auto max-w-content px-6 pb-8">
        <div className="flex items-end justify-between border-b border-sand pb-6">
          <div>
            <p className="eyebrow">Nos prestations</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              Nos soins
            </h2>
          </div>
          <Link href="/soins" className="link-underline hidden sm:inline-flex">
            Tout voir <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* ── Bandeau henné (page dédiée) ───────────────────────── */}
      <section className="mx-auto mt-24 max-w-content px-6">
        <div className="relative overflow-hidden bg-plum px-8 py-16 text-center text-cloud sm:px-16 sm:py-20">
          <p className="eyebrow text-rose">La signature Palki</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Henné naturel à base d&apos;huiles essentielles
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-cloud/80">
            Découvrez l’expérience signature Palki : un henné naturel préparé avec soin à partir d’ingrédients sélectionnés et d’huiles essentielles. Une parenthèse de douceur pensée pour sublimer vos cheveux, révéler leur éclat et vous offrir un véritable moment de bien-être.
          </p>
          <Link
            href="/soins/henne"
            className="btn-outline mt-10 border-cloud/50 text-cloud hover:border-cloud hover:text-cloud"
          >
            Découvrir le henné
          </Link>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-content px-6 py-24 text-center">
        <p className="eyebrow">Sur rendez-vous</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
          Réservez votre moment de beauté
        </h2>
        <p className="mx-auto mt-5 max-w-lg leading-relaxed text-ink/65">
          Prenez rendez-vous dès maintenant pour profiter d'un soin du visage, d'une épilation au fil ou d'un henné naturel. Notre équipe vous accueillera avec soin et attention pour vous offrir une expérience unique et relaxante.
        </p>
        <Link href="/rendez-vous" className="btn-solid mt-9">
          Prendre rendez-vous
        </Link>
      </section>
    </>
  );
}