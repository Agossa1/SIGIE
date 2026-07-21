# 📋 Spécification Fonctionnelle — Plateforme SIGIE

**Système Intégré de Gestion des Interventions Environnementales**

Version 1.0 — 19/07/2026

---

## Table des matières

1. [Présentation Générale](#1-présentation-générale)
2. [Architecture Technique](#2-architecture-technique)
3. [Gestion des Utilisateurs et Authentification](#3-gestion-des-utilisateurs-et-authentification)
4. [Module Territoire](#4-module-territoire)
5. [Module Signalements (Reports)](#5-module-signalements-reports)
6. [Module Missions](#6-module-missions)
7. [Module Interventions](#7-module-interventions)
8. [Module Équipes et GPS Temps Réel](#8-module-équipes-et-gps-temps-réel)
9. [Module Cartographie SIG](#9-module-cartographie-sig)
10. [Module Organisations](#10-module-organisations)
11. [Module Infrastructure](#11-module-infrastructure)
12. [Module Assainissement et Déchets](#12-module-assainissement-et-déchets)
13. [Module Risques et Inondations](#13-module-risques-et-inondations)
14. [Module Météo](#14-module-météo)
15. [Module Médias](#15-module-médias)
16. [Pages et Interfaces par Rôle](#16-pages-et-interfaces-par-rôle)
17. [Workflows Métier](#17-workflows-métier)
18. [Modules Planifiés (Non Implémentés)](#18-modules-planifiés-non-implémentés)
19. [Analyse des Incohérences, Décalages et Redondances](#19-analyse-des-incohérences-décalages-et-redondances)
20. [Recommandations et Feuille de Route](#20-recommandations-et-feuille-de-route)

---

## 1. Présentation Générale

### 1.1 Contexte

**SIGIE** est une plateforme web de gestion territoriale destinée aux collectivités, services techniques et autorités au Bénin. Elle centralise la remontée d'incidents terrain, la planification de missions d'intervention, le suivi GPS des équipes en temps réel et la visualisation cartographique SIG des données opérationnelles.

### 1.2 Objectifs Métier

| Objectif | Description |
|----------|-------------|
| **Réactivité** | Réduire les délais entre la détection d'un incident et l'intervention sur le terrain |
| **Visibilité** | Offrir une vue centralisée et temps réel de toutes les opérations en cours |
| **Traçabilité** | Suivre le cycle de vie complet d'un incident : signalement → mission → intervention → résolution |
| **Aide à la décision** | Fournir des indicateurs de performance (SLA, temps de résolution, taux d'achèvement) aux décideurs |
| **Coordination** | Permettre aux superviseurs d'assigner les bonnes équipes aux bonnes missions, au bon endroit |

### 1.3 Public Cible

| Acteur | Rôle dans la plateforme |
|--------|------------------------|
| **Agent terrain** | Signale les incidents, exécute les missions, pointe sa position GPS |
| **Chef de brigade** | Coordonne son équipe, valide les signalements, suit les missions |
| **Superviseur** | Supervise une zone géographique, assigne les missions, contrôle la qualité |
| **Maire / Élu** | Consulte le tableau de bord de sa commune, prend les décisions budgétaires |
| **Directeur préfectoral** | Supervise le département, consolide les rapports |
| **Ministère** | Vue nationale, indicateurs agrégés, pilotage stratégique |
| **DST / SGDS** | Services techniques : ouvrages, salubrité, maintenance |
| **Admin plateforme** | Gère les utilisateurs, rôles, organisations, configuration |
| **Observateur** | Consultation en lecture seule |

---

## 2. Architecture Technique

### 2.1 Stack Technologique

#### Backend

| Composant | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| Runtime | Node.js | — | Exécution JavaScript côté serveur |
| Framework HTTP | Express | 5.x | API REST, middlewares, routage |
| Langage | TypeScript | 6.x | Typage statique, DTOs, énumérations |
| Base de données | PostgreSQL | — | Stockage relationnel + données spatiales (PostGIS) |
| Cache | Redis | 4.x | Cache des requêtes spatiales et des sessions |
| Temps réel | WebSocket (ws) | 8.x | Diffusion des positions GPS équipes |
| Upload | Multer | 2.x | Réception des fichiers (photos, shapefiles) |
| Médias | Cloudinary + Sharp | — | Stockage cloud et compression d'images |
| Sécurité | Helmet + CORS + JWT + bcryptjs | — | Protection, authentification, hashage |
| Validation | Zod | 4.x | Schémas de validation des DTOs |
| Logging | Winston + Morgan | — | Journalisation applicative et HTTP |
| Email | Nodemailer | — | Envoi de mails (OTP, notifications) |
| Compression | compression | — | Gzip des réponses (GeoJSON volumineux) |

#### Frontend

| Composant | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| Framework | React | 19.x | UI Single Page Application |
| Build | Vite | 8.x | Bundler et serveur de développement |
| Langage | TypeScript | 6.x | Typage statique |
| Routage | React Router DOM | 7.x | Navigation par rôle et permissions |
| État global | Redux Toolkit | 2.x | Store centralisé + RTK Query |
| Cartographie | MapLibre GL + react-map-gl | 5.x / 8.x | Carte interactive vectorielle |
| Styles | Tailwind CSS | 4.x | Design system utilitaire |
| Formulaires | React Hook Form + Zod | 7.x / 4.x | Formulaires validés |
| Graphiques | Chart.js + Recharts | 4.x / 3.x | Visualisation de données |
| Layout | react-grid-layout | 2.x | Dashboards redimensionnables |

### 2.2 Architecture de l'API

Tous les endpoints sont préfixés par `/api/`.

```
/api/auth          → Authentification (register, login, verify, logout, refresh-token)
/api/reports       → Signalements (CRUD, commentaires, assignation)
/api/missions      → Missions (CRUD, assignation, rapports, checklist, logs)
/api/interventions → Interventions (CRUD, statut, par mission)
/api/teams         → Équipes (liste, membres)
/api/territory     → Découpage administratif (régions, communes, arrondissements, quartiers)
/api/users         → Utilisateurs (CRUD, statuts)
/api/roles         → Rôles et permissions
/api/gis           → Couches SIG (listage, GeoJSON, suppression)
/api/organizations → Organisations
/api/              → Stubs pour modules non migrés
/api/health        → Health check
```

### 2.3 Structure des Modules Backend (Pattern de référence : Reports)

```
src/modules/reports/
├── reports.module.ts          ← Point d'entrée : injection de dépendances
├── repositories/
│   └── reports.repository.ts  ← Accès aux données (SQL, Redis)
├── services/
│   ├── create.ts              ← Logique métier
│   ├── get.ts                 ← Logique métier + filtrage territorial
│   ├── update.ts
│   ├── delete.ts
│   ├── comment.ts
│   └── assign.ts
├── controllers/
│   ├── create.controller.ts   ← Gestion requête/réponse HTTP
│   ├── get.controller.ts
│   ├── update.controller.ts
│   ├── delete.controller.ts
│   ├── comment.controller.ts
│   └── assign.controller.ts
├── types/
│   └── reports.types.ts       ← Interfaces, DTOs, énumérations
└── routes/
    └── reports.routes.ts      ← Définition des endpoints
```

**Note d'architecture** : Ce pattern n'est pas uniforme. Certains modules (Teams, Interventions, Territory, GIS) utilisent une approche fonctionnelle simplifiée avec SQL inline, sans séparation Repository/Service/Controller.

### 2.4 Sécurité

| Mécanisme | Description |
|-----------|-------------|
| **JWT Access Token** | Token courte durée (dans la réponse JSON) |
| **JWT Refresh Token** | Token longue durée (cookie httpOnly, SameSite Strict) |
| **Helmet** | En-têtes de sécurité HTTP |
| **CORS** | Whitelist d'origines autorisées |
| **Rate Limiting** | (configuré dans le middleware) |
| **RBAC** | Contrôle d'accès basé sur les rôles (`requireRole` middleware) |
| **Filtrage territorial** | Chaque utilisateur ne voit que les données de sa zone |
| **Validation Zod** | Toutes les entrées utilisateur validées côté serveur |

---

## 3. Gestion des Utilisateurs et Authentification

### 3.1 Modèle Utilisateur

```typescript
interface User {
    id: string;
    organizationId?: string;      // Rattachement à une organisation
    regionId?: string;            // Zone territoriale : région
    municipalityId?: string;      // Zone territoriale : commune
    districtId?: string;          // Zone territoriale : arrondissement
    neighborhoodId?: string;      // Zone territoriale : quartier
    roles: User_Role[];           // Rôles multiples possibles
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    status: UserStatus;           // pending | active | suspended | disabled
    createdAt: string;
    updatedAt: string;
}
```

### 3.2 Rôles et Permissions

| Rôle | Code | Niveau | Description |
|------|------|--------|-------------|
| Super Admin | `super_admin` | Plateforme | Accès total, configuration système |
| Admin Plateforme | `platform_admin` | Plateforme | Gestion utilisateurs, rôles, organisations, audit |
| Ministère | `ministry` | National | Vue d'ensemble nationale, rapports |
| Directeur Préfectoral | `prefecture_director` | Département | Supervision départementale |
| Maire | `mayor` | Commune | Gestion communale, décisions |
| DST Manager | `dst_manager` | Commune | Services techniques, ouvrages |
| SGDS Manager | `sgds_manager` | Commune | Salubrité, déchets |
| Superviseur | `supervisor` | Zone | Coordination terrain |
| Chef de Brigade | `team_leader` | Brigade | Encadrement d'équipe |
| Technicien | `technician` | Terrain | Exécution, signalements |
| Observateur | `viewer` | Variable | Consultation lecture seule |

### 3.3 Flux d'Authentification

```
┌──────────┐    POST /api/auth/register    ┌──────────┐
│  Nouvel  │ ───────────────────────────── │  Compte  │
│  Compte  │     { email, password, ... }  │  Créé    │
└──────────┘                               └────┬─────┘
                                                │ Code OTP envoyé par email
                                                ▼
┌──────────┐    POST /api/auth/verify      ┌──────────┐
│  Compte  │ ───────────────────────────── │  Compte  │
│  Actif   │     { email, code }           │  Vérifié │
└──────────┘                               └──────────┘

┌──────────┐    POST /api/auth/login       ┌──────────┐
│  Login   │ ───────────────────────────── │  Session │
│          │     { email, password }       │  Active  │
└──────────┘                               └────┬─────┘
     ▲                                          │
     │     POST /api/auth/refresh-token         │ AccessToken + RefreshToken (cookie)
     └──────────────────────────────────────────┘
```

### 3.4 Endpoints

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/auth/register` | Non | Création de compte |
| `POST` | `/api/auth/login` | Non | Connexion → tokens |
| `POST` | `/api/auth/verify` | Non | Vérification du compte (OTP) |
| `POST` | `/api/auth/logout` | Oui | Invalidation du refresh token |
| `POST` | `/api/auth/refresh-token` | Cookie | Nouvel access token |

### 3.5 Profil Utilisateur

- **Photo de profil** : upload vers Cloudinary
- **Préférences** : langue (FR/EN), thème (clair/sombre), notifications
- **Mot de passe** : oubli → code OTP → réinitialisation ; changement depuis l'espace connecté

### 3.6 Endpoints Utilisateurs

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/api/users` | Oui | admin | Liste paginée |
| `GET` | `/api/users/:id` | Oui | admin | Détail utilisateur |
| `POST` | `/api/users` | Oui | admin | Création |
| `PUT` | `/api/users/:id` | Oui | admin | Mise à jour |
| `PATCH` | `/api/users/:id/status` | Oui | admin | Changement de statut |

---

## 4. Module Territoire

### 4.1 Hiérarchie Administrative du Bénin

```
Département (Region)
  ├─ Commune (Municipality)
  │   ├─ Arrondissement (District)
  │   │   ├─ Quartier / Village (Neighborhood)
  │   │   └─ ...
  │   └─ ...
  └─ ...
```

### 4.2 Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/territory/regions` | Toutes les régions (12 au Bénin) |
| `GET` | `/api/territory/municipalities?regionId=` | Communes d'une région (77 au total) |
| `GET` | `/api/territory/districts?municipalityId=` | Arrondissements d'une commune |
| `GET` | `/api/territory/neighborhoods?districtId=` | Quartiers d'un arrondissement (limité à 200) |

### 4.3 Fonctionnalités

- Sélecteurs en **cascade** dans tous les formulaires
- Filtrage territorial automatique des données selon le rôle
- Limites administratives en GeoJSON pour affichage cartographique
- Données sources : `ben_admin_boundaries.geojson`, `decoupage-territorial-benin` (npm)

---

## 5. Module Signalements (Reports)

### 5.1 Concept

Un **signalement** (Technician Report) est une remontée d'incident effectuée par un agent terrain. Il contient une géolocalisation obligatoire, une photo, une catégorisation, et suit un workflow de traitement.

### 5.2 Catégories d'Incidents

| Code | Catégorie | Détails spécifiques |
|------|-----------|---------------------|
| `drainage` | Drainage / Assainissement | Niveau de blocage (%), hauteur d'eau (cm), statut d'écoulement (normal/reduced/blocked/overflowing) |
| `waste` | Déchets / Insalubrité | Volume estimé (m³), type de déchet |
| `road` | Route / Voirie | Surface dégradée (m²), profondeur nid-de-poule (cm) |
| `lighting` | Éclairage public | — |
| `flooding` | Inondation | — |
| `biodiversity` | Biodiversité | Nom d'espèce, type d'observation, comptage |
| `air_quality` | Qualité de l'air | ID capteur, valeur mesurée, unité |
| `water_quality` | Qualité de l'eau | ID capteur, valeur mesurée, unité |
| `other` | Autre | — |

### 5.3 Workflow de Statut

```
                        ┌──────────┐
                        │  DRAFT   │  (brouillon non soumis)
                        └────┬─────┘
                             │ soumission
                             ▼
                        ┌──────────┐
                        │SUBMITTED │  (soumis, en attente)
                        └────┬─────┘
                             │ assignation
                             ▼
                        ┌──────────┐
                        │ ASSIGNED │  (assigné à une équipe)
                        └────┬─────┘
                             │ début d'intervention
                             ▼
                        ┌──────────┐
                        │IN_PROGRESS│ (traitement en cours)
                        └────┬─────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              ┌──────────┐      ┌──────────┐
              │ RESOLVED │      │ REJECTED │  (rejeté)
              └────┬─────┘      └──────────┘
                   │ validation
                   ▼
              ┌──────────┐
              │VALIDATED │  (validé par le superviseur)
              └──────────┘
```

### 5.4 Niveaux de Priorité et de Risque

**Priorité** : `low` → `medium` → `high` → `critical` → `emergency`
**Risque** : `low` → `medium` → `high` → `critical`
**SLA** : Délai en heures pour le traitement (champ `slaHours`)

### 5.5 Géolocalisation

- **Obligatoire** : `latitude` (float) + `longitude` (float)
- Précision GPS enregistrée
- Affichage sur la carte SIG sous forme de points (icônes colorées par catégorie)

### 5.6 Photos et Médias

- Upload d'une photo en **base64** lors de la création
- Compression via **Sharp** avant envoi
- Stockage sur **Cloudinary**
- URLs stockées dans `mediaUrls[]`
- Endpoint de téléchargement optimisé pour les réseaux lents

### 5.7 Endpoints API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/reports` | Oui | Créer un signalement (avec photo base64) |
| `GET` | `/api/reports` | Oui | Liste paginée avec filtres |
| `GET` | `/api/reports/:id` | Oui | Détail complet (avec commentaires) |
| `PUT` | `/api/reports/:id` | Oui | Mise à jour (statut, assignation, etc.) |
| `DELETE` | `/api/reports/:id` | Oui | Suppression logique (soft delete) |
| `POST` | `/api/reports/:id/comments` | Oui | Ajouter un commentaire (interne/public) |
| `POST` | `/api/reports/:id/assign` | Oui | Assigner à une équipe ou un utilisateur |

### 5.8 Filtres Disponibles

- `status` : Statut du signalement
- `issueCategory` : Catégorie d'incident
- `priority` : Niveau de priorité
- `riskLevel` : Niveau de risque
- `regionId` / `municipalityId` / `districtId` / `neighborhoodId` : Filtre territorial
- `createdBy` : Créé par (ID utilisateur)
- `assignedTo` : Assigné à (ID utilisateur)
- `search` : Recherche textuelle
- `page` / `limit` : Pagination
- `sortBy` / `sortOrder` : Tri

### 5.9 Filtrage Territorial Automatique

Le backend applique un filtrage territorial automatique selon le rôle de l'utilisateur connecté :

| Rôle | Périmètre |
|------|-----------|
| `super_admin`, `platform_admin`, `ministry` | Aucun filtre (tout le territoire) |
| `technician` | Uniquement ses propres signalements (`createdBy`) |
| `team_leader`, `supervisor` | Sa commune (`municipalityId`) ou sa région (`regionId`) |
| `mayor`, `dst_manager` | Sa commune uniquement |
| `prefecture` *(bug → doit être `prefecture_director`)* | Sa région uniquement |
| `sgds_manager` | Sa région |
| `viewer` | Sa commune ou sa région |

---

## 6. Module Missions

### 6.1 Concept

Une **mission** est une tâche planifiée, assignée à une équipe, pour traiter un ou plusieurs incidents. Elle peut être créée manuellement ou (cible) générée à partir d'un signalement.

### 6.2 Types de Missions

| Code | Type | Description |
|------|------|-------------|
| `drain_cleaning` | Curage de caniveaux | Nettoyage des ouvrages de drainage |
| `waste_collection` | Collecte de déchets | Ramassage des ordures |
| `road_repair` | Réparation de route | Rebouchage de nids-de-poule, réfection |
| `flood_response` | Intervention inondation | Gestion de crise inondation |
| `inspection` | Inspection | Visite de contrôle |
| `emergency_response` | Intervention d'urgence | Réponse immédiate |
| `sanitation` | Assainissement | Travaux d'assainissement |
| `maintenance` | Maintenance | Entretien d'infrastructures |
| `reforestation` | Reboisement | Plantation d'arbres |
| `ecological_restoration` | Restauration écologique | Restauration d'écosystèmes |
| `biodiversity_survey` | Relevé de biodiversité | Inventaire faune/flore |

### 6.3 Workflow de Statut

```
DRAFT → PLANNED → ASSIGNED → IN_PROGRESS → COMPLETED → VALIDATED
                                    ↘ CANCELLED
```

### 6.4 Fonctionnalités

- **Assignation** : à une équipe (`assignedTeamId`) et/ou à des utilisateurs individuels
- **Rapports de mission** : texte descriptif, pourcentage d'achèvement, photos
- **Checklist** : liste de tâches à cocher avec ordre, auteur et date
- **Logs de statut** : historique complet des transitions avec auteur et timestamp
- **Géolocalisation** : `latitude`/`longitude` *(champs présents mais non exploités dans l'UI)*
- **Lien avec signalement** : `reportId` *(champ présent mais non exploité dans l'UI)*
- **Planification** : `scheduledAt`, `dueDate`, `estimatedHours`
- **Suivi** : `actualHours`, `isOverdue`

### 6.5 Endpoints API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/missions` | Oui | Créer une mission |
| `GET` | `/api/missions` | Oui | Liste paginée avec filtres |
| `GET` | `/api/missions/:id` | Oui | Détail complet (assignations, rapports, logs, checklist) |
| `PUT` | `/api/missions/:id` | Oui | Mise à jour |
| `DELETE` | `/api/missions/:id` | Oui | Suppression |
| `POST` | `/api/missions/:id/assign` | Oui | Assigner des utilisateurs |
| `POST` | `/api/missions/:id/report` | Oui | Soumettre un rapport de mission |
| `GET` | `/api/missions/:id/logs` | Oui | Historique des changements de statut |
| `POST` | `/api/missions/:id/checklist` | Oui | Ajouter un item à la checklist |
| `PUT` | `/api/missions/:id/checklist/:itemId` | Oui | Marquer un item fait/pas fait |

### 6.6 Modèle de Données

```typescript
interface Mission {
    id: string;
    municipalityId?: string;
    municipalityName?: string;
    missionType: MissionType;
    priorityLevel: PriorityLevel;
    title: string;
    description?: string;
    assignedTeamId?: string;
    assignedTeamName?: string;
    status: MissionStatus;
    scheduledAt?: string;
    completedAt?: string;
    createdBy: string;
    createdAt: string;
    latitude?: number;
    longitude?: number;
    reportId?: string;         // Lien vers le signalement source
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    isOverdue?: boolean;
}

interface MissionDetails extends Mission {
    assignments: MissionAssignment[];    // Utilisateurs assignés
    reports: MissionReport[];           // Rapports de mission
    statusLogs: MissionStatusLog[];     // Historique des statuts
    checklist: MissionChecklist[];      // Tâches à cocher
}
```

---

## 7. Module Interventions

### 7.1 Concept

Une **intervention** est l'action terrain concrète réalisée par une équipe dans le cadre d'une mission. Elle est toujours liée à une mission.

### 7.2 Structure

- **Mission parente** : `missionId`
- **Équipe** : `teamId`
- **Agent** : `userId`
- **Type** : `interventionType` (chaîne libre)
- **Géolocalisation** : stockée en base via `ST_Y(location::geometry)`, `ST_X(location::geometry)` (PostGIS)
- **Statut** : workflow de progression
- **Dates** : `startedAt`, `endedAt`

### 7.3 Endpoints API

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/api/interventions` | Oui | — | Liste paginée (50 max) |
| `GET` | `/api/interventions/mission/:missionId` | Oui | — | Interventions d'une mission |
| `POST` | `/api/interventions` | Oui | admin, supervisor | Créer une intervention |
| `PATCH` | `/api/interventions/:id/status` | Oui | — | Changer le statut |

### 7.4 Limites actuelles

- ❌ Pas d'affichage sur la carte SIG (malgré le stockage PostGIS)
- ❌ Pas de lien direct avec le signalement source (seulement via la mission parente)
- ❌ Pas de champ `reportId` dans l'interface Intervention

---

## 8. Module Équipes et GPS Temps Réel

### 8.1 Équipes (Field Teams)

Une **équipe** (brigade) est un groupe d'agents terrain dirigé par un chef de brigade.

#### Structure

```typescript
interface FieldTeam {
    id: string;
    name: string;              // Nom de l'équipe
    status: string;            // Actif / Inactif
    municipalityId?: string;   // Zone de couverture
    regionId?: string;
    membersCount: number;      // Nombre de membres
}
```

### 8.2 GPS Temps Réel

- **Check-in** : un agent signale sa position GPS via WebSocket
- **Diffusion** : toutes les positions sont broadcastées aux clients connectés
- **Check-out** : fin de service
- **Historique** : trajectoire consultable

#### Technologie

- **WebSocket** (`ws`) : connexion persistante
- **Redis** : stockage temporaire des positions
- **Frontend** : `useTeamLocations` hook, affichage sur carte MapLibre

### 8.3 Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/teams` | Liste de toutes les équipes |
| `GET` | `/api/teams/:id/members` | Membres d'une équipe |

### 8.4 Limites actuelles

- ❌ Le module `src/modules/teams/` est minimal (2 endpoints). La version complète avec WebSocket est dans `scripts/modules/teams/` mais non utilisée.
- ❌ Pas de lien entre la position GPS d'une équipe et la mission sur laquelle elle travaille
- ❌ Pas de persistance des check-ins dans un historique accessible via API REST

---

## 9. Module Cartographie SIG

### 9.1 Couches SIG (GIS Layers)

Gestion de couches géographiques personnalisées importées par les administrateurs.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | string | Nom de la couche |
| `layerType` | string | Type : region, municipality, water_network, drainage, roads, flood_zones, etc. |
| `description` | string | Description optionnelle |
| `municipalityId` | UUID | Commune concernée (optionnel) |
| `features` | JSON[] | Entités géographiques (GeoJSON features) |

### 9.2 Types de Couches Supportés

| Code | Libellé |
|------|---------|
| `region` | Région (Découpage) |
| `municipality` | Commune (Découpage) |
| `district` | Arrondissement (Découpage) |
| `neighborhood` | Quartier (Découpage) |
| `water_network` | Réseau d'eau |
| `drainage` | Réseau de drainage |
| `roads` | Voirie |
| `flood_zones` | Zones inondables |
| `electricity` | Réseau électrique |
| `buildings` | Bâtiments / Ouvrages |
| `vegetation` | Couvert végétal |
| `other` | Autre |

### 9.3 Endpoints API

| Méthode | Route | Auth | Rôles | Description |
|---------|-------|------|-------|-------------|
| `GET` | `/api/gis` | Oui | — | Liste des couches |
| `GET` | `/api/gis/:id/geojson` | Oui | — | Données GeoJSON d'une couche |
| `DELETE` | `/api/gis/:id` | Oui | admin | Supprimer une couche |

### 9.4 Carte Interactive Unifiée

La page `SharedGisMapPage` est la vue cartographique centrale. Elle utilise **MapLibre GL** via `react-map-gl`.

#### Couches affichées
- ✅ Limites administratives (GeoJSON territoires)
- ✅ Signalements (points colorés par catégorie)
- ✅ Positions GPS équipes (temps réel)
- ❌ Missions (non affichées — les données existent)
- ❌ Interventions (non affichées — les données existent)

#### Composants principaux
- `UnifiedMap` : composant carte principal
- `TerritorialGisMapSection` : section territoriale
- `mapHelpers` : utilitaires de carte
- `AdminMapLayers` : gestion des couches SIG

### 9.5 Limites actuelles

- ❌ Pas de `POST /api/gis` pour créer une couche (le frontend l'appelle pourtant)
- ❌ Pas de `PUT /api/gis/:id` pour modifier une couche
- ❌ Pas de requêtes spatiales (PostGIS non exploité : pas de `ST_Contains`, `ST_Distance`, `ST_Buffer`)
- ❌ Pas de recherche par proximité
- ❌ Pas d'export Shapefile/KML

---

## 10. Module Organisations

### 10.1 Concept

Gestion des entités de rattachement des utilisateurs.

### 10.2 Types d'Organisations

- Ministères
- Mairies / Communes
- Directions techniques (DST, SGDS)
- Entreprises partenaires
- Prestataires
- Fournisseurs

### 10.3 Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/organizations` | Liste des organisations |
| `POST` | `/api/organizations` | Créer une organisation |
| `PUT` | `/api/organizations/:id` | Modifier une organisation |

---

## 11. Module Infrastructure

### 11.1 Concept

Gestion du patrimoine physique : routes, caniveaux, ponts, ouvrages hydrauliques.

### 11.2 Statut

**État** : Module "initié" (présent dans `scripts/modules/` mais pas dans `src/modules/`)

### 11.3 Fonctionnalités Prévues

- Inventaire des ouvrages par commune
- Évaluation de l'état (bon, moyen, dégradé, critique)
- Historique des inspections
- Liaison avec les signalements concernant l'ouvrage

---

## 12. Module Assainissement et Déchets

### 12.1 Concept

Gestion de la propreté urbaine et de la collecte des déchets.

### 12.2 Statut

**État** : Non implémenté (pas de module backend dédié, page frontend vide)

### 12.3 Fonctionnalités Prévues

- Points de collecte des déchets (`waste_points`)
- Suivi des tournées de ramassage (`waste_collections`)
- Campagnes de salubrité (`sanitation_campaigns`)
- Zones insalubres identifiées

---

## 13. Module Risques et Inondations

### 13.1 Concept

Analyse et prévention des risques d'inondation.

### 13.2 Statut

**État** : Non implémenté (page frontend `AlertsPage` sans backend dédié)

### 13.3 Fonctionnalités Prévues

- Événements d'inondation historiques (`flood_events`)
- Modèles de prédiction (`flood_prediction_models`)
- Inspections hydrauliques
- Cartes des zones inondables
- Alertes automatiques basées sur les prévisions météo

---

## 14. Module Météo

### 14.1 Concept

Intégration de données météorologiques pour l'anticipation des risques.

### 14.2 Statut

**État** : Partiel (module dans `scripts/modules/weather/`, non monté dans l'API)

### 14.3 Fonctionnalités Prévues

- Données météorologiques en temps réel
- Stations météo
- Relevés de précipitations
- Alertes météo automatiques
- Croisement avec les risques d'inondation

---

## 15. Module Médias

### 15.1 Concept

Service de gestion des fichiers média (photos, pièces jointes).

### 15.2 Fonctionnalités

- **Upload** : Réception de fichiers via Multer
- **Compression** : Traitement via Sharp (redimensionnement, optimisation)
- **Stockage** : Cloudinary (cloud)
- **Cache** : URLs optimisées
- **Formats** : Images (JPEG, PNG, WebP), documents
- **Optimisation réseau** : Compression adaptée aux réseaux mobiles lents

### 15.3 Statut

**État** : Fonctionnel. Utilisé par le module Reports pour les photos de signalements.

---

## 16. Pages et Interfaces par Rôle

### 16.1 Tableau des Pages

| Page ID | Titre | Route Suffixe | Composant Principal |
|---------|-------|---------------|---------------------|
| `dashboard` | Tableau de bord | `dashboard` | `RoleTerritorialDashboard` / dashboard spécifique |
| `fieldOps` | Opérations terrain | `operations-terrain` | `SharedFieldOpsPage` / `FieldOpsDashboard` |
| `agentReports` | Signalements agents | `signalements` | `SignalementsMapPage` |
| `interventions` | Interventions | `interventions` | `SharedInterventionsPage` |
| `teamsGps` | Équipes & suivi GPS | `equipes-gps` | `SharedTeamsGpsPage` |
| `gisMap` | Cartographie SIG | `cartographie` | `SharedGisMapPage` |
| `infrastructure` | Ouvrages & canaux | `ouvrages` | `SharedInfrastructurePage` |
| `roads` | Réseau routier | `routes` | `SharedRoadsPage` |
| `sanitation` | Collectes & insalubrité | `salubrite` | `SharedSanitationPage` |
| `alerts` | Alertes & crues | `alertes` | `SharedAlertsPage` |
| `users` | Utilisateurs | `utilisateurs` | `PlatformUsersPage` |
| `organizations` | Organisations & communes | `organisations` | `PlatformOrganizationsPage` |
| `roles` | Rôles | `roles` | `PlatformRolesPage` |
| `access` | Accès & permissions | `acces` | `PlatformAccessPage` |
| `auditLog` | Journaux d'audit | `audit` | `PlatformAuditLogPage` |
| `layers` | Couches SIG | `couches` | `PlatformLayersPage` |

### 16.2 Répartition par Rôle

| Rôle | Préfixe URL | Pages |
|------|-------------|-------|
| **Super Admin** | `/platform/` + `/admin` | Les 16 pages + AdminDashboard |
| **Admin Plateforme** | `/platform/` | Les 16 pages |
| **Ministère** | `/ministry/` | dashboard, fieldOps, agentReports, interventions, teamsGps, gisMap, infrastructure, roads, sanitation, alerts |
| **Préfecture** | `/prefecture/` | Idem |
| **Maire** | `/mayor/` | Idem + dashboard personnalisé |
| **DST** | `/dst/` | Idem |
| **SGDS** | `/sgds/` | Idem |
| **Superviseur** | `/supervisor/` | dashboard, fieldOps, agentReports, interventions, teamsGps, gisMap |
| **Chef Brigade** | `/team-leader/` | Idem |
| **Technicien** | `/technicien/` | dashboard, fieldOps, agentReports, interventions, gisMap |
| **Observateur** | `/viewer/` | dashboard, gisMap, infrastructure, roads, sanitation, alerts |

### 16.3 Navigation

- **Route publique `/`** : Page de login
- **Route publique `/login`** : Page de login
- **Route protégée** : Toutes les autres pages nécessitent une session valide
- **Guard `RoleGuard`** : Vérifie les rôles avant d'afficher une page
- **Redirection** : Si non autorisé → `/login`
- **Session checking** : `refreshTokenThunk` au chargement de l'app

---

## 17. Workflows Métier

### 17.1 Pipeline Idéal (Cible)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Signalement  │ ──→ │   Mission    │ ──→ │ Intervention │ ──→ │  Rapport de  │
│  (agent GPS)  │     │  (planifiée) │     │  (terrain)   │     │  résolution  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     │                      │                     │                     │
     │ photo + GPS          │ équipe + dates      │ action + GPS        │ photos après
     │ catégorie + priorité │ checklist           │ statut              │ % complétion
     └──────────────────────┴─────────────────────┴─────────────────────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │   Dashboard  │
                           │  Analytics   │
                           │  SLA / KPI   │
                           └──────────────┘
```

### 17.2 Workflow Réel Actuel

```
Signalement ──→ (création avec photo, GPS, territoire) ✅
     │
     └──→ (liste, filtres, carte) ✅
     
Mission ──→ (création, assignation, checklist) ✅
     │
     └──→ (suivi de statut) ✅
     
Intervention ──→ (création liée à mission) ✅
     │
     └──→ (changement de statut) ✅
     
Signalement → Mission : ❌ PAS DE LIEN
Mission → Carte SIG : ❌ PAS D'AFFICHAGE
Intervention → Carte SIG : ❌ PAS D'AFFICHAGE
```

### 17.3 Processus de Création d'un Signalement

1. L'agent terrain ouvre l'app et s'authentifie
2. Il clique sur "Nouveau signalement"
3. Il remplit :
   - **Titre** et **description**
   - **Catégorie** (drainage, waste, road, etc.)
   - **Priorité** et **niveau de risque**
   - **Territoire** : sélection en cascade Région → Commune → Arrondissement → Quartier
   - **Géolocalisation** : automatique via GPS du téléphone
   - **Photo** : capture ou sélection depuis la galerie
   - **Détails spécifiques** selon la catégorie (ex: hauteur d'eau pour drainage)
4. Soumission → le signalement apparaît dans la liste et sur la carte

### 17.4 Processus de Traitement (Cible)

1. Un superviseur consulte les signalements de sa zone
2. Il évalue la criticité et décide de créer une **mission**
3. Le formulaire de mission est pré-rempli avec les données du signalement (titre, localisation, catégorie)
4. Il assigne une **équipe**, définit une **date**, une **durée estimée**, une **checklist**
5. L'équipe reçoit la mission, se rend sur site (GPS actif)
6. L'équipe crée une **intervention**, réalise les travaux
7. Un **rapport de mission** est soumis avec photos après, pourcentage d'achèvement
8. Le signalement source est marqué comme **résolu**

---

## 18. Modules Planifiés (Non Implémentés)

### 18.1 Analytics & Business Intelligence

**Priorité** : Haute  
**Fonctionnalités** :
- Tableaux de bord agrégés pour les décideurs
- Temps moyen de résolution par type d'incident
- Taux d'obstruction des caniveaux par commune
- Cartes de chaleur (heatmaps) des problèmes récurrents
- Nombre de missions par type et par commune
- Taux d'achèvement des missions

### 18.2 Notifications & Alertes

**Priorité** : Haute  
**Fonctionnalités** :
- Système unifié d'envoi : SMS, email, push notifications (Firebase FCM)
- Moteur de règles : alerte si SLA dépassé, alerte météo, alerte incident critique
- File d'attente de notifications
- Préférences de notification par utilisateur

### 18.3 SLA et Suivi des Performances

**Priorité** : Moyenne  
**Fonctionnalités** :
- Exploitation des tables `sla_policies` et `sla_tracking`
- Chronomètre visible sur les signalements critiques
- Notifications automatiques si SLA proche de la violation
- Dashboard SLA par catégorie d'incident

### 18.4 IoT et Capteurs Connectés

**Priorité** : Moyenne  
**Fonctionnalités** :
- Intégration de capteurs de niveau d'eau dans les bassins
- Capteurs de remplissage des poubelles
- Webhooks pour remontées automatiques
- Déclenchement automatique de missions

### 18.5 Synchronisation Hors-Ligne

**Priorité** : Moyenne  
**Fonctionnalités** :
- Mode hors-ligne pour l'application mobile
- File d'attente de synchronisation (`offline_sync_queue`)
- Résolution de conflits
- Statut de synchronisation par entité

### 18.6 IA et Modélisation Prédictive

**Priorité** : Basse  
**Fonctionnalités** :
- Croisement données météo + historique inondations + état curage
- Alertes proactives avant fortes pluies
- Analyse prédictive des zones à risque
- Optimisation des tournées de collecte

### 18.7 Portail Public / Citoyens

**Priorité** : Basse  
**Fonctionnalités** :
- API dédiées avec sécurité distincte
- Signalement citoyen (nids-de-poule, décharges sauvages)
- Suivi public des signalements
- Interface avec systèmes des entreprises prestataires

### 18.8 Audit et Traçabilité

**Priorité** : Basse  
**Fonctionnalités** :
- Exploitation de la table `audit_logs`
- Traçage de toutes les actions sensibles
- Interface de consultation : qui a modifié quoi, quand, depuis quelle IP

### 18.9 Gestion de Stock et Équipements

**Priorité** : Basse  
**Fonctionnalités** :
- Mouvements de stock (entrées/sorties)
- Suivi de l'état des véhicules
- Affectation du matériel lourd et EPI
- Alertes de réapprovisionnement

---

## 19. Analyse des Incohérences, Décalages et Redondances

### 19.1 Incohérences (Contradictions Internes)

#### I1 — Duplication du module Teams
```
src/modules/teams/teams.module.ts          ← Version active (2 endpoints basiques)
scripts/modules/teams/teams.module.ts       ← Version complète (WebSocket, types, validations) — IGNORÉE
```
Deux versions concurrentes coexistent. La version la plus complète est dans `scripts/`, jamais chargée.

#### I2 — Bug de nommage de rôle : `prefecture` ≠ `prefecture_director`
Dans `reports/services/get.ts` (backend), le filtrage territorial vérifie :
```typescript
roles.includes('prefecture')  // ⚠️ Ne matche jamais 'prefecture_director'
```
Les directeurs préfectoraux ne sont **jamais filtrés** par région — ils voient tout comme un admin.

#### I3 — GIS : triple architecture API concurrente
Le frontend GIS possède **3 couches redondantes** pour les mêmes appels :
1. `gis.api.ts` — Classe statique
2. `gis.thunk.ts` + `gis.slice.ts` — Redux Toolkit (createAsyncThunk + createSlice)
3. `gis.rtk.ts` — RTK Query (baseApi.injectEndpoints)

Et `AdminMapLayers.tsx` importe les **deux** mondes (`useAppDispatch` + `useUploadLayerMutation`).

#### I4 — `POST /api/gis` inexistant
Le frontend appelle `POST /api/gis` pour créer/uploader des couches (avec timeout 5 minutes), mais le routeur backend `gis.module.ts` ne définit **aucun endpoint POST**.

#### I5 — `AccountType` enum orphelin
`auth.types.ts` définit 12 types de comptes (`USER`, `ADMIN`, `ORGANIZATION`, `MUNICIPALITY`, `DISTRICT`, `NEIGHBORHOOD`, `FIELD_AGENT`, `TECHNICIAN`, `PARTNER`, `SUPPLIER`, `CITIZEN`) qui ne sont pas utilisés dans l'interface `User`.

#### I6 — Comportement territorial incohérent entre rôles
- Le maire voit sa commune (`filters.municipalityId`)
- Le préfet voit sa région (`filters.regionId`)
- Mais les deux ont les mêmes pages, y compris `agentReports`
- Pas de filtre district pour le maire (il ne peut pas filtrer par arrondissement de sa commune)

### 19.2 Décalages à l'Objectif

#### D1 — Pipeline Signalement → Mission → Intervention cassé
```
Cible :  Signalement ──→ Mission ──→ Intervention ──→ Résolution
Réel  :  Signalement    Mission    Intervention    (3 silos indépendants)
```
Le champ `reportId` existe dans `Mission` et `CreateMissionDTO` mais **aucune UI** ne permet de créer une mission depuis un signalement.

#### D2 — Carte SIG incomplète
La carte SIG n'affiche que 50% des objets géolocalisables :
- ✅ Signalements (points rouges)
- ✅ Positions GPS équipes
- ❌ Missions (ont `latitude`/`longitude` mais pas de couche carte)
- ❌ Interventions (stockées en PostGIS, pas de couche carte)

#### D3 — 6 pages sur 16 sans backend fonctionnel
| Page | Statut |
|------|--------|
| `infrastructure` | Module initié (scripts, pas dans src) |
| `roads` | Aucun module backend dédié |
| `sanitation` | Aucun module backend dédié |
| `alerts` | Aucun module backend dédié |
| `fieldOps` | Page composite sans API propre |
| `auditLog` | Table `audit_logs` existe mais pas d'API |

#### D4 — SLA / Analytics sans UI
Les tables `sla_policies`, `sla_tracking`, `kpi_metrics` existent. Les types ont `slaHours`, `resolvedAt`, `reportedAt`. Mais aucun dashboard, aucune alerte, aucun calcul.

#### D5 — Module GIS coquille vide
Backend GIS : uniquement GET (liste), GET (GeoJSON), DELETE. Pas de :
- Création de couche
- Modification de couche
- Requêtes spatiales PostGIS
- Recherche par proximité
- Export

#### D6 — Notifications absentes
- Aucun module backend notifications
- Le mailer (`utils/mailer/`) existe mais n'est pas intégré aux workflows
- Aucune alerte automatique

#### D7 — Double dashboard Admin
- `/admin` → `AdminDashboard.tsx`
- `/platform/dashboard` → `PlatformDashboardPage.tsx`
Deux dashboards pour le même rôle.

### 19.3 Redondances

#### R1 — Types métier dupliqués Backend ↔ Frontend
**100% des types Missions sont dupliqués à l'identique** entre `apps/backend/src/modules/missions/types/missions.types.ts` et `apps/frontend/src/feature/missions/services/missions.types.ts` :
`PriorityLevel`, `MissionStatus`, `MissionType`, `Mission`, `CreateMissionDTO`, `UpdateMissionDTO`, `MissionAssignment`, `MissionReport`, `MissionStatusLog`, `MissionChecklist`, `MissionDetails`.

#### R2 — `PriorityLevel` défini 2 fois dans le backend
- `reports/types/reports.types.ts`
- `missions/types/missions.types.ts`
Mêmes valeurs, pas de source unique.

#### R3 — `scripts/modules/` vs `src/modules/` — duplication massive
14 modules dans `scripts/modules/` (plus complets : controllers, services, repos, types, validations, tests) + 12 modules dans `src/modules/` (actifs, montés dans l'API, moins complets). Deux bases de code parallèles.

#### R4 — Deux patterns d'architecture module
| Pattern | Modules | Caractéristiques |
|---------|---------|------------------|
| **Classe** | Reports, Auth | `constructor(db, logger)` → DI → controllers |
| **Fonction** | Teams, Interventions, Territory, GIS | Fonction exportée, SQL inline |

#### R5 — Filtrage territorial non partagé
Le pattern de filtrage par rôle dans `reports/services/get.ts` devra être réimplémenté dans chaque module (missions, interventions). Aucun middleware ou helper partagé.

---

## 20. Recommandations et Feuille de Route

### 20.1 Matrice de Criticité

| # | Problème | Type | Impact | Effort |
|---|----------|------|--------|--------|
| 1 | Pipeline Signalement→Mission cassé | Décalage | 🔴 Bloquant | 🟡 3-5j |
| 2 | Bug `prefecture` / `prefecture_director` | Incohérence | 🔴 Fonctionnel | 🟢 5min |
| 3 | Carte SIG sans missions ni interventions | Décalage | 🔴 Majeur | 🟡 3-5j |
| 4 | `POST /api/gis` inexistant | Incohérence | 🔴 Bloquant | 🟢 1-2j |
| 5 | 6 pages sans backend | Décalage | 🟡 Moyen | 🔴 10-20j |
| 6 | `scripts/modules/` vs `src/modules/` | Redondance | 🟡 Structurel | 🔴 10-15j |
| 7 | Types dupliqués Backend/Frontend | Redondance | 🟡 Maintenance | 🟡 2-3j |
| 8 | Deux patterns d'architecture | Redondance | 🟡 Dette tech | 🟡 5-10j |
| 9 | GIS : 3 couches API frontend | Redondance | 🟡 Complexité | 🟢 1-2j |
| 10 | SLA/Analytics sans UI | Décalage | 🟢 Faible | 🟡 5-10j |
| 11 | Notifications absentes | Décalage | 🟢 Faible | 🔴 10-15j |
| 12 | `AccountType` orphelin | Incohérence | 🟢 Cosmétique | 🟢 30min |

### 20.2 Plan d'Action

#### Phase 1 — Corrections Immédiates (Semaine 1)

| Action | Fichiers | Effort |
|--------|----------|--------|
| **Corriger le filtre `prefecture` → `prefecture_director`** | `reports/services/get.ts` | 5 min |
| **Ajouter `POST /api/gis`** dans le routeur backend | `gis/gis.module.ts` | 1-2 jours |
| **Bouton "Créer une mission"** dans `ReportDetailsModal` → pré-rempli `reportId` | `ReportDetailsModal.tsx`, `CreateMissionModal.tsx` | 3-5 jours |

#### Phase 2 — Structuration (Semaines 2-4)

| Action | Fichiers | Effort |
|--------|----------|--------|
| **Afficher missions sur la carte SIG** (icône drapeau bleu) | `UnifiedMap.tsx`, `TerritorialGisMapSection.tsx`, `mapHelpers.ts` | 3-5 jours |
| **Afficher interventions sur la carte SIG** (icône orange) | Idem + `interventions.types.ts` | 2-3 jours |
| **Nettoyer le frontend GIS** (supprimer 2 des 3 couches redondantes) | `gis.api.ts`, `gis.thunk.ts`, `gis.slice.ts`, `gis.rtk.ts` | 1-2 jours |
| **Unifier le pattern d'architecture backend** (choisir classe ou fonction) | Tous les modules | 5-10 jours |
| **Créer un package `@sigie/shared-types`** pour types communs | Nouveau package | 2-3 jours |

#### Phase 3 — Complétude (Mois 2-3)

| Action | Effort |
|--------|--------|
| **Backend manquants** : infrastructure, roads, sanitation, alerts | 10-20 jours |
| **Dashboard SLA / Analytics** | 5-10 jours |
| **Module Notifications** (email, SMS, push) | 10-15 jours |
| **Nettoyer `scripts/modules/`** : migrer ou supprimer | 10-15 jours |
| **Vue "Opérations terrain" unifiée** | 10-15 jours |
| **Lien équipe → mission active** sur la carte | 3-5 jours |

#### Phase 4 — Innovation (Mois 4-6)

| Action | Effort |
|--------|--------|
| **Synchronisation hors-ligne** | 15-20 jours |
| **Module IoT / Capteurs** | 15-20 jours |
| **IA prédictive** (inondations) | 20-30 jours |
| **Portail citoyen** | 15-20 jours |

---

*Document rédigé à partir de l'analyse exhaustive du code source (backend + frontend), des types de données, des endpoints API, de la configuration des rôles, et des documents d'architecture existants (ARCHITECTURE_ANALYSIS.md, ARCHITECTURE_MODULES.md).*