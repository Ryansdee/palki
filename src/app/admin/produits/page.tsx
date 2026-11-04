'use client';

import { useEffect, useState } from 'react';
import { formatEuro } from '@/lib/data';
import {
  getTousProduits,
  addProduit,
  updateProduit,
  deleteProduit,
  slugify,
  type Produit,
  type ProduitInput,
} from '@/lib/produits';

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? 'cGfNmIOEyottsLXor6P5';

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

type Form = {
  nom: string;
  slug: string;
  resume: string;
  description: string;
  prix: string;
  prixBarre: string;
  images: string; // une URL par ligne
  disponible: boolean;
  actif: boolean;
  ordre: string;
};

const vide: Form = {
  nom: '',
  slug: '',
  resume: '',
  description: '',
  prix: '',
  prixBarre: '',
  images: '',
  disponible: true,
  actif: true,
  ordre: '',
};

const versForm = (p: Produit): Form => ({
  nom: p.nom,
  slug: p.slug,
  resume: p.resume,
  description: p.description,
  prix: String(p.prix),
  prixBarre: p.prixBarre ? String(p.prixBarre) : '',
  images: p.images.join('\n'),
  disponible: p.disponible,
  actif: p.actif,
  ordre: String(p.ordre),
});

const nombre = (s: string) => Number(s.replace(',', '.'));

