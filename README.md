# Palki — Au fil de la beauté

Site et back-office de l'institut de beauté **Palki** (Ixelles), conçu en **SaaS multi-tenant** : chaque institut est une organisation (`orgs/{orgId}`) et toutes ses données sont scopées par `orgId`. Palki est le premier tenant.

- **Production** : https://palki-beauty.netlify.app
- **Netlify** : projet `palki-beauty`, déploiement auto depuis `main`
- **Stack** : Next.js 14 (App Router) · TypeScript · Tailwind CSS · Firebase (Auth, Firestore, Storage) · `@netlify/plugin-nextjs`

---

## Pages publiques

| Route | Contenu |
|---|---|
| `/` | Hero + Instagram/TikTok (`settings`), intro, **Mes disponibilités** (cartes par date, heures réservées barrées, clic → RDV), aperçu des soins, bandeau henné, CTA |
| `/soins`, `/soins/[slug]` | Soins + détail, tarifs ligne par ligne avec la promo applicable |
| `/tarifs` | Grille tarifaire, promos appliquées |
| `/promotions` | Offres en cours |
| `/galerie` | Galerie photo (`/api/galeries`) |
| `/formations`, `/formations/[slug]` | Formations `epilation-au-fil` et `henne` (contenu fixe dans `FORMATIONS`, `lib/data.ts`) |
| `/rendez-vous` | Réservation : soin → prestation → date → heure → coordonnées, puis WhatsApp. Accepte `?service=`, `?date=YYYY-MM-DD`, `?heure=HH:MM` |
| `/contact` | Coordonnées, plan, contact WhatsApp avec sujet |

Navbar : **Accueil · Soins · Tarifs · Contact**

---

## Back-office (`/admin`)

Connexion email / mot de passe (Firebase Auth), UI SaaS slate/indigo.

| Page | Rôle |
|---|---|
| `/admin` | Tableau de bord, bouton **« Initialiser le contenu »** (`seedDefaults(orgId)`) |
| `/admin/tarifs` | Prix et prestations (`dureeMin` sert au calcul des créneaux) |
| `/admin/promotions` | Réduction en % ou en €, cible `tout`, un service ou un tarif précis (`tarifCible`), dates optionnelles |
| `/admin/galeries` | Upload de photos avec compression côté client |
| `/admin/creneaux` | **Créneaux publiés par date** (voir plus bas) |
| `/admin/disponibilites` | Plages d'ouverture : semaine calendaire (`semaines`) ou semaine type (`horaires`), avec 3 états par jour : Ouvert, Sur RDV, Fermé |
| `/admin/reservations` | Confirmer, annuler (libère le créneau) ou supprimer une réservation |

---

## Système d'horaires

Deux niveaux. Pour une date donnée, le premier qui existe s'applique :

1. **Créneaux publiés** (`creneaux/{orgId}_{date}`), c'est le système « Mes disponibilités »
   - `heures` : liste des heures de début proposées (générées de X à Y toutes les 15, 30, 45 ou 60 min, puis éditables à l'unité)
   - `bloques` : heures barrées à la main (RDV pris par téléphone, pause…)
   - Une heure est **barrée** si elle est bloquée ou si une réservation la chevauche (`occupation`)
   - Réservation : une prestation de 45 min demande 2 créneaux libres consécutifs (`creneauxDepuisListe`)
   - L'accueil affiche les 6 prochaines dates publiées, et une heure libre renvoie vers `/rendez-vous?date=…&heure=…`
   - En admin : clic sur une heure pour la barrer ou la libérer, × pour la retirer, « Copier la semaine précédente »
2. **Plages horaires** (repli) : `semaines/{orgId}_{lundi}` si la semaine est personnalisée, sinon la semaine type `horaires/{orgId}_{jour}`. Les créneaux sont calculés tous les 15 min (`creneauxDisponibles`). Un jour « Sur RDV » ou « Fermé » n'offre aucun créneau en ligne.

Si aucune date n'est publiée, l'accueil affiche la liste des horaires de la semaine en cours.

---

## Données Firestore

```
users/{uid}                    { orgId, role: owner|admin|member }
orgs/{orgId}                   { name, ownerId, plan }
services/{orgId}_{slug}        Service
tarifs/{autoId}                Tarif + orgId
promotions/{autoId}            Promotion + orgId
horaires/{orgId}_{jour}        HoraireJour (semaine type)
semaines/{orgId}_{lundi}       { orgId, lundi, jours: HoraireJour[] }
creneaux/{orgId}_{date}        { orgId, date, heures[], bloques[] }
occupation/{autoId}            { orgId, date, heure, dureeMin }   ← public, sans données perso
reservations/{autoId}          Reservation + orgId + occupationId ← admin uniquement
settings/{orgId}               { adresse, telephone, email, instagram, tiktok }
```

Fichiers clés :
- `src/lib/data.ts` : accès aux données (tout est scopé par `orgId`), promos (`promoPourTarif`, `isPromoActive` en heure locale), créneaux, formations
- `src/lib/types.ts` : types (`JourCreneaux`, `HoraireJour`, `Promotion.tarifCible`…)
- `src/lib/tenant-context.tsx` : `TenantProvider` / `useTenant()`
- `src/components/admin/AuthGate.tsx` : login et inscription, résolution du tenant, rattachement d'un compte existant à une org

Les pages publiques lisent l'org via `NEXT_PUBLIC_ORG_ID` (repli `cGfNmIOEyottsLXor6P5`).

### Règles Firestore
`firestore.rules` dans le repo est la version simple (lecture publique, écriture si connecté). **Les règles multi-tenant actives sont dans la console Firebase** (`myOrgId()`, `create/update` sur `request.resource.data.orgId`, `delete` sur `resource.data.orgId`, blocs `users` et `orgs`). Chaque nouvelle collection (ex. `creneaux`) doit y être ajoutée.

---

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # clés Firebase + NEXT_PUBLIC_ORG_ID
npm run dev
```

`NEXT_PUBLIC_ORG_ID` doit aussi être défini dans les variables d'environnement Netlify.

## Déploiement

`netlify.toml` : plugin Next.js et exclusion du scan de secrets pour `NEXT_PUBLIC_FIREBASE_*`. Chaque push sur `main` déclenche un déploiement.

---

## Institut

Palki — au fil de la beauté · Av. de la Couronne 227, 1050 Ixelles (Bâtiment L, 1er étage) · 0485/464.024
Tokens Tailwind : `porcelain` `ink` `mauve` `plum` `rose` `sand` `cloud` · Polices : Cormorant Garamond (display), Jost (sans)

## À faire

- [ ] Ajouter `creneaux` aux règles multi-tenant dans la console Firebase
- [ ] Programme formation épilation : compléter 14h00–16h00
- [ ] Remplacer les placeholders `[slug — …]` (descriptions des soins) et les images Unsplash
- [ ] Galerie : `/api/galeries` écrit dans `public/` et `data/galeries.json`, ce qui ne persiste pas sur Netlify (filesystem en lecture seule / éphémère). Migrer vers Firebase Storage
- [ ] Sélecteur de tarif dans le formulaire promo (au lieu de copier les IDs)
