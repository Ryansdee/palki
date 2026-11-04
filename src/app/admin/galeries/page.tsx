'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getPhotos,
  ajouterPhoto,
  modifierPhoto,
  supprimerPhoto,
  type PhotoGalerie,
} from '@/lib/galerie';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

const MAX_MO = 15;

export default function AdminGaleries() {
  const [photos, setPhotos] = useState<PhotoGalerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [legende, setLegende] = useState('');
  const [progress, setProgress] = useState<{ fait: number; total: number } | null>(
    null
  );
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setPhotos(await getPhotos(ORG_ID));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(list: FileList | null) {
    if (!list || !list.length) return;
    setError('');
    const files = Array.from(list).filter((f) => f.type.startsWith('image/'));
    const tropLourds = files.filter((f) => f.size > MAX_MO * 1024 * 1024);
    const valides = files.filter((f) => f.size <= MAX_MO * 1024 * 1024);
    if (!valides.length) {
      setError(
        tropLourds.length
          ? `Images trop lourdes (max ${MAX_MO} Mo).`
          : 'Aucune image valide.'
      );
      return;
    }

    // Les nouvelles photos passent en tête de la galerie.
    const premier = photos.length ? Math.min(...photos.map((p) => p.ordre)) : 0;
    setProgress({ fait: 0, total: valides.length });
    let echecs = 0;
    for (let i = 0; i < valides.length; i++) {
      try {
        await ajouterPhoto(ORG_ID, valides[i], legende, premier - valides.length + i);
      } catch (e) {
        console.error('upload galerie', e);
        echecs++;
      }
      setProgress({ fait: i + 1, total: valides.length });
    }
    setProgress(null);
    setLegende('');
    if (inputRef.current) inputRef.current.value = '';
    if (echecs || tropLourds.length) {
      setError(
        [
          echecs ? `${echecs} photo(s) n’ont pas pu être envoyées.` : '',
          tropLourds.length ? `${tropLourds.length} ignorée(s), plus de ${MAX_MO} Mo.` : '',
        ]
          .filter(Boolean)
          .join(' ')
      );
    }
    await load();
  }

  async function handleDelete(p: PhotoGalerie) {
    if (!confirm('Supprimer cette photo ?')) return;
    await supprimerPhoto(p);
    await load();
  }

  async function saveLegende(p: PhotoGalerie, valeur: string) {
    if (valeur.trim() === (p.legende ?? '')) return;
    await modifierPhoto(p.id, { legende: valeur.trim() });
    await load();
  }

  // Échange la position de deux photos voisines.
  async function deplacer(index: number, sens: -1 | 1) {
    const cible = index + sens;
    if (cible < 0 || cible >= photos.length) return;
    const ordre = [...photos];
    [ordre[index], ordre[cible]] = [ordre[cible], ordre[index]];
    setPhotos(ordre);
    await Promise.all(
      ordre.map((p, i) => (p.ordre !== i ? modifierPhoto(p.id, { ordre: i }) : null))
    );
    await load();
  }

  const uploading = progress !== null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Galerie</h1>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">
          Ajoutez, légendez, réordonnez ou retirez les photos de la page
          Galerie. Elles sont compressées automatiquement avant l’envoi.
        </p>
      </div>

      {/* Upload */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700">
          Légende (optionnelle, appliquée aux photos envoyées)
          <input
            type="text"
            value={legende}
            onChange={(e) => setLegende(e.target.value)}
            placeholder="Ex. Henné mariée, sourcils au fil…"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 ${
            uploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            Cliquez pour choisir des images
          </span>
          <span className="text-xs text-slate-400">
            PNG, JPG — plusieurs fichiers possibles, depuis le téléphone aussi
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
        </label>

        {progress && (
          <p className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Envoi {progress.fait}/{progress.total}…
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Grille */}
      <div className="mt-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-100" />
                <div className="px-4 py-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-400">
            Aucune photo pour le moment.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {photos.length} photo{photos.length > 1 ? 's' : ''} · même ordre
              que sur le site
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.legende || 'Photo galerie'}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {i + 1}
                    </span>
                  </div>
                  <div className="space-y-3 px-4 py-3">
                    <input
                      defaultValue={p.legende ?? ''}
                      placeholder="Ajouter une légende"
                      onBlur={(e) => saveLegende(p, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.target as HTMLInputElement).blur()
                      }
                      className="w-full rounded-lg border border-transparent px-2 py-1 text-sm text-slate-700 outline-none transition-colors hover:border-slate-200 focus:border-indigo-400"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          onClick={() => deplacer(i, -1)}
                          disabled={i === 0}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
                          aria-label="Monter"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => deplacer(i, 1)}
                          disabled={i === photos.length - 1}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
                          aria-label="Descendre"
                        >
                          →
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}