export default function AdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [form, setForm] = useState<Form>(vide);
  const [editId, setEditId] = useState<string | null>(null);
  const [slugTouche, setSlugTouche] = useState(false);
  const [erreur, setErreur] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => getTousProduits(ORG_ID).then(setProduits);

  useEffect(() => {
    load();
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function changerNom(nom: string) {
    setForm((f) => ({ ...f, nom, slug: slugTouche ? f.slug : slugify(nom) }));
  }

  function annuler() {
    setForm(vide);
    setEditId(null);
    setSlugTouche(false);
    setErreur('');
  }

  function modifier(p: Produit) {
    setForm(versForm(p));
    setEditId(p.id);
    setSlugTouche(true);
    setErreur('');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  async function enregistrer() {
    setErreur('');
    const slug = slugify(form.slug || form.nom);
    const prix = nombre(form.prix);
    const prixBarre = form.prixBarre ? nombre(form.prixBarre) : null;

    if (!form.nom.trim()) return setErreur('Le nom est requis.');
    if (!slug) return setErreur("L'adresse (slug) est invalide.");
    if (!form.prix || Number.isNaN(prix) || prix < 0)
      return setErreur('Le prix est invalide.');
    if (prixBarre !== null && (Number.isNaN(prixBarre) || prixBarre <= prix))
      return setErreur("L'ancien prix doit être supérieur au prix actuel.");
    if (produits.some((p) => p.slug === slug && p.id !== editId))
      return setErreur('Un autre produit utilise déjà cette adresse.');

    const data: ProduitInput = {
      nom: form.nom.trim(),
      slug,
      resume: form.resume.trim(),
      description: form.description.trim(),
      prix,
      prixBarre,
      images: form.images
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean),
      disponible: form.disponible,
      actif: form.actif,
      ordre: form.ordre ? Number(form.ordre) : produits.length + 1,
    };

    setBusy(true);
    try {
      if (editId) await updateProduit(editId, data);
      else await addProduit(ORG_ID, data);
      annuler();
      await load();
    } catch (e) {
      console.error('produit save', e);
      setErreur("Impossible d'enregistrer le produit.");
    } finally {
      setBusy(false);
    }
  }

  async function basculer(p: Produit, champ: 'disponible' | 'actif') {
    await updateProduit(p.id, { [champ]: !p[champ] });
    await load();
  }

  async function supprimer(p: Produit) {
    if (!confirm(`Supprimer « ${p.nom} » ?`)) return;
    await deleteProduit(p.id);
    if (editId === p.id) annuler();
    await load();
  }

  const apercu = form.images
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Boutique</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les objets en vente, affichés sur la page Boutique. Les clientes
          commandent par WhatsApp, retrait à l’institut.
        </p>
      </div>

      {/* Liste */}
      <div className="mt-8 space-y-3">
        {produits.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-slate-100" />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-slate-900">
                    {p.nom}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {formatEuro(p.prix)}
                  </span>
                  {p.prixBarre ? (
                    <span className="text-sm text-slate-400 line-through">
                      {formatEuro(p.prixBarre)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  /boutique/{p.slug}
                  {p.resume ? ` · ${p.resume}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => basculer(p, 'disponible')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  p.disponible
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    p.disponible ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {p.disponible ? 'En stock' : 'Épuisé'}
              </button>
              <button
                onClick={() => basculer(p, 'actif')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  p.actif
                    ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {p.actif ? 'Visible' : 'Masqué'}
              </button>
              <button
                onClick={() => modifier(p)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                Modifier
              </button>
              <button
                onClick={() => supprimer(p)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                Suppr.
              </button>
            </div>
          </div>
        ))}
        {produits.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            Aucun produit pour l’instant.
          </p>
        )}
      </div>

      {/* Formulaire */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <p className="text-sm font-semibold text-slate-900">
          {editId ? `Modifier « ${form.nom || '…'} »` : 'Nouveau produit'}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-500">
            Nom
            <input
              className={`${input} mt-1`}
              placeholder="ex. Kit henné naturel"
              value={form.nom}
              onChange={(e) => changerNom(e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-500">
            Adresse de la page
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-slate-400">/boutique/</span>
              <input
                className={input}
                placeholder="kit-henne-naturel"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouche(true);
                  set('slug', e.target.value);
                }}
              />
            </div>
          </label>

          <label className="text-sm text-slate-500 sm:col-span-2">
            Phrase courte (cartes)
            <input
              className={`${input} mt-1`}
              placeholder="ex. Henné du Rajasthan tamisé 5 fois, prêt à l'emploi."
              value={form.resume}
              onChange={(e) => set('resume', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-500 sm:col-span-2">
            Description (laisser une ligne vide entre deux paragraphes)
            <textarea
              className={`${input} mt-1 min-h-[140px]`}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-500">
            Prix (€)
            <input
              className={`${input} mt-1`}
              inputMode="decimal"
              placeholder="25"
              value={form.prix}
              onChange={(e) => set('prix', e.target.value)}
            />
          </label>
          <label className="text-sm text-slate-500">
            Ancien prix barré (€, optionnel)
            <input
              className={`${input} mt-1`}
              inputMode="decimal"
              placeholder="30"
              value={form.prixBarre}
              onChange={(e) => set('prixBarre', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-500 sm:col-span-2">
            Photos : une adresse d’image par ligne (la première sert de couverture)
            <textarea
              className={`${input} mt-1 min-h-[90px] font-mono text-xs`}
              placeholder="https://i.ibb.co/…/photo1.jpg"
              value={form.images}
              onChange={(e) => set('images', e.target.value)}
            />
          </label>

          {apercu.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {apercu.map((u, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={u + i}
                  src={u}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                />
              ))}
            </div>
          )}

          <label className="text-sm text-slate-500">
            Ordre d’affichage
            <input
              className={`${input} mt-1`}
              type="number"
              placeholder={String(produits.length + 1)}
              value={form.ordre}
              onChange={(e) => set('ordre', e.target.value)}
            />
          </label>

          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.disponible}
                onChange={(e) => set('disponible', e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              En stock
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => set('actif', e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              Visible sur le site
            </label>
          </div>
        </div>

        {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}

        <div className="mt-5 flex gap-3">
          <button
            onClick={enregistrer}
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy ? 'Enregistrement…' : editId ? 'Enregistrer' : 'Ajouter le produit'}
          </button>
          {editId && (
            <button
              onClick={annuler}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white"
            >
              Annuler
            </button>
          )}
        </div>
      </section>
    </div>
  );
}