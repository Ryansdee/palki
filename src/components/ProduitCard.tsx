import Link from 'next/link';
import { formatEuro } from '@/lib/data';
import type { Produit } from '@/lib/produits';

export default function ProduitCard({ produit }: { produit: Produit }) {
  const cover = produit.images[0];
  const remise = !!produit.prixBarre && produit.prixBarre > produit.prix;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/boutique/${produit.slug}`}
        className="relative block aspect-square overflow-hidden bg-sand"
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={produit.nom}
            className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              produit.disponible ? '' : 'opacity-60'
            }`}
          />
        )}
        <span className="pointer-events-none absolute inset-3 border border-cloud/40" />
        {!produit.disponible && (
          <span className="absolute left-5 top-5 bg-cloud px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink">
            Épuisé
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl text-ink">{produit.nom}</h3>
          <span className="whitespace-nowrap font-display text-xl">
            {remise && (
              <span className="mr-2 text-base text-ink/40 line-through">
                {formatEuro(produit.prixBarre!)}
              </span>
            )}
            <span className={remise ? 'text-plum' : 'text-ink'}>
              {formatEuro(produit.prix)}
            </span>
          </span>
        </div>
        <p className="mt-2 flex-1 leading-relaxed text-ink/65">{produit.resume}</p>
        <Link href={`/boutique/${produit.slug}`} className="link-underline mt-5">
          Voir le produit
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}