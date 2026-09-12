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
  SemaineHoraire,
  Reservation,
  Occupation,
  Settings,
  Formation,
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
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&q=80',
    ordre: 1,
    actif: true,
  },
  {
    slug: 'henne',
    nom: 'Henné',
    resume: "Henné naturel à base d'huiles essentielles.",
    description: '[slug — description Henné à compléter par la cliente]',
    image:
      'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=1200&q=80',
    ordre: 2,
    actif: true,
  },
  {
    slug: 'soins-visage',
    nom: 'Soins visage',
    resume: 'Soins du visage sur mesure, peaux sensibles bienvenues.',
    description: '[slug — description Soins visage à compléter]',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80',
    ordre: 3,
    actif: true,
  },
  {
    slug: 'massages',
    nom: 'Massages',
    resume: 'Massages relaxants pour relâcher les tensions.',
    description: '[slug — description Massages à compléter]',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80',
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

// ── Horaires par semaine calendaire ───────────────────────────────────
// La cliente peut définir des horaires propres à une semaine donnée. À
// défaut, on retombe sur la semaine type (getHoraires ci-dessus).

// Format date locale "YYYY-MM-DD" (sans décalage UTC, contrairement à
// toISOString qui peut basculer d'un jour en Belgique).
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

// Lundi (YYYY-MM-DD) de la semaine contenant `date`.
export function lundiDeLaSemaine(date: Date | string = new Date()): string {
  const d =
    typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // lundi = 0
  return isoDate(d);
}

// Les 7 dates ISO d'une semaine, à partir de son lundi.
export function datesSemaine(lundi: string): string[] {
  const base = new Date(lundi + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return isoDate(d);
  });
}

// Horaires propres à une semaine, ou null si la cliente n'en a pas défini.
export async function getSemaineOverride(
  lundi: string
): Promise<HoraireJour[] | null> {
  try {
    const snap = await getDoc(doc(db, 'semaines', lundi));
    if (snap.exists()) return (snap.data() as SemaineHoraire).jours;
  } catch {
    /* repli */
  }
  return null;
}

export const saveSemaine = (lundi: string, jours: HoraireJour[]) =>
  setDoc(doc(db, 'semaines', lundi), { lundi, jours } as SemaineHoraire);

export const deleteSemaine = (lundi: string) =>
  deleteDoc(doc(db, 'semaines', lundi));

// Horaires effectifs d'une semaine (override si défini, sinon semaine type).
export async function getHorairesSemaine(
  lundi: string
): Promise<{ jours: HoraireJour[]; personnalisee: boolean }> {
  const override = await getSemaineOverride(lundi);
  if (override) return { jours: override, personnalisee: true };
  return { jours: await getHoraires(), personnalisee: false };
}

// Horaires effectifs d'un jour précis — utilisé par la prise de rendez-vous.
export async function getHoraireForDate(date: string): Promise<HoraireJour> {
  const { jours } = await getHorairesSemaine(lundiDeLaSemaine(date));
  const nom = JOURS[(new Date(date + 'T00:00:00').getDay() + 6) % 7];
  return (
    jours.find((h) => h.jour === nom) ?? { jour: nom, ferme: true, creneaux: [] }
  );
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
  const today = isoDate(new Date()); // heure locale (Belgique), pas UTC
  if (p.debut && today < p.debut) return false;
  if (p.fin && today > p.fin) return false;
  return true;
}

// Promo applicable au niveau d'un SERVICE (utilisée pour le bandeau de page).
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

// Promo applicable à un TARIF précis (utilisée pour le prix ligne par ligne) :
// - promo avec tarifCible → uniquement ce tarif
// - promo sans tarifCible → tout le service (cible) ou 'tout'
export function promoPourTarif(
  tarif: Tarif,
  promos: Promotion[]
): Promotion | null {
  const actives = promos.filter(isPromoActive);
  return (
    actives.find((p) => p.tarifCible === tarif.id) ??
    actives.find((p) => !p.tarifCible && p.cible === tarif.serviceSlug) ??
    actives.find((p) => !p.tarifCible && p.cible === 'tout') ??
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

export type Photo = {
  id: string;
  url: string;
  legende?: string;
};

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
    const res = await fetch('/api/galeries', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      url: string;
      title?: string;
    }>;
    return data.map((p) => ({
      id: p.id,
      url: p.url,
      legende: p.title || undefined,
    }));
  } catch {
    return [];
  }
}

