import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Service,
  Tarif,
  Promotion,
  HoraireJour,
  Reservation,
  Occupation,
  Settings,
} from './types';

export const JOURS = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;

// ── Données par défaut ────────────────────────────────────────────────
// Servent de contenu de départ (script seed) ET de repli si Firestore est
// vide, pour que le site ne soit jamais blanc pendant le paramétrage.

export const DEFAULT_SETTINGS: Settings = {
  adresse: 'Av. de la Couronne 227, 1050 Ixelles (Bâtiment L, 1er étage)',
  telephone: '0485 46 40 24',
  email: '',
  instagram: '',
};

export const DEFAULT_SERVICES: Service[] = [
  {
    slug: 'epilation',
    nom: 'Épilation',
    resume: 'Épilation au fil ou à la cire, précise et durable.',
    description:
      "[slug — description Épilation à compléter par la cliente]",
    image:
      'https://palki.be/wp-content/uploads/2025/03/unnamed-1-768x660.jpg',
    ordre: 1,
    actif: true,
  },
  {
    slug: 'henne',
    nom: 'Henné',
    resume: "Henné naturel à base d'huiles essentielles.",
    description: '[slug — description Henné à compléter par la cliente]',
    image:
      'https://palki.be/wp-content/uploads/2025/03/unnamed-768x660.jpg',
    ordre: 2,
    actif: true,
  },
  {
    slug: 'soins-visage',
    nom: 'Soins visage',
    resume: 'Soins du visage sur mesure, peaux sensibles bienvenues.',
    description: '[slug — description Soins visage à compléter]',
    image:
      'https://palki.be/wp-content/uploads/2024/01/left-img1-445x660.jpg',
    ordre: 3,
    actif: true,
  },
  {
    slug: 'massages',
    nom: 'Massages',
    resume: 'Massages relaxants pour relâcher les tensions.',
    description: '',
    image:
      'https://palki.be/wp-content/uploads/2022/08/spa-service-05-768x533.jpg',
    ordre: 4,
    actif: true,
  },
];

export const DEFAULT_TARIFS: Omit<Tarif, 'id'>[] = [
  { serviceSlug: 'epilation', nom: 'Sourcils au fil', prix: 12, dureeMin: 20, ordre: 1 },
  { serviceSlug: 'epilation', nom: 'Lèvre supérieure', prix: 8, dureeMin: 15, ordre: 2 },
  { serviceSlug: 'epilation', nom: 'Visage complet', prix: 25, dureeMin: 30, ordre: 3 },
  { serviceSlug: 'henne', nom: 'Henné sourcils', prix: 20, dureeMin: 30, ordre: 1 },
  { serviceSlug: 'henne', nom: 'Henné mains', prix: 35, dureeMin: 45, ordre: 2 },
  { serviceSlug: 'soins-visage', nom: 'Soin découverte', prix: 45, dureeMin: 45, ordre: 1 },
  { serviceSlug: 'massages', nom: 'Massage 30 min', prix: 35, dureeMin: 30, ordre: 1 },
  { serviceSlug: 'massages', nom: 'Massage 60 min', prix: 60, dureeMin: 60, ordre: 2 },
];

export const DEFAULT_HORAIRES: HoraireJour[] = JOURS.map((jour) => ({
  jour,
  ferme: jour === 'dimanche',
  creneaux:
    jour === 'dimanche' ? [] : [{ debut: '10:00', fin: '18:00' }],
}));

// ── Lecture (public) ──────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  try {
    const snap = await getDocs(collection(db, 'services'));
    if (snap.empty) return DEFAULT_SERVICES;
    return snap.docs
      .map((d) => d.data() as Service)
      .filter((s) => s.actif)
      .sort((a, b) => a.ordre - b.ordre);
  } catch {
    return DEFAULT_SERVICES;
  }
}

export async function getService(slug: string): Promise<Service | null> {
  try {
    const ref = doc(db, 'services', slug);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as Service;
  } catch {
    /* repli ci-dessous */
  }
  return DEFAULT_SERVICES.find((s) => s.slug === slug) ?? null;
}

