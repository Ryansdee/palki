// Modèle de données Palki (collections Firestore)

export interface Service {
  slug: string; // identifiant lisible, ex. "henne"
  nom: string;
  resume: string; // phrase courte affichée sur les cartes / landing
  description: string; // texte long de la page détail
  image: string; // URL
  ordre: number;
  actif: boolean;
}

export interface Tarif {
  id: string;
  serviceSlug: string; // rattache le tarif à un service
  nom: string; // ex. "Sourcils au fil"
  prix: number; // en euros
  dureeMin: number; // durée en minutes (sert au calcul des créneaux)
  ordre: number;
}

export type PromotionType = 'pourcentage' | 'montant';

export interface Promotion {
  tarifCible: string;
  id: string;
  titre: string;
  description: string;
  type: PromotionType; // -% ou -X€
  valeur: number;
  cible: string; // "tout" ou un serviceSlug
  actif: boolean;
  debut?: string; // "YYYY-MM-DD" (optionnel)
  fin?: string; // "YYYY-MM-DD" (optionnel)
}

export interface Creneau {
  debut: string; // "09:00"
  fin: string; // "18:00"
}

// Disponibilités hebdomadaires récurrentes, éditables par la cliente.
// Un document par jour dans la collection "horaires" (id = "lundi", ...).
// Sert de SEMAINE TYPE : repli pour toute semaine sans horaires propres.
export interface HoraireJour {
  surRdv: any;
  jour: string; // "lundi" ... "dimanche"
  ferme: boolean;
  creneaux: Creneau[];
}

// Horaires d'une semaine calendaire précise, qui remplacent la semaine type.
// Un document dans la collection "semaines", id = date du lundi "YYYY-MM-DD".
export interface SemaineHoraire {
  lundi: string; // "YYYY-MM-DD" du lundi de la semaine
  jours: HoraireJour[]; // 7 entrées, ordre lundi → dimanche
}

// Créneaux affichés pour une date précise (système « Mes disponibilités »).
// Un document par date dans la collection "creneaux", id = `${orgId}_${date}`.
// Quand une date a ce document, il remplace les plages horaires pour la prise
// de RDV : seules ces heures de début sont proposées.
export interface JourCreneaux {
  date: string; // "YYYY-MM-DD"
  heures: string[]; // heures de début proposées, ex. ["11:00", "11:30", …]
  bloques: string[]; // heures barrées à la main (RDV pris par téléphone, etc.)
}

export type StatutReservation ='en_attente' | 'confirme' | 'annule';

export interface Reservation {
  id?: string;
  serviceSlug: string;
  prestation: string; // nom du tarif choisi
  date: string; // "YYYY-MM-DD"
  heure: string; // "HH:MM"
  dureeMin: number;
  client: { nom: string; email: string; tel: string };
  note?: string;
  statut: StatutReservation;
  createdAt: number;
  avisToken?: string;
  occupationId?: string; // lien vers le créneau bloqué (collection "occupation")
}

// Créneau occupé — sans données personnelles, lisible publiquement pour le
// calcul des disponibilités.
export interface Occupation {
  id?: string;
  date: string;
  heure: string;
  dureeMin: number;
}
// ── Avis clientes ─────────────────────────────────────────────────────
// Un avis ne peut être laissé que via une invitation liée à une réservation
// (lien unique envoyé par WhatsApp). L'id de l'avis = le token de l'invitation,
// ce qui garantit un seul avis par rendez-vous.
// ── Avis clientes ─────────────────────────────────────────────────────
// Deux sources :
//  - 'invitation' : lien unique envoyé par WhatsApp après une réservation.
//    L'id de l'avis = le token de l'invitation → un seul avis par rendez-vous.
//    Affiché avec le badge « Rendez-vous vérifié ».
//  - 'libre' : formulaire public /laisser-un-avis-sans-reservation (clientes
//    venues sans réserver en ligne). Toujours modéré avant publication.
// Les avis antérieurs sans champ `source` sont des avis 'invitation'.
export type StatutAvis = 'en_attente' | 'publie' | 'masque';
export type SourceAvis = 'invitation' | 'libre';

export interface AvisInvitation {
  orgId: string;
  reservationId: string;
  prenom: string;
  prestation: string;
  serviceSlug: string;
  createdAt: number;
}

export interface Avis {
  id?: string;
  orgId: string;
  prenom: string;
  prestation: string;
  serviceSlug: string;
  note: number; // 1 à 5
  commentaire: string;
  statut: StatutAvis;
  source?: SourceAvis; // absent = 'invitation' (anciens avis)
  createdAt: number;
  reponse?: string; // réponse publique de l'institut
  reponseAt?: number;
}

export interface Settings {
  adresse: string;
  telephone: string;
  email?: string;
  instagram?: string;
  tiktok?: string;
}

// ── Formations ────────────────────────────────────────────────────────
export interface FormationEtape {
  horaire: string; // "09h00 – 09h30"
  titre: string;
  points?: string[];
}

export interface Formation {
  videoPoster: string | undefined;
  galerie: boolean;
  slug: string; // "epilation-au-fil" | "henne"
  nom: string;
  resume: string; // phrase courte (cartes)
  intro: string[]; // paragraphes de présentation
  duree: string; // "1 journée"
  certificat: boolean;
  kit?: string; // mention kit de démarrage
  remarque?: string;
  images: string[]; // une ou plusieurs images (carousel si plusieurs)
  video?: string; // URL d'une vidéo (YouTube, Vimeo, etc.) 
  programme: FormationEtape[];
  ordre: number;
}