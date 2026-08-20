'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getServices,
  getTarifs,
  getPromotions,
  promoPourService,
  prixApresPromo,
  formatEuro,
  DEFAULT_SERVICES,
} from '@/lib/data';
import type { Service, Tarif, Promotion } from '@/lib/types';

export default function TarifsPage() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    getServices().then((s) => s.length && setServices(s));
    getTarifs().then(setTarifs);
    getPromotions().then(setPromos);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">Prestations & prix</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Nos tarifs
        </h1>
        <p className="mt-5 leading-relaxed text-ink/65">
          [slug — note sur les tarifs, à compléter.]
        </p>
      </header>

      {promos.length > 0 && (
        <div className="mt-12 border border-mauve/40 bg-cloud px-6 py-5 text-center">
          <p className="eyebrow text-plum">Promotions en cours</p>
          <ul className="mt-2 space-y-1 text-ink/75">
            {promos.map((p) => (
              <li key={p.id}>
                <span className="text-ink">{p.titre}</span> — {p.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-16 space-y-16">
        {services.map((service) => {
          const items = tarifs
            .filter((t) => t.serviceSlug === service.slug)
            .sort((a, b) => a.ordre - b.ordre);
          if (items.length === 0) return null;
          const promo = promoPourService(service.slug, promos);

          return (
            <section key={service.slug}>
              <div className="flex items-baseline justify-between border-b border-sand pb-4">
                <h2 className="font-display text-3xl text-ink">{service.nom}</h2>
                <Link
                  href={`/soins/${service.slug}`}
                  className="link-underline"
                >
                  Détails <span aria-hidden>→</span>
                </Link>
              </div>

              <ul className="divide-y divide-sand">
                {items.map((t) => {
                  const prixFinal = prixApresPromo(t.prix, promo);
                  const remise = prixFinal < t.prix;
                  return (
                    <li
                      key={t.id}
                      className="flex items-baseline justify-between gap-4 py-4"
                    >
                      <span>
                        <span className="text-ink">{t.nom}</span>
                        <span className="ml-3 text-sm text-ink/45">
                          {t.dureeMin} min
                        </span>
                      </span>
                      <span className="whitespace-nowrap font-display text-xl">
                        {remise && (
                          <span className="mr-2 text-base text-ink/40 line-through">
                            {formatEuro(t.prix)}
                          </span>
                        )}
                        <span className={remise ? 'text-plum' : 'text-ink'}>
                          {formatEuro(prixFinal)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-20 text-center">
        <Link href="/rendez-vous" className="btn-solid">
          Prendre rendez-vous
        </Link>
      </div>
    </div>
  );
}
