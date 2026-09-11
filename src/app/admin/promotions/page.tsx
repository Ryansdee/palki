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
  'w-full border border-sand bg-porcelain px-3 py-2 text-sm outline-none focus:border-plum';

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

  const load = () => getPromotions(false).then(setPromos);

  useEffect(() => {
    getServices().then((s) => s.length && setServices(s));
    load();
  }, []);

  const cibleNom = (c: string) =>
    c === 'tout' ? 'Tous les soins' : services.find((s) => s.slug === c)?.nom ?? c;

  async function ajouter() {
    if (!form.titre) return;
    await addPromotion({
      ...form,
      valeur: Number(form.valeur),
      debut: form.debut || undefined,
      fin: form.fin || undefined,
      tarifCible: form.tarifCible || undefined,
    });
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
    <div>
      <p className="eyebrow">Administration</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Promotions</h1>

      <div className="mt-8 space-y-3">
        {promos.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 border border-sand bg-cloud px-5 py-4"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl text-ink">{p.titre}</span>
                <span className="font-display text-lg text-plum">
                  {p.type === 'pourcentage' ? `-${p.valeur}%` : `-${p.valeur}€`}
                </span>
              </div>
              <p className="text-sm text-ink/60">
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
                className={`px-3 py-2 text-xs uppercase tracking-[0.15em] ${
                  p.actif
                    ? 'bg-plum text-cloud'
                    : 'border border-sand text-ink/50'
                }`}
              >
                {p.actif ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="border border-sand px-3 py-2 text-xs uppercase tracking-[0.15em] text-ink/50 hover:border-rose hover:text-rose"
              >
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {promos.length === 0 && (
          <p className="text-sm text-ink/50">Aucune promotion pour l’instant.</p>
        )}
      </div>

      <section className="mt-14 border-t border-sand pt-8">
        <p className="eyebrow">Nouvelle promotion</p>
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
          <label className="text-sm text-ink/60">
            Début (optionnel)
            <input
              className={input}
              type="date"
              value={form.debut}
              onChange={(e) => setForm({ ...form, debut: e.target.value })}
            />
          </label>
          <label className="text-sm text-ink/60">
            Fin (optionnel)
            <input
              className={input}
              type="date"
              value={form.fin}
              onChange={(e) => setForm({ ...form, fin: e.target.value })}
            />
          </label>
        </div>
        <button onClick={ajouter} className="btn-solid mt-4">
          Créer la promotion
        </button>
      </section>
    </div>
  );
}
