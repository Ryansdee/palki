'use client';

import { useEffect, useState } from 'react';
import {
  getTarifs,
  addTarif,
  updateTarif,
  deleteTarif,
  DEFAULT_SERVICES,
} from '@/lib/data';
import type { Service, Tarif } from '@/lib/types';

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

export default function AdminTarifs() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [nouveau, setNouveau] = useState({
    serviceSlug: '',
    nom: '',
    prix: 0,
    dureeMin: 30,
  });

  const load = (serviceList = services) =>
    Promise.all(serviceList.map((service) => getTarifs(service.slug))).then(
      (results) => setTarifs(results.flat()),
    );

  useEffect(() => {
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
    await addTarif(nouveau.serviceSlug, {
      nom: nouveau.nom,
      prix: nouveau.prix,
      dureeMin: nouveau.dureeMin,
      ordre,
      serviceSlug: ''
    });
    setNouveau({ serviceSlug: nouveau.serviceSlug, nom: '', prix: 0, dureeMin: 30 });
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Tarifs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les prestations, leurs prix et leur durée.
        </p>
      </div>

      {notSeeded && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <p className="text-sm leading-relaxed text-amber-800">
            Contenu de démonstration affiché. Cliquez sur «&nbsp;Initialiser le
            contenu&nbsp;» sur le tableau de bord pour pouvoir enregistrer vos
            modifications.
          </p>
        </div>
      )}

      {services.map((service) => {
        const items = tarifs
          .filter((t) => t.serviceSlug === service.slug)
          .sort((a, b) => a.ordre - b.ordre);
        return (
          <section key={service.slug} className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900">{service.nom}</h2>
            <div className="mt-3 space-y-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="grid items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm sm:grid-cols-[1fr_110px_110px_auto]"
                >
                  <input
                    className={input}
                    value={t.nom}
                    onChange={(e) => edit(t.id, { nom: e.target.value })}
                  />
                  <div className="relative">
                    <input
                      className={`${input} pr-7`}
                      type="number"
                      value={t.prix}
                      onChange={(e) =>
                        edit(t.id, { prix: Number(e.target.value) })
                      }
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      €
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      className={`${input} pr-9`}
                      type="number"
                      value={t.dureeMin}
                      onChange={(e) =>
                        edit(t.id, { dureeMin: Number(e.target.value) })
                      }
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      min
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => save(t)}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      Suppr.
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                  Aucune prestation.
                </p>
              )}
            </div>
          </section>
        );
      })}

      {/* Ajout */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <p className="text-sm font-semibold text-slate-900">Ajouter une prestation</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_110px_110px_auto]">
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
          <button
            onClick={ajouter}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Ajouter
          </button>
        </div>
      </section>
    </div>
  );
}