'use client';

import { useEffect, useRef, useState } from 'react';

type Photo = {
  id: string;
  filename: string;
  url: string;
  title: string;
  uploadedAt: string;
};

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
      Array.from(files).forEach((f) => fd.append('files', f));
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
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Photos galeries</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60">
        Ajoutez vos photos. Elles sont enregistrées dans{' '}
        <code>public/images/galeries</code> et listées dans un fichier JSON.
      </p>

      <div className="frame mt-8 bg-cloud px-7 py-8">
        <label className="block text-sm text-ink/70">
          Titre (optionnel)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Salon, soins, ambiance…"
            className="mt-2 w-full border border-sand bg-white px-4 py-2 text-sm text-ink outline-none focus:border-plum"
          />
        </label>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleUpload(e.target.files)}
          className="mt-4 block w-full text-sm text-ink/70 file:mr-4 file:border file:border-mauve/40 file:bg-porcelain file:px-4 file:py-2 file:text-sm file:text-ink hover:file:border-plum disabled:opacity-50"
        />

        {uploading && <p className="mt-3 text-sm text-plum">Envoi en cours…</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-12">
        {loading ? (
          <p className="text-sm text-ink/50">Chargement…</p>
        ) : photos.length === 0 ? (
          <p className="text-sm text-ink/50">Aucune photo pour le moment.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <div key={p.id} className="frame group overflow-hidden bg-cloud">
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.title || 'Photo galerie'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="truncate text-sm text-ink/70">
                    {p.title || p.filename}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="ml-3 shrink-0 text-sm text-ink/40 transition-colors hover:text-red-600"
                  >
                    Supprimer
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