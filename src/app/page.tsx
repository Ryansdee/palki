'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ServiceCard from '@/components/ServiceCard';
import {
  getServices,
  DEFAULT_SERVICES,
  getHoraires,
  DEFAULT_HORAIRES,
  JOURS,
} from '@/lib/data';
import type { Service, HoraireJour } from '@/lib/types';

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

export default function Home() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [horaires, setHoraires] = useState<HoraireJour[]>(DEFAULT_HORAIRES);

  useEffect(() => {
    getServices(ORG_ID).then((s) => s.length && setServices(s));
    getHoraires(ORG_ID).then((h) => h.length && setHoraires(h));
  }, []);

  const today = jourActuel();

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