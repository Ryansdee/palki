'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPromotions, getServices, DEFAULT_SERVICES } from '@/lib/data';
import type { Promotion, Service } from '@/lib/types';

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getServices().then((s) => s.length && setServices(s));
    getPromotions().then((p) => {
      setPromos(p);
      setLoaded(true);
    });
  }, []);

  const nomCible = (cible: string) =>
    cible === 'tout'
      ? 'Tous les soins'
      : services.find((s) => s.slug === cible)?.nom ?? cible;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">Offres du moment</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Promotions
        </h1>
        <p className="mt-5 leading-relaxed text-ink/65">
          Découvrez nos promotions en cours et profitez d&apos;offres exceptionnelles sur nos soins de beauté. Que vous souhaitiez un soin du visage, une épilation au fil ou un henné naturel, nous avons des offres adaptées à vos besoins pour vous permettre de prendre soin de vous à prix avantageux.
        </p>
      </header>

      <div className="mt-16 space-y-6">
        {promos.map((p) => (
          <article
            key={p.id}
            className="frame flex flex-col gap-4 bg-cloud px-8 py-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="eyebrow text-plum">{nomCible(p.cible)}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{p.titre}</h2>
              <p className="mt-2 text-ink/70">{p.description}</p>
            </div>
            <div className="shrink-0 text-center">
              <span className="font-display text-5xl text-plum">
                {p.type === 'pourcentage' ? `-${p.valeur}%` : `-${p.valeur}€`}
              </span>
            </div>
          </article>
        ))}

        {loaded && promos.length === 0 && (
          <div className="border border-sand bg-cloud px-8 py-16 text-center">
            <p className="font-display text-2xl text-ink/70">
              Aucune promotion en ce moment.
            </p>
            <p className="mt-2 text-ink/55">
              Revenez bientôt pour découvrir nos prochaines offres.
            </p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <Link href="/rendez-vous" className="btn-solid">
          Prendre rendez-vous
        </Link>
      </div>
    </div>
  );
}
