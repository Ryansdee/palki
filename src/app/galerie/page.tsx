'use client';

import { useEffect, useState } from 'react';
import { getGalerie, type Photo } from '@/lib/data';

export default function GaleriePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    getGalerie().then(setPhotos);
  }, []);

  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">En images</p>
        <h1 className="mt-4 font-display text-5xl text-ink sm:text-6xl">
          Galerie
        </h1>
        <p className="mt-5 leading-relaxed text-ink/65">
          Retrouvez ici tout les prestations de l’institut Palki en images. Que ce soit pour un soin du visage, une épilation au fil ou un henné naturel, découvrez nos services et laissez-vous inspirer par notre savoir-faire et notre passion pour la beauté.
        </p>
      </header>

      <div className="mt-16 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
        {photos.map((p) => (
          <figure key={p.id} className="break-inside-avoid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={p.legende ?? ''}
              className="w-full object-cover"
              loading="lazy"
            />
            {p.legende && (
              <figcaption className="mt-2 text-sm text-ink/55">
                {p.legende}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