export async function getTarifs(): Promise<Tarif[]> {
  try {
    const snap = await getDocs(query(collection(db, 'tarifs'), orderBy('ordre')));
    if (snap.empty)
      return DEFAULT_TARIFS.map((t, i) => ({ ...t, id: `default-${i}` }));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Tarif, 'id'>) }));
  } catch {
    return DEFAULT_TARIFS.map((t, i) => ({ ...t, id: `default-${i}` }));
  }
}

export async function getTarifsByService(slug: string): Promise<Tarif[]> {
  const all = await getTarifs();
  return all.filter((t) => t.serviceSlug === slug).sort((a, b) => a.ordre - b.ordre);
}

export async function getPromotions(actifOnly = true): Promise<Promotion[]> {
  try {
    const snap = await getDocs(collection(db, 'promotions'));
    let promos = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Promotion, 'id'>) }));
    if (actifOnly) promos = promos.filter(isPromoActive);
    return promos;
  } catch {
    return [];
  }
}

export async function getHoraires(): Promise<HoraireJour[]> {
  try {
    const snap = await getDocs(collection(db, 'horaires'));
    if (snap.empty) return DEFAULT_HORAIRES;
    const byId = new Map(snap.docs.map((d) => [d.id, d.data() as HoraireJour]));
    return JOURS.map((j) => byId.get(j) ?? { jour: j, ferme: true, creneaux: [] });
  } catch {
    return DEFAULT_HORAIRES;
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) return snap.data() as Settings;
  } catch {
    /* repli */
  }
  return DEFAULT_SETTINGS;
}

// ── Promotions : logique de prix ──────────────────────────────────────

export function isPromoActive(p: Promotion): boolean {
  if (!p.actif) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (p.debut && today < p.debut) return false;
  if (p.fin && today > p.fin) return false;
  return true;
}

export function promoPourService(
  serviceSlug: string,
  promos: Promotion[]
): Promotion | null {
  const actives = promos.filter(isPromoActive);
  return (
    actives.find((p) => p.cible === serviceSlug) ??
    actives.find((p) => p.cible === 'tout') ??
    null
  );
}

export function prixApresPromo(prix: number, promo: Promotion | null): number {
  if (!promo) return prix;
  const remise =
    promo.type === 'pourcentage' ? (prix * promo.valeur) / 100 : promo.valeur;
  return Math.max(0, Math.round((prix - remise) * 100) / 100);
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n);
}

// ── Écriture (admin) ──────────────────────────────────────────────────

export const saveService = (s: Service) => setDoc(doc(db, 'services', s.slug), s);
export const deleteService = (slug: string) => deleteDoc(doc(db, 'services', slug));

export const addTarif = (t: Omit<Tarif, 'id'>) => addDoc(collection(db, 'tarifs'), t);
export const updateTarif = (id: string, t: Partial<Tarif>) =>
  updateDoc(doc(db, 'tarifs', id), t);
export const deleteTarif = (id: string) => deleteDoc(doc(db, 'tarifs', id));

export const addPromotion = (p: Omit<Promotion, 'id'>) =>
  addDoc(collection(db, 'promotions'), p);
export const updatePromotion = (id: string, p: Partial<Promotion>) =>
  updateDoc(doc(db, 'promotions', id), p);
export const deletePromotion = (id: string) => deleteDoc(doc(db, 'promotions', id));

export const saveHoraire = (h: HoraireJour) => setDoc(doc(db, 'horaires', h.jour), h);
export const saveSettings = (s: Settings) => setDoc(doc(db, 'settings', 'general'), s);

// ── Réservations & occupation ─────────────────────────────────────────
// La collection "occupation" ne contient aucune donnée personnelle : elle
// est lisible publiquement pour calculer les créneaux libres. Les données
// client vivent dans "reservations", réservée à l'admin.

