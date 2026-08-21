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
import type { HoraireJour } from '@/lib/types';

const input =
  'border border-sand bg-porcelain px-3 py-2 text-sm outline-none focus:border-plum';

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

const jjmm = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

const emptyJours = (): HoraireJour[] =>
  JOURS.map((jour) => ({ jour, ferme: true, creneaux: [] }));

// Éditeur d'un jour (ouvert/fermé + plages horaires). Réutilisé pour la
// semaine calendaire et pour la semaine type.
function DayEditor({
  h,
  date,
  onChange,
}: {
  h: HoraireJour;
  date?: string;
  onChange: (h: HoraireJour) => void;
}) {
  return (
    <div className="border border-sand bg-cloud px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-display text-2xl capitalize text-ink">
          {h.jour}
          {date && <span className="ml-2 text-base text-ink/40">{jjmm(date)}</span>}
        </span>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={!h.ferme}
            onChange={(e) =>
              onChange({
                ...h,
                ferme: !e.target.checked,
                creneaux:
                  !e.target.checked || h.creneaux.length
                    ? h.creneaux
                    : [{ debut: '10:00', fin: '18:00' }],
              })
            }
          />
          Ouvert
        </label>
      </div>

      {!h.ferme && (
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
              <span className="text-ink/40">→</span>
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
                className="px-2 text-ink/40 hover:text-rose"
                aria-label="Retirer ce créneau"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onChange({
                ...h,
                creneaux: [...h.creneaux, { debut: '10:00', fin: '18:00' }],
              })
            }
            className="text-xs uppercase tracking-[0.15em] text-mauve hover:text-plum"
          >
            + Ajouter une plage
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminDisponibilites() {
  const [lundi, setLundi] = useState(lundiDeLaSemaine());
  const [jours, setJours] = useState<HoraireJour[]>(emptyJours());
  const [personnalisee, setPersonnalisee] = useState(false);
  const [type, setType] = useState<HoraireJour[]>(emptyJours());
  const [showType, setShowType] = useState(false);
  const [msg, setMsg] = useState('');

  const dates = datesSemaine(lundi);
  const annee = lundi.slice(0, 4);

  useEffect(() => {
    getHoraires().then(setType);
  }, []);

  useEffect(() => {
    getHorairesSemaine(lundi).then((r) => {
      setJours(r.jours);
      setPersonnalisee(r.personnalisee);
    });
  }, [lundi]);

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
    await saveSemaine(lundi, jours);
    setPersonnalisee(true);
    flash('Semaine enregistrée ✓');
  }
  async function resetWeek() {
    await deleteSemaine(lundi);
    const t = await getHoraires();
    setJours(t);
    setPersonnalisee(false);
    flash('Semaine réinitialisée ✓');
  }
  async function saveType() {
    for (const h of type) await saveHoraire(h);
    flash('Semaine type enregistrée ✓');
  }

  const estSemaineActuelle = lundi === lundiDeLaSemaine();

  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Disponibilités</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60">
        Définissez vos horaires semaine par semaine. Une semaine sans horaires
        propres suit automatiquement la « semaine type ». Les créneaux de
        rendez-vous et l’affichage sur le site en découlent.
      </p>

      {/* ── Semaine calendaire ─────────────────────────────── */}
      <div className="mt-8 border border-sand">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand bg-cloud px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => shift(-1)}
              className="flex h-9 w-9 items-center justify-center border border-sand text-ink hover:border-plum hover:text-plum"
              aria-label="Semaine précédente"
            >
              ←
            </button>
            <div>
              <p className="font-display text-xl text-ink">
                Semaine du {jjmm(dates[0])} au {jjmm(dates[6])} {annee}
              </p>
              <p className="text-xs uppercase tracking-[0.15em] text-ink/50">
                {personnalisee
                  ? 'Horaires personnalisés'
                  : 'Suit la semaine type'}
              </p>
            </div>
            <button
              onClick={() => shift(1)}
              className="flex h-9 w-9 items-center justify-center border border-sand text-ink hover:border-plum hover:text-plum"
              aria-label="Semaine suivante"
            >
              →
            </button>
          </div>
          {!estSemaineActuelle && (
            <button
              onClick={() => setLundi(lundiDeLaSemaine())}
              className="text-xs uppercase tracking-[0.15em] text-mauve hover:text-plum"
            >
              Revenir à cette semaine
            </button>
          )}
        </div>

        <div className="space-y-3 p-5">
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
              className="bg-plum px-6 py-3 text-xs uppercase tracking-[0.15em] text-cloud hover:bg-ink"
            >
              Enregistrer cette semaine
            </button>
            {personnalisee && (
              <button
                onClick={resetWeek}
                className="border border-sand px-6 py-3 text-xs uppercase tracking-[0.15em] text-ink/70 hover:border-rose hover:text-rose"
              >
                Réinitialiser (revenir à la semaine type)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Semaine type ───────────────────────────────────── */}
      <div className="mt-10 border border-sand">
        <button
          onClick={() => setShowType((v) => !v)}
          className="flex w-full items-center justify-between bg-cloud px-5 py-4 text-left"
        >
          <span>
            <span className="font-display text-xl text-ink">Semaine type</span>
            <span className="ml-3 text-xs uppercase tracking-[0.15em] text-ink/50">
              Horaires par défaut
            </span>
          </span>
          <span className="text-ink/50">{showType ? '−' : '+'}</span>
        </button>

        {showType && (
          <div className="space-y-3 p-5">
            <p className="text-sm leading-relaxed text-ink/60">
              Ces horaires s’appliquent à toutes les semaines pour lesquelles
              vous n’avez pas défini d’horaires spécifiques.
            </p>
            {type.map((h, i) => (
              <DayEditor key={h.jour} h={h} onChange={(nh) => patchType(i, nh)} />
            ))}
            <button
              onClick={saveType}
              className="mt-2 bg-plum px-6 py-3 text-xs uppercase tracking-[0.15em] text-cloud hover:bg-ink"
            >
              Enregistrer la semaine type
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink px-6 py-3 text-sm text-cloud shadow-lg">
          {msg}
        </div>
      )}
    </div>
  );
}