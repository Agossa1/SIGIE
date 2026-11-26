# SIGIE — Système Intégré de Gestion des Interventions Environnementales (HSE TERRA)

Plateforme web SIG (Système d'Information Géographique) et de gestion opérationnelle dédiée aux collectivités, services techniques et autorités territoriales au Bénin.  
Elle centralise la remontée d'incidents sur le terrain, la coordination des missions et interventions, le suivi GPS des brigades en temps réel et la visualisation cartographique des infrastructures et risques environnementaux.

---

## Sommaire

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture du projet](#architecture-du-projet)
- [Stack technique](#stack-technique)
- [Rôles et espaces applicatifs](#rôles-et-espaces-applicatifs)
- [Prérequis et installation](#prérequis-et-installation)
- [Configuration (.env)](#configuration-env)
- [Base de données, migrations et données initiales](#base-de-données-migrations-et-données-initiales)
- [Lancement en développement et production](#lancement-en-développement-et-production)
- [Tests et qualité de code](#tests-et-qualité-de-code)
- [API REST et WebSocket](#api-rest-et-websocket)
- [Documentation complémentaire](#documentation-complémentaire)

---

## Fonctionnalités principales

- **Pipeline opérationnel complet** :
  - **Signalements terrain** (`/api/reports`) : remontée géolocalisée avec catégorisation (`drainage`, `waste`, `road`, `lighting`, `flooding`, `biodiversity`, `air_quality`, `water_quality`, `other`), priorité, niveau de risque, commentaires et pièces jointes.
  - **Workflow de validation** : validation par le chef de brigade (`validate-by-team`), recommandation et aiguillage par le superviseur (`recommend` vers DST ou SGDS), puis transformation directe en mission (`from-report/:reportId`).
  - **Missions & Interventions** (`/api/missions`, `/api/interventions`) : planification, assignation aux équipes terrain, validation finale DST/SGDS, journal d'intervention (`logs`), traçabilité par signalement, statistiques et export CSV.
- **Cartographie SIG interactive** :
  - Carte unifiée (`MapLibre GL` + `react-map-gl`) avec fond OpenStreetMap, couches administratives du Bénin (départements, communes, arrondissements, quartiers), couches SIG personnalisées (GeoJSON / import Shapefile via `shpjs`), marqueurs de signalements, missions, interventions et positions GPS des équipes.
- **Suivi GPS en temps réel** :
  - Serveur WebSocket (`ws`) intégré au serveur HTTP diffusant les mises à jour de localisation des équipes (`TEAM_LOCATION_UPDATE`) vers les tableaux de bord cartographiques.
- **Modules métier territoriaux** :
  - **Infrastructures & Voirie** (`/api/infrastructure`), **Salubrité & Déchets** (`/api/sanitation` : points de collecte, collectes, campagnes), **Alertes & Crues** (`/api/alerts`), **Analytics & SLA** (`/api/analytics/summary`), **Notifications** (`/api/notifications`), **Organisations** (`/api/organizations`) et **Journaux d'audit** (`/api/audit`).
- **Sécurité & Gouvernance** :
  - Authentification JWT (`accessToken` + `refreshToken` avec rotation en base et cookies `httpOnly`, `SameSite=Strict`), hachage `bcryptjs`, vérification par code OTP envoyé par e-mail (SMTP), validation Zod des entrées, limitation de débit (`express-rate-limit`), en-têtes `helmet` et filtrage territorial automatique selon le rôle.
- **Progressive Web App (PWA)** :
  - Support hors-ligne partiel côté frontend via `vite-plugin-pwa` et Workbox (stratégie `NetworkFirst` sur `/api/missions` et `/api/reports` en production).

---

## Architecture du projet

```text
SIGIE/
├── SPECIFICATION_FONCTIONNELLE.md   # Spécification fonctionnelle détaillée
├── backend/                         # API REST Express + WebSocket + PostgreSQL/PostGIS + Redis
│   ├── docker-compose.yml           # Services PostgreSQL/PostGIS (15-3.4) et Redis (7-alpine)
│   ├── jest.config.js               # Configuration des tests Jest
│   ├── scripts/                     # Scripts de migration et de seed (territoire, rôles, utilisateurs, équipes)
│   └── src/
│       ├── index.ts                 # Point d'entrée (DB, migrations auto, Redis, HTTP, WS, graceful shutdown)
│       ├── server.ts                # Configuration Express (Helmet, CORS, compression, rate-limit, routes)
│       ├── routes/index.ts          # Montage centralisé des routes /api/*
│       ├── config/                  # Env (Zod), appConfig, Redis, JWT, mots de passe, WebSocket
│       ├── data/                    # Données géographiques du Bénin (GeoJSON, Shapefiles, découpage)
│       ├── infra/
│       │   ├── database/            # Pool PostgreSQL et runner de migrations SQL
│       │   ├── migrations/          # Schéma consolidé (00_final_schema.sql) et migrations 01..07
│       │   └── seed/                # Seed des municipalités
│       ├── modules/                 # Modules métier (auth, reports, missions, interventions, gis, teams, etc.)
│       ├── shared/                  # Middlewares (auth/RBAC, erreurs), logger Winston, mailer Nodemailer
│       └── utils/                   # Utilitaires divers
└── frontend/                        # SPA React + TypeScript + Vite + Tailwind CSS + MapLibre
    ├── index.html
    ├── vite.config.ts               # Config Vite, proxy /api -> :4000 et configuration PWA/Workbox
    ├── versel.json                  # Règles de réécriture SPA pour déploiement
    └── src/
        ├── main.tsx                 # Montage React, Redux Provider et enregistrement Service Worker PWA
        ├── App.tsx                  # Routage public / protégé (ProtectedLayout + RoleGuard)
        ├── lib/                     # Client HTTP fetch (apiClient.ts avec refresh auto sur 401)
        ├── stores/                  # Store Redux Toolkit et baseApi RTK Query
        ├── components/              # Composants UI partagés (UnifiedMap, UnifiedSidebar, Navbars, KPIs)
        ├── feature/                 # Modules fonctionnels (services RTK/slices/thunks, hooks, composants)
        └── pages/                   # Pages publiques (Auth), tableaux de bord par rôle et pages partagées
```

---

## Stack technique

### Backend (`SIGIE/backend`)

| Domaine | Technologies |
|---|---|
| Runtime & Langage | Node.js, TypeScript 6 |
| Framework HTTP | Express 5 |
| Base de données | PostgreSQL + extension spatiale **PostGIS** (`pg`) |
| Cache | Redis 4 (`redis`) |
| Temps réel | WebSocket (`ws`) |
| Validation & Sécurité | Zod 4, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `cookie-parser` |
| Fichiers & Médias | `multer`, `sharp`, `cloudinary`, `@aws-sdk/client-s3`, `shpjs` |
| Données territoriales | `decoupage-territorial-benin` + fichiers GeoJSON/Shapefile |
| Logs, Email & Perf | `winston`, `morgan`, `nodemailer`, `compression` |
| Tests & Qualité | Jest, `ts-jest`, ESLint |

### Frontend (`SIGIE/frontend`)

| Domaine | Technologies |
|---|---|
| UI & Langage | React 19, TypeScript 6, Vite 8 (avec React Compiler via Babel) |
| Routage | React Router DOM 7 |
| État & Appels API | Redux Toolkit 2, RTK Query (`baseApi`), `react-redux`, `axios` |
| Cartographie SIG | `maplibre-gl` 5, `react-map-gl` 8, `shpjs` |
| Styles & Layout | Tailwind CSS 4, `lucide-react`, `react-grid-layout`, `react-resizable` |
| Formulaires & DataViz | `react-hook-form`, `@hookform/resolvers`, `zod` 4, `chart.js`, `react-chartjs-2`, `recharts` |
| PWA | `vite-plugin-pwa`, `workbox-window` |

---

## Rôles et espaces applicatifs

La plateforme gère **11 rôles** répartis en 3 niveaux (`platform`, `territorial`, `field`), avec routage et périmètre territorial dédiés dans `frontend/src/pages/shared/rolePages.config.ts` :

| Rôle (`user_role_enum`) | Niveau | Préfixe / Dashboard | Périmètre principal |
|---|---|---|---|
| `super_admin` | Plateforme | `/admin` & `/platform/*` | Accès complet, gestion des rôles, utilisateurs, couches SIG, audit |
| `platform_admin` | Plateforme | `/admin` & `/platform/*` | Administration utilisateurs, organisations, couches SIG et audit |
| `ministry` | Territorial | `/ministry/dashboard` | Supervision nationale agrégée |
| `prefecture_director` | Territorial | `/prefecture/dashboard` | Supervision départementale |
| `mayor` | Territorial | `/mayor/dashboard` | Tableau de bord et gestion communale |
| `dst_manager` | Territorial | `/dst/dashboard` | Direction des Services Techniques (ouvrages, voirie, chantiers) |
| `sgds_manager` | Territorial | `/sgds/dashboard` | Salubrité, collecte de déchets et alertes d'assainissement |
| `supervisor` | Terrain | `/supervisor/dashboard` | Coordination de zone, missions, interventions et équipes GPS |
| `team_leader` | Terrain | `/team-leader/dashboard` | Encadrement de brigade et pré-validation des signalements |
| `technician` | Terrain | `/technicien/dashboard` | Remontée de signalements et exécution des missions/interventions |
| `viewer` | Terrain | `/viewer/dashboard` | Consultation en lecture seule (carte, ouvrages, routes, salubrité, alertes) |

---

## Prérequis et installation

### Prérequis

- **Node.js** (LTS recommandé, v20+) et **npm**
- **PostgreSQL 15+** avec extension **PostGIS** (ou **Docker / Docker Compose**)
- **Redis 7+** (ou via Docker Compose)
- Un compte/serveur **SMTP** pour l'envoi des codes OTP

### Installation des dépendances

```bash
# Backend
cd SIGIE/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Configuration (`.env`)

### Backend (`SIGIE/backend/.env`)

Le fichier `src/config/app/env.ts` valide les variables au démarrage via Zod. Créez un fichier `SIGIE/backend/.env` :

```env
NODE_ENV=development
PORT=4000

# Base de données PostgreSQL / PostGIS
DB_HOST=localhost
DB_PORT=5432
DB_USER=Hse
DB_PASSWORD=votre_mot_de_passe
DB_NAME=hsetera

# Cache Redis
REDIS_URL=redis://localhost:6379

# Sécurité & JWT
JWT_SECRET=cle_secrete_jwt_au_moins_10_caracteres
REFRESH_SECRET=cle_secrete_refresh_au_moins_10_caracteres
JWT_EXPIRES_IN=1d
EXPIRES_ACCESS_SECRET=1d
EXPIRES_REFRESH_SECRET=15d
PASSWORD_PEPPER=chaine_aleatoire_longue_recommandee

# CORS / URL du frontend
FRONTEND_URL=http://localhost:5173

# Intégration WhatsApp / Meta (validée par env.ts)
META_TOKEN=votre_token_meta_au_moins_10_caracteres
META_PHONE_NUMBER_ID=votre_phone_number_id

# Configuration SMTP (envoi des OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@exemple.com
SMTP_PASS=votre_mot_de_passe_application
MAIL_FROM=noreply@exemple.com
MAIL_FROM_NAME=SIGIE Support
```

### Frontend (`SIGIE/frontend/.env`, optionnel en local)

En développement, `vite.config.ts` proxifie automatiquement `/api` vers `http://localhost:4000`.  
Si le serveur WebSocket est hébergé sur une autre URL que `ws://localhost:4000`, définissez :

```env
VITE_WS_URL=ws://localhost:4000
```

---

## Base de données, migrations et données initiales

### 1. Démarrer PostgreSQL (PostGIS) et Redis avec Docker

```bash
cd SIGIE/backend
docker compose up -d
```

> **Note** : `docker-compose.yml` lance `postgis/postgis:15-3.4` (`hsetera_postgres`) et `redis:7-alpine` (`hsetera_redis`). Si le fichier monté `./src/infra/migrations/01_schema.sql` n'existe pas directement à cet emplacement (les anciens scripts étant archivés dans `src/infra/migrations/autres/`), exécutez le script de migration consolidé ci-dessous après le démarrage du conteneur.

### 2. Appliquer le schéma et les migrations

Au démarrage du backend (`npm run dev` / `npm start`), `runMigrations()` exécute automatiquement les fichiers SQL dans `src/infra/migrations/` (suivis via la table `_migrations`).  
Vous pouvez également initialiser ou réinitialiser manuellement la base depuis `SIGIE/backend` :

```bash
# Appliquer le schéma consolidé (00_final_schema.sql)
npm run migrate:final

# Ou réinitialiser complètement puis réappliquer (attention : destructif)
npm run migrate:reset

# Appliquer les migrations incrémentales (01..07)
npm run migrate
```

### 3. Alimenter les données initiales (seeds)

Depuis `SIGIE/backend` :

```bash
npm run seed:territory    # Peuple départements, communes, arrondissements et quartiers du Bénin
npm run seed:categories   # Peuple les catégories de signalements
npm run seed:superadmin   # Crée le compte super_admin initial
npm run seed:test-users   # Crée des comptes de test pour chaque rôle
npm run seed:teams        # Crée des équipes de test
```

---

## Lancement en développement et production

### Développement

Dans deux terminaux distincts :

```bash
# Terminal 1 — Backend (http://localhost:4000 + ws://localhost:4000)
cd SIGIE/backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173 avec proxy /api)
cd SIGIE/frontend
npm run dev
```

### Build et production

```bash
# Backend
cd SIGIE/backend
npm run build
npm start

# Frontend (génère dist/ + Service Worker PWA)
cd SIGIE/frontend
npm run build
npm run preview
```

### Vérification de santé (Health Checks)

- `GET http://localhost:4000/health` : statut basique du serveur HTTP.
- `GET http://localhost:4000/api/health` : statut détaillé incluant la connectivité PostgreSQL et Redis.

---

## Tests et qualité de code

### Backend (`SIGIE/backend`)

```bash
npm test      # Lance Jest (ex. src/modules/auth/tests/auth.security.spec.ts, auth.types.spec.ts)
npm run lint  # Analyse ESLint sur src/**/*.ts
```

### Frontend (`SIGIE/frontend`)

```bash
npm run lint  # Analyse ESLint sur le projet
npm run build # Vérification TypeScript (tsc -b) et bundle Vite
```

---

## API REST et WebSocket

Toutes les routes API sont montées sous `/api` dans `SIGIE/backend/src/routes/index.ts`.  
L'authentification repose sur `authMiddleware` (cookie `accessToken` ou header `Authorization: Bearer <token>`) et le contrôle d'accès sur `requireRole(...)`.

| Préfixe | Module | Opérations principales |
|---|---|---|
| `/api/auth` | Authentification | `POST /register`, `/login`, `/verify`, `/logout`, `/refresh-token` |
| `/api/reports` | Signalements | CRUD, commentaires, assignation, `PATCH /:id/validate-by-team`, `PATCH /:id/recommend` |
| `/api/missions` | Missions | CRUD, `PATCH /:id/status`, assignations, rapports, `POST /from-report/:reportId`, `PATCH /:id/validate` |
| `/api/interventions` | Interventions | CRUD, `/mission/:missionId`, `/stats`, `/traceability/:reportId`, `/export/csv`, `/:id/logs` |
| `/api/teams` | Équipes | Liste des équipes et membres (`/:id/members`) |
| `/api/territory` | Territoire | `/regions`, `/municipalities`, `/districts`, `/neighborhoods` |
| `/api/gis` | Couches SIG | `GET /`, `GET /:id/geojson`, `POST /`, `DELETE /:id` |
| `/api/infrastructure` | Infrastructures | CRUD des ouvrages et équipements |
| `/api/sanitation` | Salubrité | `/points`, `/collections`, `/campaigns` |
| `/api/alerts` | Alertes | `GET /`, `POST /`, `PATCH /:id/acknowledge` |
| `/api/analytics` | Analytics & KPIs | `GET /summary` (filtré par rôle et périmètre territorial) |
| `/api/notifications` | Notifications | `GET /`, `PATCH /:id/read`, `PATCH /read-all` |
| `/api/organizations` | Organisations | CRUD des structures et collectivités |
| `/api/users` | Utilisateurs | `/me`, liste et attribution de rôles (`PATCH /:id/roles`) |
| `/api/roles` | Rôles | Consultation et mise à jour des rôles (`super_admin`) |
| `/api/profiles` | Profils | Lecture et mise à jour du profil utilisateur |
| `/api/audit` | Audit | Consultation des journaux d'audit (`super_admin`, `platform_admin`) |
| `/api/fieldops` | Opérations terrain | `GET /summary` |
| `/api/report-categories` | Stubs / Référentiel | Catégories de signalements |

### WebSocket (`ws://localhost:4000`)

- **Authentification** : automatique via le cookie `accessToken` pour le client web, ou via message JSON `{ "type": "AUTH", "token": "<accessToken>" }` dans les 10 secondes suivant la connexion.
- **Événement temps réel** : `TEAM_LOCATION_UPDATE` consommé par le hook frontend `useTeamLocations.ts` pour actualiser en direct la position des équipes sur la carte.

---

## Documentation complémentaire

- [Spécification fonctionnelle (`SPECIFICATION_FONCTIONNELLE.md`)](./SPECIFICATION_FONCTIONNELLE.md) : documentation détaillée des workflows métier, du modèle de données et de la feuille de route historique du projet.
