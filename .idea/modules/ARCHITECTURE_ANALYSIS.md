# Analyse & Recommandations — Modules Métier

## Contexte

Analyse des 4 modules : **Reports (Signalements)**, **Missions**, **Interventions**, **Teams (Équipes)**
pour améliorer la cohérence en tant qu'outil de gestion de projet terrain.

---

## État des lieux

### ✅ Reports (Technician Reports) — Le plus mature
- Backend complet : CRUD, cache Redis, scope territorial, photos Cloudinary, détails spécialisés (drainage, route, déchets, biodiversité, environnement)
- Frontend complet : Dashboard, création avec photo, cascade territoriale, statuts workflow
- ✅ **GPS** : Latitude/Longitude obligatoires → affichés sur la carte SIG

### ⚠️ Missions — Partiel
- Backend : CRUD complet, assignation aux équipes, rapports de mission, logs de statut
- Types riches : `DRAIN_CLEANING`, `ROAD_REPAIR`, `FLOOD_RESPONSE`, etc.
- ❌ **Carte** : `latitude`/`longitude` existent dans le type mais ne sont **jamais utilisés**
- ❌ **Lien Reports → Missions** : Aucune interface pour créer une mission depuis un signalement
- ❌ **Visibilité carte SIG** : Les missions n'apparaissent nulle part sur les cartes

### ⚠️ Interventions — Minimal
- Backend : CRUD basique, lié à une mission, rapports terrain
- ❌ **Localisation absente** : Pas de `latitude`/`longitude` dans le type `Intervention`
- ❌ **Carte** : Invisibles sur la carte SIG
- ❌ **Lien Reports** : `reportId` existe dans `FieldInterventionReport` mais pas d'UI pour le lier

### ✅ Teams — Le plus complet côté infrastructure
- Backend complet : CRUD, GPS check-in WebSocket temps réel, transferts, promotions
- WebSocket temps réel pour les positions GPS
- ✅ **Carte** : Positions GPS visibles sur la page "GPS Équipes" (et maintenant sur la carte SIG)

---

## Problèmes identifiés

### 1. Aucune vue unifiée sur la carte SIG
Chaque module a sa propre UI cloisonnée. Un chef de terrain doit naviguer entre 4 pages différentes pour avoir une vue d'ensemble.

**Problème** : Impossible de voir en un coup d'œil :
- Où sont les signalements actifs ?
- Quelles missions sont en cours et où ?
- Où sont les équipes en temps réel ?
- Quelles interventions sont en cours et où ?

### 2. Pipeline Reports → Missions → Interventions cassé
Le flux logique devrait être :
> Signalement → Mission planifiée → Intervention terrain → Rapport de fin

Mais dans l'UI actuelle :
- Un rapport est soumis → personne ne peut le convertir en mission
- Une mission est créée manuellement sans lien avec le rapport source
- Les interventions n'ont pas de rapport de fin lié au signalement d'origine

### 3. Absence de métriques opérationnelles
La base de données a des tables `sla_policies`, `sla_tracking`, `kpi_metrics` mais aucune UI :
- Pas de suivi des temps de réponse
- Pas de tableau de bord "temps de résolution par type d'incident"
- Pas d'alerte quand un signalement critique dépasse le SLA

### 4. Pas de suivi "ce que fait chaque équipe maintenant"
- Les équipes pointent GPS mais on ne sait pas sur quelle mission/intervention elles travaillent
- Aucune vue "activité en cours" par équipe

---

## Plan d'amélioration recommandé

### Phase 1 — Court terme (immédiat)

#### 1.1 Afficher les missions sur la carte SIG
- Ajouter `missionsData?: MissionPin[]` à `TerritorialGisMapSection` / `UnifiedMap`
- Convertir les missions en `IncidentPin[]` ou un type `MissionPin` dédié
- Icône différente (ex: drapeau bleu) pour les distinguer des signalements (points rouges)

#### 1.2 Ajouter une localisation aux interventions
- Ajouter `latitude`/`longitude` dans l'interface `Intervention`
- Permettre à l'agent terrain de géolocaliser son intervention au moment de l'acceptation
- Afficher les interventions en cours sur la carte SIG (icône orange)

#### 1.3 Pipeline Report → Mission
- Dans la modale de détail d'un rapport, ajouter un bouton "Créer une mission"
- Pré-remplir le formulaire de mission avec les données du rapport (titre, description, localisation, type)
- Lier l'ID du rapport source dans la mission

### Phase 2 — Moyen terme (2-4 semaines)

#### 2.1 Vue "Opérations terrain" unifiée
- Nouvelle page qui combine :
  - Carte SIG avec : signalements + missions + interventions en cours + équipes GPS
  - Timeline des événements
  - Liste des équipes avec leur mission active
- Cette vue serait le tableau de bord par défaut pour les superviseurs et chefs de préfecture

#### 2.2 Statut "en mission" pour les équipes
- Ajouter un champ `current_mission_id` sur `field_teams` ou dans le WebSocket GPS
- Quand une équipe check-in, elle peut associer sa position à la mission en cours
- Sur la carte, cliquer sur une équipe montre "Travaille sur : [Nom de la mission]"

#### 2.3 Workflow SLA
- Utiliser les tables `sla_policies` et `sla_tracking` existantes
- Ajouter un chronomètre visible sur les signalements critiques
- Notifications automatiques quand un SLA est sur le point d'être violé

### Phase 3 — Long terme

#### 3.1 Tableau de bord analytics
- Temps moyen de résolution par catégorie
- Nombre de missions par type et par commune
- Taux d'achèvement des missions (basé sur `completion_percentage`)
- Carte de chaleur des incidents

#### 3.2 Synchronisation mobile avancée
- Utiliser la table `offline_sync_queue` existante
- Mode hors-ligne complet pour les agents terrain
- File d'attente de synchronisation avec résolution de conflits

#### 3.3 Alertes automatiques
- Déclencher des missions automatiquement basées sur :
  - Seuils météo (via module `weather`)
  - Accumulation de signalements dans une zone
  - SLA dépassé
  - Inondations prédites (via `flood_prediction`)

---

## Résumé des actions immédiates

| Action | Fichiers concernés | Priorité |
|--------|-------------------|----------|
| Afficher missions sur la carte SIG | `SharedGisMapPage.tsx`, `TerritorialGisMapSection.tsx`, `UnifiedMap.tsx` | 🔴 Haute |
| Pipeline Report → Mission | `ReportDetailsModal.tsx`, `CreateMissionModal.tsx`, API routes | 🔴 Haute |
| Localisation des interventions | `interventions.types.ts` (back + front), schema BDD | 🟡 Moyenne |
| Afficher interventions sur la carte | Idem + `UnifiedMap.tsx` | 🟡 Moyenne |
| Statut "en mission" pour équipes | WebSocket, `useTeamLocations.ts`, `SharedTeamsGpsPage.tsx` | 🟢 Basse |

---

*Analyse générée le 11/07/2026*
