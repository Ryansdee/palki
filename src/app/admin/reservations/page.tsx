'use client';

import { useEffect, useState } from 'react';
import {
  getReservations,
  updateReservation,
  deleteReservation,
} from '@/lib/data';
import { useTenant } from '@/lib/tenant-context';
import type { Reservation, StatutReservation } from '@/lib/types';

const LABELS: Record<StatutReservation, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
};

const BADGE: Record<StatutReservation, string> = {
  en_attente: 'bg-amber-50 text-amber-700 ring-amber-200',
  confirme: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  annule: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const DOT: Record<StatutReservation, string> = {
  en_attente: 'bg-amber-400',
  confirme: 'bg-emerald-500',
  annule: 'bg-slate-300',
};

export default function AdminReservations() {
  const tenant = useTenant();
  const orgId = tenant.orgId;

  const [resas, setResas] = useState<Reservation[]>([]);
  const [filtre, setFiltre] = useState<StatutReservation | 'tous'>('tous');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      setResas(await getReservations(orgId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  async function setStatut(r: Reservation, statut: StatutReservation) {
    await updateReservation(r.id!, { statut }, r.occupationId);
    await load();
  }
  async function remove(r: Reservation) {
    if (!confirm('Supprimer définitivement cette réservation ?')) return;
    await deleteReservation(r.id!, r.occupationId);
    await load();
  }

  const visibles = resas.filter((r) => filtre === 'tous' || r.statut === filtre);
  const count = (f: StatutReservation | 'tous') =>
    f === 'tous' ? resas.length : resas.filter((r) => r.statut === f).length;

  const FILTRES: (StatutReservation | 'tous')[] = [
    'tous',
    'en_attente',
    'confirme',
    'annule',
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Réservations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Consultez, confirmez ou annulez les demandes reçues.
        </p>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const active = filtre === f;
          return (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'tous' ? 'Toutes' : LABELS[f]}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count(f)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      <div className="mt-8 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))
        ) : visibles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-400">
            Aucune réservation.
          </p>
        ) : (
          visibles.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition-shadow hover:shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-slate-900">
                    {r.prestation}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE[r.statut]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${DOT[r.statut]}`} />
                    {LABELS[r.statut]}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4.5" width="18" height="16" rx="2" />
                      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
                    </svg>
                    {r.date} à {r.heure}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {r.dureeMin} min
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {r.client.nom} · {r.client.tel} · {r.client.email}
                </p>
                {r.note && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-500">
                    « {r.note} »
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {r.statut !== 'confirme' && (
                  <button
                    onClick={() => setStatut(r, 'confirme')}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                  >
                    Confirmer
                  </button>
                )}
                {r.statut !== 'annule' && (
                  <button
                    onClick={() => setStatut(r, 'annule')}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={() => remove(r)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}