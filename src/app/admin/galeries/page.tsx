'use client';

import { useEffect, useRef, useState } from 'react';

type Photo = {
  id: string;
  filename: string;
  url: string;
  title: string;
  uploadedAt: string;
};

// Compresse une image côté client avant upload : redimensionne à maxWidth px
// de large max et ré-encode en JPEG. Évite d'envoyer des fichiers lourds à
// l'API (limite de taille des fonctions serverless).
async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, 'image/jpeg', quality)
  );
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', {
    type: 'image/jpeg',
  });
}

export default function AdminGaleries() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/galeries');
      setPhotos(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      const compressed = await Promise.all(
        Array.from(files).map((f) => compressImage(f))
      );
      compressed.forEach((f) => fd.append('files', f));
      fd.append('title', title);
      const res = await fetch('/api/galeries', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec de l’envoi.');
      }
      setTitle('');
      if (inputRef.current) inputRef.current.value = '';
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette photo ?')) return;
    await fetch('/api/galeries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Photos galeries</h1>
        <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-500">
          Ajoutez vos photos. Elles sont compressées automatiquement avant
          l’envoi, puis enregistrées sur l’hébergement.
        </p>
      </div>

      {/* Upload */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700">
          Titre (optionnel)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Salon, soins, ambiance…"
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
          <span className="text-xs text-slate-400">PNG, JPG — plusieurs fichiers possibles</span>
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

        {uploading && (
          <p className="mt-3 flex items-center gap-2 text-sm text-indigo-600">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Compression et envoi en cours…
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.title || 'Photo galerie'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="truncate text-sm text-slate-600">
                    {p.title || p.filename}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}