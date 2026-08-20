# Palki — Au fil de la beauté

Site de l'institut de beauté Palki (Ixelles). Next.js 14 (App Router) · TypeScript · Firebase (Firestore / Auth / Storage) · Tailwind CSS.

## Pages publiques

- `/` Accueil (textes en `[slug]` à compléter par la cliente)
- `/soins` et `/soins/[slug]` Nos soins + page détail (henné inclus : `/soins/henne`)
- `/tarifs` Tarifs, promotions appliquées automatiquement
- `/galerie` Galerie
- `/promotions` Offres en cours
- `/contact` Adresse, téléphone, horaires, plan
- `/rendez-vous` Prise de rendez-vous par soin

## Espace cliente (`/admin`)

Connexion par email / mot de passe (Firebase Auth). Depuis l'admin, la cliente peut :

- **Tarifs** — modifier les prix, ajouter/retirer des prestations
- **Promotions** — créer des réductions en % ou en €, activables en un clic, ciblées sur un soin ou sur tout
- **Disponibilités** — définir les horaires d'ouverture jour par jour (les créneaux de rendez-vous en découlent)
- **Réservations** — confirmer / annuler les demandes reçues

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # renseigner les clés Firebase
npm run dev
```

### Firebase

1. Créer un projet, activer **Firestore** et **Authentication** (méthode Email/Mot de passe).
2. Créer le compte admin de la cliente dans Authentication.
3. Copier la config SDK dans `.env.local`.
4. Déployer les règles de sécurité : `firestore.rules`.
5. Se connecter sur `/admin` et cliquer **« Initialiser le contenu »** (charge soins, tarifs, horaires et coordonnées de départ).

## Déploiement (Netlify)

`netlify.toml` est prêt (plugin Next.js + suppression du scan de secrets sur les clés `NEXT_PUBLIC_FIREBASE_*`). Ajouter les variables d'environnement dans les réglages Netlify.

## À compléter

- Remplacer les `[slug — …]` de la landing et des en-têtes par les vrais textes.
- Remplacer les images de démonstration (Unsplash) par les photos de l'institut.
- Coordonnées par défaut : Av. de la Couronne 227, 1050 Ixelles (Bâtiment L, 1er étage) · 0485 46 40 24 (modifiables via `settings` / le code).
