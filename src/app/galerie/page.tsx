'use client';

import { useEffect, useState } from 'react';
import { getPhotos, type PhotoGalerie } from '@/lib/galerie';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

export default function GaleriePage() {
  const [photos, setPhotos] = useState<PhotoGalerie[] | null>(null);
  const [ouverte, setOuverte] = useState<number | null>(null);

  useEffect(() => {
    getPhotos(ORG_ID).then(setPhotos);
  }, []);

  // Navigation clavier dans la visionneuse.
  useEffect(() => {
    if (ouverte === null || !photos) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuverte(null);
      if (e.key === 'ArrowRight') setOuverte((i) => (i! + 1) % photos.length);
      if (e.key === 'ArrowLeft')
        setOuverte((i) => (i! - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [ouverte, photos]);

  const active = ouverte !== null && photos ? photos[ouverte] : null;

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">En images</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Galerie
        </h1>
        <p className="mt-5 leading-relaxed text-ink/65">
          Retrouvez ici toutes les prestations de l’institut Palki en images. Que ce soit pour un soin du visage, une épilation au fil ou un henné naturel, découvrez nos services et laissez-vous inspirer par notre savoir-faire et notre passion pour la beauté.
        </p>
      </header>

      {photos !== null && photos.length === 0 && (
        <p className="mx-auto mt-16 max-w-md border border-dashed border-sand px-6 py-12 text-center text-ink/50">
          Les photos arrivent bientôt.
        </p>
      )}

      <div className="mt-16 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
        {(photos ?? []).map((p, i) => (
          <figure key={p.id} className="break-inside-avoid">
            <button
              onClick={() => setOuverte(i)}
              className="block w-full overflow-hidden"
              aria-label={p.legende || 'Agrandir la photo'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.legende ?? ''}
                className="w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
            {p.legende && (
              <figcaption className="mt-2 text-sm text-ink/55">
                {p.legende}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {/* Visionneuse */}
      {active && photos && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 px-4"
          onClick={() => setOuverte(null)}
        >
          <button
            onClick={() => setOuverte(null)}
            className="absolute right-6 top-6 text-xs uppercase tracking-[0.2em] text-cloud/80 hover:text-cloud"
          >
            Fermer
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOuverte((ouverte! - 1 + photos.length) % photos.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-6 text-3xl text-cloud/70 hover:text-cloud sm:left-6"
                aria-label="Photo précédente"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOuverte((ouverte! + 1) % photos.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-6 text-3xl text-cloud/70 hover:text-cloud sm:right-6"
                aria-label="Photo suivante"
              >
                ›
              </button>
            </>
          )}
          <figure className="max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.legende ?? ''}
              className="max-h-[82vh] max-w-full object-contain"
            />
            <figcaption className="mt-3 flex justify-between gap-4 text-sm text-cloud/70">
              <span>{active.legende}</span>
              <span>
                {ouverte! + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}