'use client';

import { useEffect, useState } from 'react';
import {
  getServices,
  getPromotions,
  addPromotion,
  updatePromotion,
  deletePromotion,
  DEFAULT_SERVICES,
} from '@/lib/data';
import type { Service, Promotion, PromotionType } from '@/lib/types';

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

const vide = {
  titre: '',
  description: '',
  type: 'pourcentage' as PromotionType,
  valeur: 10,
  cible: 'tout',
  tarifCible: '',
  actif: true,
  debut: '',
  fin: '',
};

export default function AdminPromotions() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [form, setForm] = useState(vide);

  const load = () => getPromotions('').then(setPromos);

  useEffect(() => {
    getServices('').then((s) => s.length && setServices(s));
    load();
  }, []);

  const cibleNom = (c: string) =>
    c === 'tout' ? 'Tous les soins' : services.find((s) => s.slug === c)?.nom ?? c;

  async function ajouter() {
    if (!form.titre) return;
    await addPromotion(form.titre, form);
    setForm(vide);
    await load();
  }

  async function toggle(p: Promotion) {
    await updatePromotion(p.id, { actif: !p.actif });
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette promotion ?')) return;
    await deletePromotion(id);
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Promotions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Créez des réductions et activez-les en un clic.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {promos.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-shadow hover:shadow-sm"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-slate-900">{p.titre}</span>
                <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-700">
                  {p.type === 'pourcentage' ? `-${p.valeur}%` : `-${p.valeur}€`}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {cibleNom(p.cible)}
                {p.description ? ` · ${p.description}` : ''}
                {p.debut || p.fin
                  ? ` · ${p.debut || '…'} → ${p.fin || '…'}`
                  : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(p)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  p.actif
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    p.actif ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                {p.actif ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {promos.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            Aucune promotion pour l’instant.
          </p>
        )}
      </div>

      {/* Nouvelle promotion */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <p className="text-sm font-semibold text-slate-900">Nouvelle promotion</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className={input}
            placeholder="Titre (ex. Rentrée)"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
          />
          <input
            className={input}
            placeholder="Description courte"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className={input}
            value={form.cible}
            onChange={(e) => setForm({ ...form, cible: e.target.value })}
          >
            <option value="tout">Tous les soins</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nom}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select
              className={input}
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as PromotionType })
              }
            >
              <option value="pourcentage">Réduction en %</option>
              <option value="montant">Réduction en €</option>
            </select>
            <input
              className={input}
              type="number"
              placeholder="Valeur"
              value={form.valeur}
              onChange={(e) =>
                setForm({ ...form, valeur: Number(e.target.value) })
              }
            />
          </div>
          <label className="text-sm text-slate-500">
            Début (optionnel)
            <input
              className={`${input} mt-1`}
              type="date"
              value={form.debut}
              onChange={(e) => setForm({ ...form, debut: e.target.value })}
            />
          </label>
          <label className="text-sm text-slate-500">
            Fin (optionnel)
            <input
              className={`${input} mt-1`}
              type="date"
              value={form.fin}
              onChange={(e) => setForm({ ...form, fin: e.target.value })}
            />
          </label>
        </div>
        <button
          onClick={ajouter}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Créer la promotion
        </button>
      </section>
    </div>
  );
}