export const addPhoto = (p: Omit<Photo, 'id'>) => addDoc(collection(db, 'galerie'), p);
export const deletePhoto = (id: string) => deleteDoc(doc(db, 'galerie', id));

// ── Formations ────────────────────────────────────────────────────────
// Contenu fixe (fourni par la cliente). Rendu directement par les pages,
// sans passer par Firestore. Facile à migrer vers un éditeur admin plus tard.
export const FORMATIONS: Formation[] = [
  {
    slug: 'epilation-au-fil',
    nom: 'Formation Épilation au Fil',
    resume: 'Une technique ancestrale indienne, précise et très demandée. Formation d’une journée, certifiée, tous niveaux.',
    intro: [
      'Apprenez une technique ancestrale indienne, aujourd’hui très demandée dans le monde de l’esthétique pour sa précision et son efficacité. Avec plus de 10 ans d’expérience, je vous propose une formation complète d’une journée, certifiée et adaptée à tous les niveaux.',
      'Rejoignez-nous et lancez-vous dans l’aventure.',
    ],
    duree: '1 journée',
    certificat: true,
    remarque: 'Les élèves ayant besoin de plus de pratique ou de précision peuvent revenir ultérieurement pour un accompagnement complémentaire.',
    // Ajoutez autant d'URLs que souhaité : le carousel apparaît dès la 2e.
    images: [
      'https://media.s-bol.com/gX5MGvYO3k5r/r0zAB2/550x575.jpg',
      'https://i.ytimg.com/vi/nZsMf6CmSXM/maxresdefault.jpg',
      'https://www.espace-concours.fr/uploads/2021/10/shutterstock_1082017538-540x360.jpg',
      'https://serenity-institut.com/wp-content/uploads/2022/05/serenity-institut-epilation-au-fil-1024x684.jpg'
    ],
    ordre: 1,
    programme: [
      {
        horaire: '09h00 – 09h30',
        titre: 'Accueil et théorie',
        points: [
          'Présentation de la technique de l’épilation au fil',
          'Hygiène, posture et bases essentielles',
          'Explication du matériel et du fil',
        ],
      },
      {
        horaire: '09h30 – 10h30',
        titre: 'Apprentissage de la manipulation du fil',
        points: [
          'Prise en main du fil',
          'Exercices pratiques pour maîtriser le mouvement',
          'Coordination des gestes',
        ],
      },
      {
        horaire: '10h30 – 12h30',
        titre: 'Pratique sur modèle (zones simples)',
        points: [
          'Début de la pratique sur modèle',
          'Travail sur des zones comme les jambes',
          'Répétition des gestes pour gagner en précision et en confiance',
        ],
      },
      { horaire: '12h30 – 13h00', titre: 'Pause déjeuner (30 minutes)' },
      {
        horaire: '13h00 – 14h00',
        titre: 'Reprise de la pratique',
        points: [
          'Entraînement continu sur modèle',
          'Possibilité de travailler sur les mains ou le visage selon la progression',
        ],
      },
      {
        horaire: '14h00 – 16h00',
        titre: '[à compléter]',
        points: ['[slug — programme de l’après-midi, message tronqué]'],
      },
    ],
    videoPoster: undefined,
    galerie: false
  },
  {
    slug: 'henne',
    nom: 'Formation Henné',
    resume: 'Henné naturel du Rajasthan, tamisé cinq fois. Formation d’une journée avec certificat et kit de démarrage en option.',
    intro: [
      'Je vous propose une formation au henné naturel, provenant directement du Rajasthan, en Inde, et finement tamisé cinq fois, ce qui facilite le travail des artistes.',
      'Il s’agit d’une formation d’une journée, à l’issue de laquelle vous recevrez un certificat de participation. Il est également possible d’acheter un kit de démarrage.',
      'Durant cette journée, vous apprendrez les bases théoriques ainsi que la pratique : comment fabriquer les cônes de henné, préparer la pâte, ainsi que le remplissage et la fermeture des cônes. Nous travaillerons ensemble afin de vous permettre de maîtriser les gestes essentiels. Pour clôturer la formation en beauté, vous réaliserez quelques motifs simples.',
    ],
    duree: '1 journée',
    certificat: true,
    kit: 'Kit de démarrage disponible à l’achat',
    images: [
      'https://scontent-bru2-1.cdninstagram.com/v/t51.82787-15/762676734_18420554065183939_5761963327368721319_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=111&ig_cache_key=Mzk1NDMyNjgwOTk1NDMwMjgwNjE4NDIwNTU0MDYyMTgzOTM5.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLnhwaWRzLjEyMDYuc2RyLnZpZGVvX2RlZmF1bHRfY292ZXJfZnJhbWUuQzMifQ%3D%3D&_nc_ohc=3xqgAaK5rgkQ7kNvwHCNzFy&_nc_oc=Adq8Bz_E-R7xCXNI1U6CmO507K-z71Y9DJ079w3sh7CXiKxHKINk_Y0DAHC4xhLrohs&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-bru2-1.cdninstagram.com&_nc_gid=Zzlg2GQOOn04OgSwCU9A5Q&_nc_ss=7a22e&oh=00_AQIBXjC3Ea0Yuah-4cYh18eWcS4BnhHKKEGkE3K9QWkqoA&oe=6AAAB481',
      'https://scontent-bru2-1.cdninstagram.com/v/t51.82787-15/656794292_18400445548183939_6109247737782567174_n.jpg?stp=dst-jpegr_e35_tt6&_nc_cat=105&ig_cache_key=Mzg1ODA4MDMwNzcwMjQ1NTAzNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTQ0MC5oZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=1AtS2bXd0xEQ7kNvwExTCEd&_nc_oc=AdqP5gg3Hki5o-0fvU1PmKCuogEBnj-7kcUsqOJptiLgl-NL7F-DadjSgUs1-64hYb4&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-bru2-1.cdninstagram.com&_nc_gid=TTpuO0-lOWHPNKbH3nIWXQ&_nc_ss=7a22e&oh=00_AQKlBHnvEE8TaaoA1J0r4mKUNZ2EtWcWEQlZI3drtKarbw&oe=6AAABE60',
      'https://scontent-bru2-1.cdninstagram.com/v/t51.71878-15/618735077_911947011291146_7873329434786203771_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=102&ig_cache_key=MzgxMjk5OTU5OTMwOTIwNTQwNA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLnhwaWRzLjY0MC5zZHIudmlkZW9fZGVmYXVsdF9jb3Zlcl9mcmFtZS5DMyJ9&_nc_ohc=juV-AXFN-ksQ7kNvwHieamb&_nc_oc=Ado5WEnfmd0kvwBlnegogS7rfG2JoR-bKmyqVQ9mHLtIWwkRrj_xy9ts5zTRqM1Yfoc&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-bru2-1.cdninstagram.com&_nc_gid=9eMJZtCB1WnNsPNlnV0dvw&_nc_ss=7a22e&oh=00_AQL4Vqw4oYk7zYMGH9_MMiUZILDa-KmFmPYPGtO2io10DQ&oe=6AAAD6D7'
    ],
    video: 'https://res.cloudinary.com/rlxojjxq/video/upload/v1789198290/SaveClip.App_AQMyO6U3RD-evABGlQ7UJ83Vzgmqcnpfmp3mncPqi6HhTeblabdVYfEHyi0IGcecsAuVByufwUc7HzDsbVSYgV7B2BsjBkqHSowkBSw.mp4',
    ordre: 2,
    programme: [
      { horaire: '09h30 – 09h45', titre: 'Théorie' },
      { horaire: '09h45 – 11h00', titre: 'Préparation de la pâte de henné' },
      { horaire: '11h00 – 12h00', titre: 'Fabrication des cônes' },
      { horaire: '12h00 – 13h00', titre: 'Remplissage des cônes' },
      { horaire: '13h00 – 13h30', titre: 'Pause' },
      { horaire: '13h30 – 15h00', titre: 'Fermeture des cônes' },
      {
        horaire: '15h00 – 16h30',
        titre: 'Pratique / manipulation & motifs simples',
      },
    ],
    videoPoster: undefined,
    galerie: false
  },
];

export const getFormations = (): Formation[] =>
  [...FORMATIONS].sort((a, b) => a.ordre - b.ordre);

export const getFormation = (slug: string): Formation | null =>
  FORMATIONS.find((f) => f.slug === slug) ?? null;

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