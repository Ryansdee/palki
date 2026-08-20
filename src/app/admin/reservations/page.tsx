'use client';

import { useEffect, useState } from 'react';
import {
  getReservations,
  updateReservation,
  deleteReservation,
} from '@/lib/data';
import type { Reservation, StatutReservation } from '@/lib/types';

const LABELS: Record<StatutReservation, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
};

export default function AdminReservations() {
  const [resas, setResas] = useState<Reservation[]>([]);
  const [filtre, setFiltre] = useState<StatutReservation | 'tous'>('tous');

  const load = () => getReservations().then(setResas);
  useEffect(() => {
    load();
  }, []);

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

  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Réservations</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['tous', 'en_attente', 'confirme', 'annule'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${
              filtre === f
                ? 'bg-plum text-cloud'
                : 'border border-sand text-ink/60 hover:border-mauve'
            }`}
          >
            {f === 'tous' ? 'Toutes' : LABELS[f]}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {visibles.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-sand bg-cloud px-5 py-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl text-ink">
                  {r.prestation}
                </span>
                <span
                  className={`text-xs uppercase tracking-[0.15em] ${
                    r.statut === 'confirme'
                      ? 'text-plum'
                      : r.statut === 'annule'
                        ? 'text-ink/40'
                        : 'text-rose'
                  }`}
                >
                  {LABELS[r.statut]}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/70">
                {r.date} à {r.heure} · {r.dureeMin} min
              </p>
              <p className="text-sm text-ink/60">
                {r.client.nom} · {r.client.tel} · {r.client.email}
              </p>
              {r.note && (
                <p className="mt-1 text-sm italic text-ink/50">« {r.note} »</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {r.statut !== 'confirme' && (
                <button
                  onClick={() => setStatut(r, 'confirme')}
                  className="border border-plum px-3 py-2 text-xs uppercase tracking-[0.15em] text-plum hover:bg-plum hover:text-cloud"
                >
                  Confirmer
                </button>
              )}
              {r.statut !== 'annule' && (
                <button
                  onClick={() => setStatut(r, 'annule')}
                  className="border border-sand px-3 py-2 text-xs uppercase tracking-[0.15em] text-ink/50 hover:border-rose hover:text-rose"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={() => remove(r)}
                className="px-3 py-2 text-xs uppercase tracking-[0.15em] text-ink/30 hover:text-rose"
              >
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {visibles.length === 0 && (
          <p className="text-sm text-ink/50">Aucune réservation.</p>
        )}
      </div>
    </div>
  );
}
