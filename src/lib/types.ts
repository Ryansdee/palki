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

export type StatutReservation = 'en_attente' | 'confirme' | 'annule';

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

export interface Settings {
  adresse: string;
  telephone: string;
  email?: string;
  instagram?: string;
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