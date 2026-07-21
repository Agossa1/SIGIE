# Module Teams (Gestion des Brigades de Terrain)

## Présentation
Le module **Teams** est le pilier de la gestion des ressources humaines opérationnelles du projet ENVDEV. Il permet d'organiser, de suivre et de valider l'activité des agents sur le terrain, particulièrement dans le contexte des interventions urbaines (gestion des déchets, inondations, voirie) au Bénin.

Ce module assure la transition entre la gestion administrative des utilisateurs et l'exécution technique des missions.

## Fonctionnalités Clés

### 1. Gestion des Brigades (`field_teams`)
- Création et configuration d'équipes rattachées à des organisations (Mairies, SGDS, Ministères) et des territoires spécifiques (Municipalités).
- Typage des brigades (ex: Brigade de Salubrité, Unité d'Intervention Rapide).

### 2. Composition et Mouvements (`team_members` & `staff_transfers`)
- **Affectation dynamique** : Gestion des membres actifs au sein d'une brigade.
- **Traçabilité des transferts** : Historique complet des mouvements d'agents entre différentes brigades avec motifs de transfert.
- **Promotions** : Suivi des évolutions de rôles (Chef de brigade, Technicien, etc.).

### 3. Pointage et Validation Terrain (`attendance_logs`)
- **Check-in GPS** : Validation de la prise de service via coordonnées géospatiales.
- **Intégration PostGIS** : Utilisation du type `GEOMETRY(Point, 4326)` pour garantir que les agents sont physiquement présents sur leur zone d'intervention.

## Architecture du Module

Le module suit une architecture granulaire "Un fichier, une responsabilité" :

- **Controllers** (`/controllers`) : Gèrent les requêtes HTTP, la validation des entrées via **Zod** et le formatage des réponses. Chaque action possède son propre contrôleur (ex: `CreateTeamController`).
- **Services** (`/services`) : Portent la logique métier et les règles de gestion (ex: `TransferAgentService`). Ils orchestrent les appels aux repositories et gèrent les logs via Winston.
- **Repositories** (`/repositories`) : Gèrent les interactions avec la base de données PostgreSQL via des requêtes SQL optimisées et des transactions sécurisées.
- **Types** (`/types`) : Définitions TypeScript centralisées pour garantir la cohérence des données entre le backend et le frontend.

## API Endpoints

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/teams` | Liste les brigades de l'organisation de l'utilisateur. |
| `POST` | `/api/teams` | Crée une nouvelle brigade de terrain. |
| `POST` | `/api/teams/transfer` | Transfère un agent d'une brigade à une autre avec historique. |
| `POST` | `/api/teams/check-in` | Enregistre le pointage GPS d'un agent. |

## Schéma de Données (PostgreSQL)

Le module s'appuie sur les tables suivantes :
- `field_teams` : Stockage des entités brigades.
- `team_members` : Table de liaison agents/équipes avec rôles internes.
- `staff_transfers` : Journal d'audit des transferts de personnel.
- `attendance_logs` : Journal des pointages avec données géospatiales.

## Intégrations
- **Missions** : Le module fournit les `assignedTeamId` nécessaires à la planification des opérations.
- **GIS** : Les logs de présence alimentent la vue "Live Location" sur le dashboard administrateur.

---
*Note : Ce module a été conçu pour supporter les contraintes de connectivité instable (Offline-First Ready) via des IDs UUID générés côté client ou API.*