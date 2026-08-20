'use client';

import { useEffect, useState } from 'react';
import {
  getServices,
  getTarifs,
  addTarif,
  updateTarif,
  deleteTarif,
  DEFAULT_SERVICES,
} from '@/lib/data';
import type { Service, Tarif } from '@/lib/types';

const input =
  'w-full border border-sand bg-porcelain px-3 py-2 text-sm outline-none focus:border-plum';

export default function AdminTarifs() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [nouveau, setNouveau] = useState({
    serviceSlug: '',
    nom: '',
    prix: 0,
    dureeMin: 30,
  });

  const load = () => getTarifs().then(setTarifs);

  useEffect(() => {
    getServices().then((s) => s.length && setServices(s));
    load();
  }, []);

  const notSeeded = tarifs.some((t) => t.id.startsWith('default-'));

  function edit(id: string, patch: Partial<Tarif>) {
    setTarifs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function save(t: Tarif) {
    const { id, ...data } = t;
    await updateTarif(id, data);
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette prestation ?')) return;
    await deleteTarif(id);
    await load();
  }

  async function ajouter() {
    if (!nouveau.serviceSlug || !nouveau.nom) return;
    const ordre = tarifs.filter((t) => t.serviceSlug === nouveau.serviceSlug).length + 1;
    await addTarif({ ...nouveau, ordre });
    setNouveau({ serviceSlug: nouveau.serviceSlug, nom: '', prix: 0, dureeMin: 30 });
    await load();
  }

  return (
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Tarifs</h1>

      {notSeeded && (
        <p className="mt-6 border border-rose/50 bg-cloud px-4 py-3 text-sm text-ink/70">
          Contenu de démonstration affiché. Cliquez sur «&nbsp;Initialiser le
          contenu&nbsp;» sur le tableau de bord pour pouvoir enregistrer vos
          modifications.
        </p>
      )}

      {services.map((service) => {
        const items = tarifs
          .filter((t) => t.serviceSlug === service.slug)
          .sort((a, b) => a.ordre - b.ordre);
        return (
          <section key={service.slug} className="mt-10">
            <h2 className="font-display text-2xl text-ink">{service.nom}</h2>
            <div className="mt-4 space-y-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="grid items-center gap-2 border border-sand bg-cloud px-3 py-3 sm:grid-cols-[1fr_100px_100px_auto]"
                >
                  <input
                    className={input}
                    value={t.nom}
                    onChange={(e) => edit(t.id, { nom: e.target.value })}
                  />
                  <label className="flex items-center gap-1 text-sm text-ink/60">
                    <input
                      className={input}
                      type="number"
                      value={t.prix}
                      onChange={(e) =>
                        edit(t.id, { prix: Number(e.target.value) })
                      }
                    />
                    €
                  </label>
                  <label className="flex items-center gap-1 text-sm text-ink/60">
                    <input
                      className={input}
                      type="number"
                      value={t.dureeMin}
                      onChange={(e) =>
                        edit(t.id, { dureeMin: Number(e.target.value) })
                      }
                    />
                    min
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => save(t)}
                      className="border border-plum px-3 py-2 text-xs uppercase tracking-[0.15em] text-plum hover:bg-plum hover:text-cloud"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="border border-sand px-3 py-2 text-xs uppercase tracking-[0.15em] text-ink/50 hover:border-rose hover:text-rose"
                    >
                      Suppr.
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-ink/50">Aucune prestation.</p>
              )}
            </div>
          </section>
        );
      })}

      {/* Ajout */}
      <section className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow">Ajouter une prestation</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_100px_100px_auto]">
          <select
            className={input}
            value={nouveau.serviceSlug}
            onChange={(e) =>
              setNouveau({ ...nouveau, serviceSlug: e.target.value })
            }
          >
            <option value="">Soin…</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nom}
              </option>
            ))}
          </select>
          <input
            className={input}
            placeholder="Nom de la prestation"
            value={nouveau.nom}
            onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
          />
          <input
            className={input}
            type="number"
            placeholder="Prix"
            value={nouveau.prix}
            onChange={(e) =>
              setNouveau({ ...nouveau, prix: Number(e.target.value) })
            }
          />
          <input
            className={input}
            type="number"
            placeholder="Durée"
            value={nouveau.dureeMin}
            onChange={(e) =>
              setNouveau({ ...nouveau, dureeMin: Number(e.target.value) })
            }
          />
          <button onClick={ajouter} className="btn-solid !px-5 !py-2">
            Ajouter
          </button>
        </div>
      </section>
    </div>
  );
}
