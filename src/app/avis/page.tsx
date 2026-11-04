'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Etoiles from '@/components/Etoiles';
import CarteAvis from '@/components/CarteAvis';
import { getAvisPublies, statsAvis } from '@/lib/data';
import type { Avis } from '@/lib/types';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

export default function PageAvis() {
  const [avis, setAvis] = useState<Avis[] | null>(null);

  useEffect(() => {
    getAvisPublies(ORG_ID).then(setAvis);
  }, []);

  const { moyenne, total, repartition } = statsAvis(avis ?? []);

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="text-center">
        <p className="eyebrow">Avis clientes</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">Elles en parlent</h1>
      </header>

      {avis === null ? (
        <div className="mx-auto mt-16 h-40 max-w-3xl animate-pulse bg-sand/40" />
      ) : total === 0 ? (
        <p className="mt-16 text-center text-ink/60">Aucun avis publié pour le moment.</p>
      ) : (
        <>
          <div className="mx-auto mt-14 grid max-w-3xl items-center gap-10 sm:grid-cols-[auto,1fr]">
            <div className="text-center">
              <p className="font-display text-7xl leading-none text-ink">
                {moyenne.toLocaleString('fr-BE', { minimumFractionDigits: 1 })}
              </p>
              <Etoiles note={moyenne} taille={22} className="mt-3" />
              <p className="mt-2 text-sm text-ink/55">{total} avis</p>
            </div>
            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map((n) => (
                <div key={n} className="flex items-center gap-3 text-sm text-ink/60">
                  <span className="w-3 text-right">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden bg-sand">
                    <div className="h-full bg-plum" style={{ width: `${(repartition[n] / total) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right">{repartition[n]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {avis.map((a) => (
              <CarteAvis key={a.id} a={a} />
            ))}
          </div>
        </>
      )}

      <p className="mx-auto mt-16 max-w-2xl text-center text-sm leading-relaxed text-ink/50">
        Les avis marqués «&nbsp;Rendez-vous vérifié&nbsp;» ont été laissés via un lien
        personnel envoyé après une réservation. Les autres proviennent de clientes
        venues à l&apos;institut sans réserver en ligne. Tous les avis sont relus
        avant publication et publiés, positifs comme négatifs, à l&apos;exception
        de ceux contenant des propos injurieux ou des données personnelles.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/rendez-vous" className="btn-solid">Prendre rendez-vous</Link>
        <Link href="/laisser-un-avis-sans-reservation" className="btn-outline">Laisser un avis</Link>
      </div>
    </div>
  );
}