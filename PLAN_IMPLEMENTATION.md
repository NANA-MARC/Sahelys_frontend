# Plan d’implémentation — Frontend SAHELYS

Ce document est le suivi officiel du développement du frontend. Les décisions fonctionnelles et visuelles restent celles du cahier des charges, du document Bloc Interfaces et des maquettes.

## Règle de travail

Chaque étape suit le même ordre :

1. expliquer simplement l’objectif ;
2. réaliser uniquement le travail de cette étape ;
3. vérifier le résultat ;
4. cocher l’étape seulement lorsqu’elle fonctionne ;
5. passer à l’étape suivante.

Une étape ne doit jamais être commencée avant que la précédente soit terminée.

## Étapes

- [x] **1. Fondations du projet Angular**  
  Installer et configurer les outils prévus (Angular Material et Tailwind CSS), créer la structure `core`, `shared` et `features`, puis définir les styles globaux de la charte SAHELYS.

- [x] **2. Modèles et données simulées**  
  Définir les interfaces TypeScript (`User`, `Agent`, `Document`, `Message`, etc.) et créer les données mockées utilisées tant que le backend n’est pas disponible.

- [x] **3. Navigation, session et rôles simulés**  
  Créer les routes, les redirections après connexion, les guards et la gestion temporaire des rôles collaborateur, référent et administrateur central.

- [x] **4. Pages transverses**  
  Reproduire les pages Connexion, Accès refusé (403) et Page introuvable (404), conformément aux maquettes.

- [x] **5. Zone conversation**  
  Reproduire la sélection d’agent, le chat avec streaming simulé, l’historique des conversations et le profil.

- [x] **6. Gestion des agents — Référent**  
  Reproduire la liste des agents, le wizard de création en cinq étapes, le détail, les documents, les accès et la qualité.

- [x] **7. Supervision — Administrateur central**  
  Reproduire le tableau de bord, la gestion des comptes, les journaux de sécurité et les paramètres globaux.

- [x] **8. Vérification finale**  
  Vérifier les parcours selon les rôles, la fidélité aux maquettes, l’affichage mobile/tablette, les erreurs et la compilation de production.

## État actuel

- **Statut** : **Toutes les étapes du plan (Sprint 1 à 8) sont 100% complétées et validées !**
- **Compilation Production** : `ng build --configuration production` (Succès, 0 erreur, 0 avertissement).
- **Architecture** : Frontend Angular 18 Standalone, prêt pour l'interfaçage API Backend.
