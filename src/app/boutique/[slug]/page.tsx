'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Carousel from '@/components/Carousel';
import { getSettings, formatEuro, DEFAULT_SETTINGS } from '@/lib/data';
import { getProduit, lienWhatsAppProduit, type Produit } from '@/lib/produits';
import type { Settings } from '@/lib/types';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

export default function ProduitDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [produit, setProduit] = useState<Produit | null | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!slug) return;
    getProduit(ORG_ID, slug).then(setProduit);
    getSettings(ORG_ID).then(setSettings);
  }, [slug]);

  if (produit === undefined) {
    return <div className="mx-auto max-w-content px-6 py-32" />;
  }
  if (produit === null) return notFound();

  const remise = !!produit.prixBarre && produit.prixBarre > produit.prix;

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <Link href="/boutique" className="link-underline">
        <span aria-hidden>←</span> Toute la boutique
      </Link>

      <div className="mt-10 grid gap-14 lg:grid-cols-2">
        <div className="frame p-3">
          <Carousel images={produit.images} alt={produit.nom} aspect="aspect-square" />
        </div>

        <div>
          <p className="eyebrow">Produit</p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">
            {produit.nom}
          </h1>

          <p className="mt-6 font-display text-3xl">
            {remise && (
              <span className="mr-3 text-2xl text-ink/40 line-through">
                {formatEuro(produit.prixBarre!)}
              </span>
            )}
            <span className={remise ? 'text-plum' : 'text-ink'}>
              {formatEuro(produit.prix)}
            </span>
          </p>

          {!produit.disponible && (
            <p className="mt-4 inline-block border border-sand bg-cloud px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink/70">
              Épuisé pour le moment
            </p>
          )}

          <div className="mt-8 max-w-prose space-y-4 leading-relaxed text-ink/70">
            {produit.description
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={lienWhatsAppProduit(settings.telephone, produit)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
            >
              {produit.disponible ? 'Commander via WhatsApp' : 'Être prévenue du retour'}
            </a>
            <Link href="/contact" className="btn-outline">
              Nous contacter
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink/45">
            Retrait et paiement à l’institut, {settings.adresse}.
          </p>
        </div>
      </div>
    </div>
  );
}