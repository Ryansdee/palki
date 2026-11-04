'use client';

import { useEffect, useState } from 'react';
import ProduitCard from '@/components/ProduitCard';
import { getProduits, type Produit } from '@/lib/produits';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

export default function BoutiquePage() {
  const [produits, setProduits] = useState<Produit[] | null>(null);

  useEffect(() => {
    getProduits(ORG_ID).then(setProduits);
  }, []);

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Boutique</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Nos produits
        </h1>
        <p className="mt-5 leading-relaxed text-ink/65">
          Les produits que nous utilisons et recommandons à l’institut. Pour en
          commander un, écrivez-nous : retrait sur place à Ixelles.
        </p>
      </header>

      {produits === null ? (
        <div className="mt-16 h-64" />
      ) : produits.length === 0 ? (
        <p className="mx-auto mt-16 max-w-md border border-dashed border-sand px-6 py-12 text-center text-ink/50">
          Aucun produit pour le moment. Revenez bientôt.
        </p>
      ) : (
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {produits.map((p) => (
            <ProduitCard key={p.id} produit={p} />
          ))}
        </div>
      )}
    </div>
  );
}