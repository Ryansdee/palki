import Link from 'next/link';
import type { Metadata } from 'next';
import { getFormations } from '@/lib/data';
import Carousel from '@/components/Carousel';

export const metadata: Metadata = {
  title: 'Formations — Palki',
  description:
    'Formations professionnelles à l’épilation au fil et au henné naturel, sur une journée, certifiées.',
};

export default function FormationsPage() {
  const formations = getFormations();

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Se former chez Palki</p>
        <h1 className="mt-4 font-display text-5xl leading-tight text-ink sm:text-6xl">
          Nos formations
        </h1>
        <p className="mt-6 leading-relaxed text-ink/70">
          Des formations d’une journée, certifiées et adaptées à tous les
          niveaux, transmises avec plus de dix ans d’expérience. Les dates sont
          fixées ensemble selon vos disponibilités.
        </p>
      </header>

      <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {formations.map((f) => (
          <article key={f.slug}>
            <div className="frame p-3">
              <Carousel images={f.images ?? []} alt={f.nom} aspect="aspect-[4/3]" />
            </div>
            <Link href={`/formations/${f.slug}`} className="group block">
              <h2 className="mt-6 font-display text-3xl text-ink transition-colors group-hover:text-plum">
                {f.nom}
              </h2>
              <p className="mt-3 leading-relaxed text-ink/65">{f.resume}</p>
              <span className="link-underline mt-5">
                Voir le programme <span aria-hidden>→</span>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}