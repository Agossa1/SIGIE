# Plan d'Architecture des Modules (Backend)

Ce document dresse la cartographie complète des modules du backend du système. Il détaille les modules actuellement existants (implémentés ou initiés), les modules restants (déduits du schéma de base de données, mais non encore créés) et des idées de modules supplémentaires pour enrichir la plateforme.

---

## 1. Modules Existants (Présents dans `src/modules/`)

Cette section liste les modules dont les dossiers existent déjà dans le projet. Certains sont pleinement fonctionnels, d'autres sont à l'état de "coquille vide" (comme le SIG).

| Nom du Module | État / Fonctionnalité Principale | Description |
| :--- | :--- | :--- |
| **`auth`** | Fonctionnel | Gère l'authentification des utilisateurs (login, création de tokens JWT, inscription). |
| **`password`** | Fonctionnel | Gère les flux de mots de passe (oubli, réinitialisation, création via OTP). |
| **`users`** | Fonctionnel | Gestion du cycle de vie des utilisateurs (CRUD, statuts, historique des statuts). |
| **`profiles`** | Fonctionnel | Gestion des préférences utilisateurs (langue, thème, notifications, photo). |
| **`roles`** | Fonctionnel | Gestion du RBAC (Role-Based Access Control) et des permissions associées. |
| **`organizations`** | Fonctionnel | Gestion des entités de rattachement (ministères, mairies, entreprises partenaires). |
| **`territory`** | Fonctionnel | Découpage administratif (Communes, Arrondissements, Quartiers/Villages). Fournit les limites GeoJSON de base. |
| **`teams`** | Fonctionnel | Gestion des ressources humaines terrain : brigades, affectations, pointage GPS (Check-in/out). |
| **`missions`** | Partiel | Gestion des tâches globales planifiées. Affectation de missions aux équipes, suivi de statut. |
| **`reports`** | Partiel | ("Technician Reports"). Remontées d'incidents terrain par les agents avec gestion de priorité et workflow. |
| **`media`** | Fonctionnel | Service de téléchargement et de compression d'images (via Sharp & Cloudinary) optimisé pour les réseaux lents. |
| **`weather`** | Partiel | Intégration de données météorologiques, stations météo, et remontées de précipitations pour l'anticipation des risques. |
| **`infrastructure`** | Initié | Gestion du patrimoine physique (routes, caniveaux, ponts) et évaluation de leur état. |
| **`gis`** | **Coquille vide** | Doit centraliser les couches géographiques (layers), les requêtes spatiales PostGIS, et l'édition d'entités cartographiques. |

---

## 2. Modules Restants (À implémenter selon le schéma DB)

En analysant le schéma SQL global (`01_schema.sql`), plusieurs périmètres fonctionnels ont été modélisés en base de données mais ne possèdent pas encore de dossier de module dédié.

### A. Assainissement & Déchets (`sanitation`)
- **Utilité :** Gérer la propreté urbaine.
- **Fonctionnalités :** Gestion des points de collecte (`waste_points`), suivi des tournées de ramassage (`waste_collections`), et organisation des campagnes de salubrité (`sanitation_campaigns`).

### B. Gestion de Stock et Équipements (`inventory` / `equipment`)
- **Utilité :** Suivre le matériel utilisé par les équipes sur le terrain.
- **Fonctionnalités :** Mouvements de stock (entrées/sorties), suivi de l'état des véhicules (`vehicle_status_enum`), et affectation du matériel lourd ou des EPI.

### C. Gestion des Risques et Inondations (`flood_risk`)
- **Utilité :** Analyser et prévenir les sinistres.
- **Fonctionnalités :** Enregistrement des événements historiques d'inondation (`flood_events`), modèles de prédiction (`flood_prediction_models`), et inspections hydrauliques détaillées.

### D. Notifications & Alertes (`notifications`)
- **Utilité :** Informer les acteurs en temps réel.
- **Fonctionnalités :** Système unifié pour l'envoi de SMS, emails, et notifications Push Firebase (FCM). Moteur de règles pour déclencher des alertes météo ou d'incident critique.

### E. Audit & Traçabilité (`audit`)
- **Utilité :** Sécurité et conformité.
- **Fonctionnalités :** Exploiter la table `audit_logs` existante pour tracer de manière immuable toutes les actions sensibles (qui a modifié quoi, à quelle heure, depuis quelle IP).

---

## 3. Modules Potentiels (Extensions Futures)

Pour faire évoluer la plateforme vers un système véritablement intelligent (Smart City / Gestion avancée du territoire), voici des modules qui pourraient être ajoutés :

### A. Module Analytics & BI (`analytics`)
- **Utilité :** Générer des tableaux de bord agrégés pour les décideurs.
- **Fonctionnalités :** Statistiques sur le temps de résolution des incidents, taux d'obstruction moyen des caniveaux par commune, cartes de chaleur (Heatmaps) des problèmes récurrents.

### B. Module IoT & Capteurs (`iot`)
- **Utilité :** Automatiser la collecte de données terrain.
- **Fonctionnalités :** Intégration de capteurs connectés (ex: sondes de niveau d'eau dans les bassins de rétention, capteurs de remplissage des poubelles). Ce module écouterait des webhooks et déclencherait automatiquement des alertes.

### C. Module de Synchronisation Hors-Ligne (`offline_sync`)
- **Utilité :** Garantir le fonctionnement de l'app mobile en zone blanche.
- **Fonctionnalités :** Moteur de résolution de conflits pour les données envoyées par les agents mobiles (pointages, rapports) ayant perdu leur connexion internet. Exploitation de la logique `sync_status_enum`.

### D. Module IA & Modélisation (`ai_engine`)
- **Utilité :** Rendre le système prédictif.
- **Fonctionnalités :** Analyse prédictive croisant les données météo, l'historique des inondations et l'état de curage des caniveaux pour alerter de manière proactive les autorités avant les fortes pluies.

### E. Module Partenaires et Citoyens (`public_portal`)
- **Utilité :** Ouverture vers l'extérieur.
- **Fonctionnalités :** API dédiées (et sécurisées différemment) pour permettre à une application grand public de signaler des nids-de-poule ou des décharges sauvages, ou pour s'interfacer avec les systèmes informatiques des entreprises prestataires.
