// Boutique vitrine : objets en vente (kits, henné, accessoires…).
// Pas de paiement en ligne : la cliente est contactée par WhatsApp.
// Collection Firestore "produits", scopée par orgId comme le reste.

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Produit {
  id: string;
  slug: string; // identifiant d'URL, ex. "kit-henne"
  nom: string;
  resume: string; // phrase courte (cartes)
  description: string; // texte long (page produit)
  prix: number; // en euros
  prixBarre?: number | null; // ancien prix (optionnel) → affiché barré
  images: string[]; // URLs, la 1re sert de couverture
  disponible: boolean; // false = « Épuisé » (reste visible)
  actif: boolean; // false = masqué du site
  ordre: number;
}

export type ProduitInput = Omit<Produit, 'id'>;

// "Kit henné naturel" → "kit-henne-naturel"
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const trier = (p: Produit[]) => p.sort((a, b) => a.ordre - b.ordre);

// Tous les produits de l'org (admin : actifs et masqués).
export async function getTousProduits(orgId: string): Promise<Produit[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'produits'), where('orgId', '==', orgId))
    );
    return trier(
      snap.docs.map((d) => {
        const { orgId: _o, ...data } = d.data() as ProduitInput & { orgId: string };
        return { id: d.id, ...data, images: data.images ?? [] };
      })
    );
  } catch {
    return [];
  }
}

// Produits visibles sur le site.
export async function getProduits(orgId: string): Promise<Produit[]> {
  return (await getTousProduits(orgId)).filter((p) => p.actif);
}

export async function getProduit(
  orgId: string,
  slug: string
): Promise<Produit | null> {
  return (await getProduits(orgId)).find((p) => p.slug === slug) ?? null;
}

export const addProduit = (orgId: string, p: ProduitInput) =>
  addDoc(collection(db, 'produits'), { ...p, orgId });

export const updateProduit = (id: string, p: Partial<ProduitInput>) =>
  updateDoc(doc(db, 'produits', id), p);

export const deleteProduit = (id: string) => deleteDoc(doc(db, 'produits', id));

// Numéro au format wa.me : chiffres uniquement, préfixe belge si numéro local.
export function toWhatsAppNumber(tel: string): string {
  let n = tel.replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith('0')) n = '32' + n.slice(1);
  return n;
}

export function lienWhatsAppProduit(tel: string, p: Produit): string {
  const texte = `Bonjour, je suis intéressée par « ${p.nom} » vu sur votre site. Est-il disponible ?`;
  return `https://wa.me/${toWhatsAppNumber(tel)}?text=${encodeURIComponent(texte)}`;
}