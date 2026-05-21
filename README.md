# Traçabilité Déchets BTP - Hackathon SaaS

Application mobile-first pour la gestion des Bordereaux de Suivi des Déchets (BSD).

## Fonctionnalités
- Auth Standard (Email/Pass)
- Gestion des Chantiers
- Création de BSD avec signature tactile
- Génération PDF automatique

## Installation

### Backend
1. `cd backend`
2. `npm install`
3. Configurez votre `DATABASE_URL` dans un fichier `.env`.
4. `npx prisma migrate dev` (ou `npx prisma db push` pour tester rapidement)
5. `npx prisma db seed`
6. `npm run start` (Configurez un script start dans package.json: `"start": "ts-node src/index.ts"`)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Utilisation
Connectez-vous avec :
- **Email** : `chef@chantier.fr`
- **Pass** : `password123`
