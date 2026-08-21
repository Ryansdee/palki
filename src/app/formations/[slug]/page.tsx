import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFormation, getFormations } from '@/lib/data';

export function generateStaticParams() {
  return getFormations().map((f) => ({ slug: f.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const f = getFormation(params.slug);
  if (!f) return { title: 'Formation — Palki' };
  return { title: `${f.nom} — Palki`, description: f.resume };
}

export default function FormationDetail({
  params,
}: {
  params: { slug: string };
}) {
  const f = getFormation(params.slug);
  if (!f) notFound();

  return (
    <article className="mx-auto max-w-content px-6 py-20">
      <Link href="/formations" className="link-underline">
        <span aria-hidden>←</span> Toutes les formations
      </Link>

      <div className="mt-10 grid gap-14 lg:grid-cols-[1.1fr,1fr]">
        {/* ── Présentation ─────────────────────────────────── */}
        <div>
          <p className="eyebrow">Formation certifiée</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink sm:text-6xl">
            {f.nom}
          </h1>

          <div className="mt-8 space-y-5">
            {f.intro.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink/70">
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-sand pt-8">
            <div>
              <dt className="eyebrow">Durée</dt>
              <dd className="mt-2 font-display text-2xl text-ink">{f.duree}</dd>
            </div>
            <div>
              <dt className="eyebrow">Certificat</dt>
              <dd className="mt-2 font-display text-2xl text-ink">
                {f.certificat ? 'Remis en fin de journée' : '—'}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Dates</dt>
              <dd className="mt-2 leading-relaxed text-ink/70">
                Fixées ensemble selon vos disponibilités
              </dd>
            </div>
            {f.kit && (
              <div>
                <dt className="eyebrow">Matériel</dt>
                <dd className="mt-2 leading-relaxed text-ink/70">{f.kit}</dd>
              </div>
            )}
          </dl>

          {f.remarque && (
            <p className="mt-8 border-l-2 border-mauve bg-cloud px-5 py-4 text-sm leading-relaxed text-ink/70">
              {f.remarque}
            </p>
          )}

          <Link href="/contact" className="btn-solid mt-10">
            Demander une date
          </Link>
        </div>

        {/* ── Programme de la journée ──────────────────────── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="frame p-8">
            <p className="eyebrow">Programme de la journée</p>
            <ol className="mt-6 space-y-6">
              {f.programme.map((etape, i) => (
                <li key={i} className="border-b border-sand pb-6 last:border-0 last:pb-0">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-plum">
                    {etape.horaire}
                  </p>
                  <p className="mt-1 font-display text-xl text-ink">
                    {etape.titre}
                  </p>
                  {etape.points && (
                    <ul className="mt-3 space-y-1.5">
                      {etape.points.map((pt, j) => (
                        <li
                          key={j}
                          className="flex gap-2 text-sm leading-relaxed text-ink/65"
                        >
                          <span aria-hidden className="text-mauve">
                            —
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </article>
  );
}
