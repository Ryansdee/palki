'use client';

import { useEffect, useState } from 'react';
import {
  getCreneauxSemaine,
  saveJourCreneaux,
  deleteJourCreneaux,
  getOccupationForDate,
  genererHeures,
  heuresPrises,
  formatHeure,
  lundiDeLaSemaine,
  datesSemaine,
  JOURS,
  PAS_CRENEAU,
} from '@/lib/data';
import { useTenant } from '@/lib/tenant-context';
import type { JourCreneaux, Occupation } from '@/lib/types';

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

const decalerSemaine = (lundi: string, delta: number) => {
  const d = new Date(lundi + 'T00:00:00');
  d.setDate(d.getDate() + delta * 7);
  return isoLocal(d);
};

type Semaine = Record<string, JourCreneaux | null>;

// Éditeur d'une date : génération rapide, puis clic sur une heure pour la
// barrer / la libérer, × pour la retirer de la liste.
function JourEditor({
  jour,
  date,
  value,
  occupations,
  onChange,
}: {
  jour: string;
  date: string;
  value: JourCreneaux | null;
  occupations: Occupation[];
  onChange: (v: JourCreneaux | null) => void;
}) {
  const [debut, setDebut] = useState('11:00');
  const [fin, setFin] = useState('16:00');
  const [pas, setPas] = useState(PAS_CRENEAU);
  const [ajout, setAjout] = useState('');
  const passe = date < isoLocal(new Date());

  const generer = () =>
    onChange({
      date,
      heures: genererHeures(debut, fin, pas),
      bloques: value?.bloques ?? [],
    });

  const reservees = value
    ? heuresPrises({ ...value, bloques: [] }, occupations)
    : new Set<string>();

  const toggle = (h: string) => {
    if (!value || reservees.has(h)) return;
    const bloque = value.bloques.includes(h);
    onChange({
      ...value,
      bloques: bloque ? value.bloques.filter((b) => b !== h) : [...value.bloques, h],
    });
  };

  const retirer = (h: string) =>
    value &&
    onChange({
      ...value,
      heures: value.heures.filter((x) => x !== h),
      bloques: value.bloques.filter((x) => x !== h),
    });

  const ajouter = () => {
    if (!value || !ajout || value.heures.includes(ajout)) return;
    onChange({ ...value, heures: [...value.heures, ajout].sort() });
    setAjout('');
  };

  const libres = value
    ? value.heures.filter((h) => !reservees.has(h) && !value.bloques.includes(h)).length
    : 0;

  return (
    <div
      className={`rounded-xl border bg-white px-5 py-4 ${
        passe ? 'border-slate-100 opacity-60' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold capitalize text-slate-900">{jour}</span>
          <span className="text-sm text-slate-400">{jjmm(date)}</span>
          {value && (
            <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {libres} libre{libres > 1 ? 's' : ''} / {value.heures.length}
            </span>
          )}
        </div>
        {value ? (
          <button
            onClick={() => onChange(null)}
            className="text-sm font-medium text-slate-400 transition-colors hover:text-red-600"
          >
            Retirer ce jour
          </button>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            Non publié
          </span>
        )}
      </div>

      {/* Générateur */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input type="time" className={input} value={debut} onChange={(e) => setDebut(e.target.value)} />
        <span className="text-slate-400">→</span>
        <input type="time" className={input} value={fin} onChange={(e) => setFin(e.target.value)} />
        <select className={input} value={pas} onChange={(e) => setPas(Number(e.target.value))}>
          {[15, 30, 45, 60].map((p) => (
            <option key={p} value={p}>
              toutes les {p} min
            </option>
          ))}
        </select>
        <button
          onClick={generer}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          {value ? 'Regénérer' : 'Publier ce jour'}
        </button>
      </div>

      {/* Heures */}
      {value && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {value.heures.map((h) => {
              const reservee = reservees.has(h);
              const bloquee = value.bloques.includes(h);
              return (
                <span
                  key={h}
                  className={`group inline-flex items-center overflow-hidden rounded-full border text-sm ${
                    reservee
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-400'
                      : bloquee
                        ? 'border-red-200 bg-red-50 text-red-400'
                        : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <button
                    onClick={() => toggle(h)}
                    disabled={reservee}
                    title={
                      reservee
                        ? 'Réservé en ligne (annulez la réservation pour libérer)'
                        : bloquee
                          ? 'Cliquer pour libérer'
                          : 'Cliquer pour barrer'
                    }
                    className={`py-1.5 pl-3 pr-1.5 ${
                      reservee || bloquee ? 'line-through decoration-2' : ''
                    } ${reservee ? 'cursor-not-allowed' : ''}`}
                  >
                    {formatHeure(h)}
                  </button>
                  {!reservee && (
                    <button
                      onClick={() => retirer(h)}
                      aria-label={`Retirer ${formatHeure(h)}`}
                      className="py-1.5 pl-0.5 pr-2.5 text-slate-300 transition-colors hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input type="time" className={input} value={ajout} onChange={(e) => setAjout(e.target.value)} />
            <button
              onClick={ajouter}
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
            >
              + Ajouter une heure
            </button>
          </div>

          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span>Clic = barrer / libérer</span>
            <span className="text-red-400 line-through">barré à la main</span>
            <span className="text-indigo-400 line-through">réservé en ligne</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function AdminCreneaux() {
  const { orgId } = useTenant();

  const [lundi, setLundi] = useState(lundiDeLaSemaine());
  const [semaine, setSemaine] = useState<Semaine>({});
  const [original, setOriginal] = useState<Semaine>({});
  const [occ, setOcc] = useState<Record<string, Occupation[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const dates = datesSemaine(lundi);
  const dirty = JSON.stringify(semaine) !== JSON.stringify(original);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      getCreneauxSemaine(orgId, lundi),
      Promise.all(dates.map((d) => getOccupationForDate(orgId, d))),
    ]).then(([s, o]) => {
      setSemaine(s);
      setOriginal(s);
      setOcc(Object.fromEntries(dates.map((d, i) => [d, o[i]])));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, lundi]);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 2000);
  };

  const changerSemaine = (l: string) => {
    if (dirty && !window.confirm('Modifications non enregistrées. Changer de semaine ?')) return;
    setLundi(l);
  };

  async function enregistrer() {
    setSaving(true);
    try {
      for (const d of dates) {
        const v = semaine[d] ?? null;
        const o = original[d] ?? null;
        if (JSON.stringify(v) === JSON.stringify(o)) continue;
        if (v && v.heures.length) await saveJourCreneaux(orgId, v);
        else if (o) await deleteJourCreneaux(orgId, d);
      }
      const s = await getCreneauxSemaine(orgId, lundi);
      setSemaine(s);
      setOriginal(s);
      flash('Créneaux enregistrés ✓');
    } catch {
      flash("Erreur : l'enregistrement a échoué");
    } finally {
      setSaving(false);
    }
  }

  // Reprend les heures de la semaine précédente (sans les heures barrées).
  async function copierPrecedente() {
    const prev = await getCreneauxSemaine(orgId, decalerSemaine(lundi, -1));
    const prevDates = datesSemaine(decalerSemaine(lundi, -1));
    const copie: Semaine = {};
    dates.forEach((d, i) => {
      const p = prev[prevDates[i]];
      copie[d] = p ? { date: d, heures: p.heures, bloques: [] } : null;
    });
    if (!Object.values(copie).some(Boolean)) {
      flash('Rien à copier : semaine précédente vide');
      return;
    }
    setSemaine(copie);
    flash('Semaine précédente copiée — pensez à enregistrer');
  }

  const estSemaineActuelle = lundi === lundiDeLaSemaine();

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Créneaux</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
          Publiez, date par date, les heures proposées. Elles s&apos;affichent sur
          la page d&apos;accueil (« Mes disponibilités ») et sont les seules
          réservables en ligne ce jour-là. Les heures réservées sont barrées
          automatiquement ; vous pouvez en barrer d&apos;autres à la main (RDV pris
          par téléphone, pause…).
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changerSemaine(decalerSemaine(lundi, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              aria-label="Semaine précédente"
            >
              ←
            </button>
            <p className="text-base font-semibold text-slate-900">
              Semaine du {jjmm(dates[0])} au {jjmm(dates[6])} {lundi.slice(0, 4)}
            </p>
            <button
              onClick={() => changerSemaine(decalerSemaine(lundi, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              aria-label="Semaine suivante"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-4">
            {!estSemaineActuelle && (
              <button
                onClick={() => changerSemaine(lundiDeLaSemaine())}
                className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Cette semaine
              </button>
            )}
            <button
              onClick={copierPrecedente}
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Copier la semaine précédente
            </button>
          </div>
        </div>

        <div className="space-y-3 bg-slate-50/60 p-5">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
              ))
            : dates.map((d, i) => (
                <JourEditor
                  key={d}
                  jour={JOURS[i]}
                  date={d}
                  value={semaine[d] ?? null}
                  occupations={occ[d] ?? []}
                  onChange={(v) => setSemaine((s) => ({ ...s, [d]: v }))}
                />
              ))}

          <div className="sticky bottom-4 flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={enregistrer}
              disabled={!dirty || saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer la semaine'}
            </button>
            {dirty && !saving && (
              <span className="text-sm text-amber-600">Modifications non enregistrées</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Une date sans créneaux publiés suit les horaires d&apos;ouverture définis
        dans « Disponibilités ».
      </p>

      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {msg}
        </div>
      )}
    </div>
  );
}
