'use client';

import { useEffect, useState } from 'react';
import { getTousAvis, updateAvis, deleteAvis, statsAvis } from '@/lib/data';
import { useTenant } from '@/lib/tenant-context';
import type { Avis, StatutAvis } from '@/lib/types';

const LABELS: Record<StatutAvis, string> = {
  en_attente: 'À valider',
  publie: 'Publié',
  masque: 'Masqué',
};

const BADGE: Record<StatutAvis, string> = {
  en_attente: 'bg-amber-50 text-amber-700 ring-amber-200',
  publie: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  masque: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const PATH =
  'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z';

function Stars({ note }: { note: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width={16} height={16}>
          <path d={PATH} fill="currentColor" className={n <= note ? 'text-amber-400' : 'text-slate-200'} />
        </svg>
      ))}
    </span>
  );
}

function CarteAdmin({ a, onChange }: { a: Avis; onChange: () => Promise<void> }) {
  const [reponse, setReponse] = useState(a.reponse ?? '');
  const [ouvert, setOuvert] = useState(false);
  const [busy, setBusy] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await onChange();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Stars note={a.note} />
            <span className="text-sm font-semibold text-slate-900">{a.prenom}</span>
            <span className="text-sm text-slate-400">· {a.prestation}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE[a.statut]}`}>
              {LABELS[a.statut]}
            </span>
                        {a.source === 'libre' ? (
              <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                Sans réservation
              </span>
            ) : (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                RDV vérifié
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {new Date(a.createdAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">« {a.commentaire} »</p>
          {a.reponse && !ouvert && (
            <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
              <span className="font-medium">Votre réponse :</span> {a.reponse}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {a.statut !== 'publie' && (
            <button
              disabled={busy}
              onClick={() => act(() => updateAvis(a.id!, { statut: 'publie' }))}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              Publier
            </button>
          )}
          {a.statut !== 'masque' && (
            <button
              disabled={busy}
              onClick={() => act(() => updateAvis(a.id!, { statut: 'masque' }))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Masquer
            </button>
          )}
          <button
            onClick={() => setOuvert((v) => !v)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            {a.reponse ? 'Modifier la réponse' : 'Répondre'}
          </button>
          <button
            disabled={busy}
            onClick={() => {
              if (confirm('Supprimer définitivement cet avis ?')) act(() => deleteAvis(a.id!));
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            Suppr.
          </button>
        </div>
      </div>

      {ouvert && (
        <div className="mt-4 space-y-2">
          <textarea
            value={reponse}
            onChange={(e) => setReponse(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Merci pour votre retour…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={() =>
                act(async () => {
                  await updateAvis(a.id!, { reponse: reponse.trim(), reponseAt: Date.now() });
                  setOuvert(false);
                })
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              Enregistrer la réponse
            </button>
            <button
              onClick={() => setOuvert(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAvis() {
  const { orgId } = useTenant();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [filtre, setFiltre] = useState<StatutAvis | 'tous'>('en_attente');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      setAvis(await getTousAvis(orgId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const publies = avis.filter((a) => a.statut === 'publie');
  const { moyenne, total } = statsAvis(publies);
  const visibles = avis.filter((a) => filtre === 'tous' || a.statut === filtre);
  const count = (f: StatutAvis | 'tous') =>
    f === 'tous' ? avis.length : avis.filter((a) => a.statut === f).length;
  const FILTRES: (StatutAvis | 'tous')[] = ['en_attente', 'publie', 'masque', 'tous'];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Avis clientes</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Pour demander un avis, utilisez le bouton « Demander un avis » sur une
            réservation confirmée. Publiez tous les avis honnêtes, même négatifs :
            ne masquez que les propos injurieux ou les données personnelles.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-right">
          <p className="text-2xl font-semibold text-slate-900">
            {total ? moyenne.toLocaleString('fr-BE', { minimumFractionDigits: 1 }) : '—'}
            <span className="text-base font-normal text-slate-400"> / 5</span>
          </p>
          <p className="text-xs text-slate-500">{total} avis publiés</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const active = filtre === f;
          return (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'tous' ? 'Tous' : LABELS[f]}
              <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count(f)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))
        ) : visibles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-400">
            Aucun avis.
          </p>
        ) : (
          visibles.map((a) => <CarteAdmin key={a.id} a={a} onChange={load} />)
        )}
      </div>
    </div>
  );
}