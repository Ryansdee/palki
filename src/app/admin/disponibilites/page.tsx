'use client';

import { useEffect, useState } from 'react';
import {
  getHoraires,
  saveHoraire,
  getHorairesSemaine,
  saveSemaine,
  deleteSemaine,
  lundiDeLaSemaine,
  datesSemaine,
  JOURS,
} from '@/lib/data';
import { useTenant } from '@/lib/tenant-context';
import type { HoraireJour } from '@/lib/types';

const input =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const jjmm = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const emptyJours = (): HoraireJour[] =>
  JOURS.map((jour) => ({ jour, ferme: true, surRdv: false, creneaux: [] }));

type Etat = 'ouvert' | 'rdv' | 'ferme';

const etatDe = (h: HoraireJour): Etat =>
  h.ferme ? 'ferme' : h.surRdv ? 'rdv' : 'ouvert';

// Éditeur d'un jour (3 états : ouvert avec plages / sur rendez-vous / fermé).
// Réutilisé pour la semaine calendaire et pour la semaine type.
function DayEditor({
  h,
  date,
  onChange,
}: {
  h: HoraireJour;
  date?: string;
  onChange: (h: HoraireJour) => void;
}) {
  const etat = etatDe(h);

  function setEtat(e: Etat) {
    if (e === 'ferme') {
      onChange({ ...h, ferme: true, surRdv: false });
    } else if (e === 'rdv') {
      onChange({ ...h, ferme: false, surRdv: true });
    } else {
      onChange({
        ...h,
        ferme: false,
        surRdv: false,
        creneaux: h.creneaux.length
          ? h.creneaux
          : [{ debut: '09:00', fin: '14:00' }],
      });
    }
  }

  const OPTIONS: { key: Etat; label: string }[] = [
    { key: 'ouvert', label: 'Ouvert' },
    { key: 'rdv', label: 'Sur RDV' },
    { key: 'ferme', label: 'Fermé' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold capitalize text-slate-900">
            {h.jour}
          </span>
          {date && <span className="text-sm text-slate-400">{jjmm(date)}</span>}
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {OPTIONS.map((o) => {
            const active = etat === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setEtat(o.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {etat === 'rdv' && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Uniquement sur rendez-vous
        </p>
      )}

      {etat === 'ouvert' && (
        <div className="mt-4 space-y-2">
          {h.creneaux.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                className={input}
                value={c.debut}
                onChange={(e) =>
                  onChange({
                    ...h,
                    creneaux: h.creneaux.map((cc, j) =>
                      j === i ? { ...cc, debut: e.target.value } : cc
                    ),
                  })
                }
              />
              <span className="text-slate-400">→</span>
              <input
                type="time"
                className={input}
                value={c.fin}
                onChange={(e) =>
                  onChange({
                    ...h,
                    creneaux: h.creneaux.map((cc, j) =>
                      j === i ? { ...cc, fin: e.target.value } : cc
                    ),
                  })
                }
              />
              <button
                onClick={() =>
                  onChange({
                    ...h,
                    creneaux: h.creneaux.filter((_, j) => j !== i),
                  })
                }
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Retirer ce créneau"
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
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onChange({
                ...h,
                creneaux: [...h.creneaux, { debut: '09:00', fin: '14:00' }],
              })
            }
            className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            + Ajouter une plage
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminDisponibilites() {
  const tenant = useTenant();
  const orgId = tenant.orgId;

  const [lundi, setLundi] = useState(lundiDeLaSemaine());
  const [jours, setJours] = useState<HoraireJour[]>(emptyJours());
  const [personnalisee, setPersonnalisee] = useState(false);
  const [type, setType] = useState<HoraireJour[]>(emptyJours());
  const [showType, setShowType] = useState(false);
  const [msg, setMsg] = useState('');

  const dates = datesSemaine(lundi);
  const annee = lundi.slice(0, 4);

  useEffect(() => {
    if (!orgId) return;
    getHoraires(orgId).then(setType);
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    getHorairesSemaine(orgId, lundi).then((r) => {
      setJours(r.jours);
      setPersonnalisee(r.personnalisee);
    });
  }, [orgId, lundi]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 1800);
  };

  const shift = (delta: number) => {
    const d = new Date(lundi + 'T00:00:00');
    d.setDate(d.getDate() + delta * 7);
    setLundi(isoLocal(d));
  };

  const patchJour = (i: number, h: HoraireJour) =>
    setJours((prev) => prev.map((x, j) => (j === i ? h : x)));
  const patchType = (i: number, h: HoraireJour) =>
    setType((prev) => prev.map((x, j) => (j === i ? h : x)));

  async function saveWeek() {
    await saveSemaine(orgId, lundi, jours);
    setPersonnalisee(true);
    flash('Semaine enregistrée ✓');
  }
  async function resetWeek() {
    await deleteSemaine(orgId, lundi);
    const t = await getHoraires(orgId);
    setJours(t);
    setPersonnalisee(false);
    flash('Semaine réinitialisée ✓');
  }
  async function saveType() {
    for (const h of type) await saveHoraire(orgId, h);
    flash('Semaine type enregistrée ✓');
  }

  const estSemaineActuelle = lundi === lundiDeLaSemaine();

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Disponibilités</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
          Définissez vos horaires semaine par semaine. Chaque jour peut être
          ouvert, sur rendez-vous ou fermé. Une semaine sans horaires propres
          suit automatiquement la « semaine type ».
        </p>
      </div>

      {/* ── Semaine calendaire ─────────────────────────────── */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => shift(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              aria-label="Semaine précédente"
            >
              ←
            </button>
            <div>
              <p className="text-base font-semibold text-slate-900">
                Semaine du {jjmm(dates[0])} au {jjmm(dates[6])} {annee}
              </p>
              <span
                className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  personnalisee
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {personnalisee ? 'Horaires personnalisés' : 'Suit la semaine type'}
              </span>
            </div>
            <button
              onClick={() => shift(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              aria-label="Semaine suivante"
            >
              →
            </button>
          </div>
          {!estSemaineActuelle && (
            <button
              onClick={() => setLundi(lundiDeLaSemaine())}
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
            >
              Revenir à cette semaine
            </button>
          )}
        </div>

        <div className="space-y-3 bg-slate-50/60 p-5">
          {jours.map((h, i) => (
            <DayEditor
              key={h.jour}
              h={h}
              date={dates[i]}
              onChange={(nh) => patchJour(i, nh)}
            />
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={saveWeek}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Enregistrer cette semaine
            </button>
            {personnalisee && (
              <button
                onClick={resetWeek}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Réinitialiser (revenir à la semaine type)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Semaine type ───────────────────────────────────── */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <button
          onClick={() => setShowType((v) => !v)}
          className="flex w-full items-center justify-between bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50"
        >
          <span className="flex items-center gap-3">
            <span className="text-base font-semibold text-slate-900">Semaine type</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              Horaires par défaut
            </span>
          </span>
          <span className="text-slate-400">{showType ? '−' : '+'}</span>
        </button>

        {showType && (
          <div className="space-y-3 border-t border-slate-200 bg-slate-50/60 p-5">
            <p className="text-sm leading-relaxed text-slate-500">
              Ces horaires s’appliquent à toutes les semaines pour lesquelles
              vous n’avez pas défini d’horaires spécifiques.
            </p>
            {type.map((h, i) => (
              <DayEditor key={h.jour} h={h} onChange={(nh) => patchType(i, nh)} />
            ))}
            <button
              onClick={saveType}
              className="mt-1 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Enregistrer la semaine type
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {msg}
        </div>
      )}
    </div>
  );
}