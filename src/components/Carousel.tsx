'use client';

import { useRef, useState } from 'react';

export default function Carousel({
  images,
  alt,
  aspect = 'aspect-[4/3]',
}: {
  images: string[];
  alt: string;
  aspect?: string;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  if (!images.length) return null;

  // Une seule image : affichage simple, sans contrôles.
  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images[0]} alt={alt} className={`w-full object-cover ${aspect}`} />
    );
  }

  const go = (i: number) => setIndex((i + images.length) % images.length);

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${alt} — ${i + 1}`}
            className={`w-full shrink-0 object-contain ${aspect}`}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Image précédente"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          go(index - 1);
        }}
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-cloud/90 text-ink transition-colors hover:bg-cloud"
      >
        <span aria-hidden>←</span>
      </button>
      <button
        type="button"
        aria-label="Image suivante"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          go(index + 1);
        }}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-cloud/90 text-ink transition-colors hover:bg-cloud"
      >
        <span aria-hidden>→</span>
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Aller à l’image ${i + 1}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(i);
            }}
            className={`h-1.5 cover rounded-full transition-all ${
              i === index ? 'w-6 bg-cloud' : 'w-1.5 bg-cloud/60 hover:bg-cloud'
            }`}
          />
        ))}
      </div>
    </div>
  );
}