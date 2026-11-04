import Etoiles from '@/components/Etoiles';
import type { Avis } from '@/lib/types';

const moisAnnee = (t: number) =>
  new Date(t).toLocaleDateString('fr-BE', { month: 'long', year: 'numeric' });

export default function CarteAvis({ a }: { a: Avis }) {
  return (
    <article className="border border-sand bg-cloud px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Etoiles note={a.note} taille={16} />
        <span className="text-xs uppercase tracking-[0.15em] text-ink/45">{moisAnnee(a.createdAt)}</span>
      </div>
      <p className="mt-4 leading-relaxed text-ink/80">« {a.commentaire} »</p>
      <p className="mt-4 text-sm text-ink/60">
        <span className="font-medium text-ink">{a.prenom}</span> · {a.prestation}
      </p>
      {a.source !== 'libre' && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-plum">
          <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Rendez-vous vérifié
        </p>
      )}
      {a.reponse && (
        <div className="mt-5 border-l-2 border-mauve pl-4">
          <p className="eyebrow">Réponse de Palki</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{a.reponse}</p>
        </div>
      )}
    </article>
  );
}