export async function createReservation(
  r: Omit<Reservation, 'id' | 'occupationId'>
): Promise<void> {
  const occ = await addDoc(collection(db, 'occupation'), {
    date: r.date,
    heure: r.heure,
    dureeMin: r.dureeMin,
  });
  await addDoc(collection(db, 'reservations'), { ...r, occupationId: occ.id });
}

export async function getOccupationForDate(date: string): Promise<Occupation[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'occupation'), where('date', '==', date))
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Occupation) }));
  } catch {
    return [];
  }
}

export async function getReservations(): Promise<Reservation[]> {
  try {
    const snap = await getDocs(collection(db, 'reservations'));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Reservation) }))
      .sort((a, b) => (a.date + a.heure < b.date + b.heure ? 1 : -1));
  } catch {
    return [];
  }
}

const freeOccupation = async (occupationId?: string) => {
  if (occupationId) await deleteDoc(doc(db, 'occupation', occupationId)).catch(() => {});
};

export async function updateReservation(
  id: string,
  patch: Partial<Reservation>,
  occupationId?: string
): Promise<void> {
  // Annuler une réservation libère son créneau.
  if (patch.statut === 'annule') await freeOccupation(occupationId);
  await updateDoc(doc(db, 'reservations', id), patch);
}

export async function deleteReservation(
  id: string,
  occupationId?: string
): Promise<void> {
  await freeOccupation(occupationId);
  await deleteDoc(doc(db, 'reservations', id));
}

// ── Génération des créneaux disponibles ───────────────────────────────

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Retourne les heures de début possibles pour une prestation d'une durée donnée,
// selon les horaires du jour et en retirant les créneaux déjà réservés.
export function creneauxDisponibles(
  horaire: HoraireJour,
  dureeMin: number,
  occupations: { heure: string; dureeMin: number }[],
  pas = 15
): string[] {
  if (horaire.ferme) return [];
  const occupes = occupations.map((r) => ({
    debut: toMin(r.heure),
    fin: toMin(r.heure) + r.dureeMin,
  }));
  const dispo: string[] = [];
  for (const c of horaire.creneaux) {
    const debut = toMin(c.debut);
    const fin = toMin(c.fin);
    for (let t = debut; t + dureeMin <= fin; t += pas) {
      const chevauche = occupes.some((o) => t < o.fin && t + dureeMin > o.debut);
      if (!chevauche) dispo.push(toHHMM(t));
    }
  }
  return dispo;
}

// ── Galerie ───────────────────────────────────────────────────────────

export interface Photo {
  id: string;
  url: string;
  legende?: string;
  ordre: number;
}

const DEFAULT_GALERIE: Photo[] = [
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=900&q=80',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80',
  'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=900&q=80',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=900&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80',
  'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=900&q=80',
].map((url, i) => ({ id: `default-${i}`, url, ordre: i }));

export async function getGalerie(): Promise<Photo[]> {
  try {
    const snap = await getDocs(collection(db, 'galerie'));
    if (snap.empty) return DEFAULT_GALERIE;
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Photo, 'id'>) }))
      .sort((a, b) => a.ordre - b.ordre);
  } catch {
    return DEFAULT_GALERIE;
  }
}

export const addPhoto = (p: Omit<Photo, 'id'>) => addDoc(collection(db, 'galerie'), p);
export const deletePhoto = (id: string) => deleteDoc(doc(db, 'galerie', id));

// ── Initialisation (bouton admin) ─────────────────────────────────────
// Écrit le contenu de départ dans Firestore. N'écrase pas les tarifs déjà
// présents (ajoute seulement s'il n'y en a pas), mais (ré)écrit services,
// horaires et settings de base.
export async function seedDefaults(): Promise<void> {
  for (const s of DEFAULT_SERVICES) await saveService(s);
  for (const h of DEFAULT_HORAIRES) await saveHoraire(h);
  await saveSettings(DEFAULT_SETTINGS);

  const existing = await getDocs(collection(db, 'tarifs'));
  if (existing.empty) {
    for (const t of DEFAULT_TARIFS) await addTarif(t);
  }
}
