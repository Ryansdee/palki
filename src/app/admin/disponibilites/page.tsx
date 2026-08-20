'use client';

import { useEffect, useState } from 'react';
import { getHoraires, saveHoraire, JOURS } from '@/lib/data';
import type { HoraireJour } from '@/lib/types';

const input =
  'border border-sand bg-porcelain px-3 py-2 text-sm outline-none focus:border-plum';

export default function AdminDisponibilites() {
  const [horaires, setHoraires] = useState<HoraireJour[]>([]);
  const [savedJour, setSavedJour] = useState('');

  useEffect(() => {
    getHoraires().then(setHoraires);
  }, []);

  function patch(jour: string, fn: (h: HoraireJour) => HoraireJour) {
    setHoraires((prev) => prev.map((h) => (h.jour === jour ? fn(h) : h)));
  }

  async function save(h: HoraireJour) {
    await saveHoraire(h);
    setSavedJour(h.jour);
    setTimeout(() => setSavedJour(''), 1500);
  }

  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Disponibilités</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
        Définissez vos plages d’ouverture pour chaque jour. Les créneaux de
        rendez-vous sont calculés automatiquement à partir de ces horaires.
      </p>

      <div className="mt-8 space-y-3">
        {JOURS.map((jour) => {
          const h =
            horaires.find((x) => x.jour === jour) ??
            ({ jour, ferme: true, creneaux: [] } as HoraireJour);
          return (
            <div key={jour} className="border border-sand bg-cloud px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="font-display text-2xl capitalize text-ink">
                  {jour}
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={!h.ferme}
                      onChange={(e) =>
                        patch(jour, (x) => ({
                          ...x,
                          ferme: !e.target.checked,
                          creneaux:
                            !e.target.checked || x.creneaux.length
                              ? x.creneaux
                              : [{ debut: '10:00', fin: '18:00' }],
                        }))
                      }
                    />
                    Ouvert
                  </label>
                  <button
                    onClick={() => save(h)}
                    className="border border-plum px-4 py-2 text-xs uppercase tracking-[0.15em] text-plum hover:bg-plum hover:text-cloud"
                  >
                    {savedJour === jour ? 'Enregistré ✓' : 'Enregistrer'}
                  </button>
                </div>
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
                          patch(jour, (x) => ({
                            ...x,
                            creneaux: x.creneaux.map((cc, j) =>
                              j === i ? { ...cc, debut: e.target.value } : cc
                            ),
                          }))
                        }
                      />
                      <span className="text-ink/40">→</span>
                      <input
                        type="time"
                        className={input}
                        value={c.fin}
                        onChange={(e) =>
                          patch(jour, (x) => ({
                            ...x,
                            creneaux: x.creneaux.map((cc, j) =>
                              j === i ? { ...cc, fin: e.target.value } : cc
                            ),
                          }))
                        }
                      />
                      <button
                        onClick={() =>
                          patch(jour, (x) => ({
                            ...x,
                            creneaux: x.creneaux.filter((_, j) => j !== i),
                          }))
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
                      patch(jour, (x) => ({
                        ...x,
                        creneaux: [...x.creneaux, { debut: '10:00', fin: '18:00' }],
                      }))
                    }
                    className="text-xs uppercase tracking-[0.15em] text-mauve hover:text-plum"
                  >
                    + Ajouter une plage
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
