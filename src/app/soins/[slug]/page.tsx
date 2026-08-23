'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
  getService,
  getTarifsByService,
  getPromotions,
  promoPourService,
  promoPourTarif,
  prixApresPromo,
  formatEuro,
} from '@/lib/data';
import type { Service, Tarif, Promotion } from '@/lib/types';

export default function ServiceDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [service, setService] = useState<Service | null | undefined>(undefined);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    if (!slug) return;
    getService(slug).then(setService);
    getTarifsByService(slug).then(setTarifs);
    getPromotions().then(setPromos);
  }, [slug]);

  if (service === undefined) {
    return <div className="mx-auto max-w-content px-6 py-32" />;
  }
  if (service === null) return notFound();

  // Promo au niveau du service → sert uniquement au bandeau d'annonce.
  const promoService = promoPourService(service.slug, promos);

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <Link href="/soins" className="link-underline">
        <span aria-hidden>←</span> Tous les soins
      </Link>

      <div className="mt-10 grid gap-14 lg:grid-cols-2">
        <div className="frame p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image}
            alt={service.nom}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div>
          <p className="eyebrow">Soin</p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">
            {service.nom}
          </h1>
          <p className="mt-6 max-w-prose leading-relaxed text-ink/70">
            {service.description}
          </p>

          {promoService && (
            <div className="mt-8 border border-mauve/40 bg-cloud px-5 py-4">
              <p className="eyebrow text-plum">{promoService.titre}</p>
              <p className="mt-1 text-sm text-ink/70">
                {promoService.description}
              </p>
            </div>
          )}

          {tarifs.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow">Tarifs</p>
              <ul className="mt-4 divide-y divide-sand border-t border-sand">
                {tarifs.map((t) => {
                  // Promo appliquée ligne par ligne : un tarif précis
                  // (tarifCible) ou tout le service, selon la promo.
                  const promoT = promoPourTarif(t, promos);
                  const prixFinal = prixApresPromo(t.prix, promoT);
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
            </div>
          )}

          <Link
            href={`/rendez-vous?service=${service.slug}`}
            className="btn-solid mt-10"
          >
            Réserver ce soin
          </Link>
        </div>
      </div>
    </div>
  );
}