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

## Déploiement sur Vercel

Le projet est configuré pour être déployé sur Vercel. 

**Attention :** Le projet utilise actuellement SQLite. Sur Vercel, les fichiers SQLite sont réinitialisés à chaque redémarrage du serveur. Pour une utilisation réelle, passez à PostgreSQL (Supabase/Neon).

### Configuration :
1. Ajoutez `vercel.json` et le `package.json` racine (déjà présents).
2. Sur Vercel, liez votre dépôt.
3. Ajoutez les variables d'environnement :
   - `JWT_SECRET`
   - `VITE_API_URL=/api`
