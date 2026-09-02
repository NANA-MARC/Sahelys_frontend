**SahelysAgents**

**Plan d'implémentation Frontend — Phase 1, par sprints**

_Bloc Interfaces (Angular)_

**NANA Marc**

20 août 2026

# **1\. Règle de travail**

Chaque sprint suit le même ordre : expliquer simplement l'objectif, réaliser uniquement le travail de ce sprint, vérifier le résultat, cocher le sprint seulement lorsqu'il fonctionne, puis passer au suivant. Un sprint ne doit jamais être commencé avant que le précédent soit terminé.

**Sprint 0 — Cadrage, design et vérification croisée**

Objectif : poser les bases fonctionnelles et visuelles avant tout code, et vérifier la cohérence avec les Blocs Backend & IA et Données & RAG.

**☑** Analyse du style visuel ADEN existant (captures d'écran) et définition du système de design (couleurs, composants, typographie)

**☑** Définition des 3 rôles utilisateurs et de la logique de routing associée (collaborateur, référent, administrateur central)

**☑** Établissement de la liste complète des 21 pages/écrans, réparties en 4 zones

**☑** Rédaction du document de structure Bloc Interfaces (v1)

**☑** Génération des 21 maquettes visuelles (Gemini) à partir de prompts détaillés et cohérents

**☑** Vérification croisée avec le document Backend & IA (K. Moussa) et le document Données & RAG (Y. Fabiana)

**☑** Résolution des points ouverts en équipe : contenu du JWT, format des réponses (streaming), format d'upload, endpoints manquants, périmètre de /admin/system/settings

**☑** Correction de 3 maquettes suite à la vérification croisée (Sélection d'agent, Mes conversations, Gestion des documents)

**☑** Mise à jour du cahier des charges (v2) et du document de structure Bloc Interfaces (v2)

**_Livrable du sprint :_** _Design system validé, 21 maquettes cohérentes, documents de référence à jour et alignés avec les deux autres blocs._

**Sprint 1 — Fondations du projet Angular**

Objectif : mettre en place un socle technique propre avant d'écrire la moindre page.

**☑** Création du projet Angular (standalone, TypeScript strict)

**☑** Installation et configuration d'Angular Material et de Tailwind CSS

**☑** Alignement du thème Tailwind avec le thème Material et la charte SAHELYS (couleurs, typographie)

**☑** Création de la structure de dossiers core / shared / features

**☑** Définition des styles globaux (variables de couleur, typographie de base)

**_Livrable du sprint :_** _Projet Angular qui démarre, thème SAHELYS appliqué, structure de dossiers conforme au document de référence._

**Sprint 2 — Modèles et données simulées (terminé)**

Objectif : définir un socle de données typé et cohérent avec le contrat backend, pour développer sans dépendre de l'API réelle.

**☑** Définition des interfaces TypeScript : User, Agent, Document, Message, LogInteraction, Autorisation

**☑** Alignement strict des valeurs de statut sur le contrat backend, sans accent (ex. statut_indexation, statut d'agent)

**☑** Définition du type des passages/sources citées : { texte, document, reference, score }

**☑** Création des données mockées couvrant les 21 pages (agents, documents, conversations, utilisateurs, logs)

**☑** Création des services mock (interface identique à celle prévue pour les futurs appels HTTP réels)

**_Livrable du sprint :_** _Modèles typés stricts, données simulées réalistes et alignées sur le contrat backend, prêtes à être consommées par les pages._

**Sprint 3 — Navigation, session et rôles simulés**

Objectif : mettre en place le squelette de navigation et la logique de rôles avant de construire les pages elles-mêmes.

**☑** Configuration des routes avec lazy-loading (zones chat et admin)

**☑** Implémentation des guards de protection de route par rôle

**☑** Redirection après connexion selon le rôle (collaborateur → /chat direct ; référent et administrateur → écran de choix)

**☑** Gestion temporaire d'une session/rôle simulé (en attendant le vrai JWT du Sprint 8)

**_Livrable du sprint :_** _Navigation fonctionnelle de bout en bout avec des rôles simulés, redirections conformes au tableau de routing du cahier des charges._

**Sprint 4 — Pages transverses**

Objectif : construire les pages communes à tous les rôles, prérequis pour tester le reste de l'application.

**☑** Page Connexion

**☑** Page Accès refusé (403)

**☑** Page introuvable (404)

**_Livrable du sprint :_** _Les 3 pages transverses fonctionnelles et fidèles aux maquettes._

**Sprint 5 — Zone conversation**

Objectif : construire l'expérience de conversation, commune aux trois rôles.

**☐** Sélection d'agent (liste simulée type GET /agents, lien vers Mes conversations)

**☐** Conversation : bulles de chat, streaming simulé token par token, carte source (document + reference)

**☐** Mes conversations : vue transversale tous agents, header neutre, filtre par agent

**☐** Profil / paramètres

**_Livrable du sprint :_** _Zone conversation complète et navigable avec des données simulées, fidèle aux maquettes corrigées._

**Sprint 6 — Gestion des agents (référent)**

Objectif : construire l'espace no-code du référent.

**☐** Liste des agents de la direction

**☐** Wizard de création en 5 étapes (nom & rôle, sources, utilisateurs, instructions & ton, récapitulatif & publication)

**☐** Détail / modification d'un agent

**☐** Gestion des documents (upload en une action, 4 statuts d'indexation)

**☐** Gestion des accès (autoriser/retirer un collaborateur)

**☐** Qualité / feedback (historique des réponses, signalement d'erreur)

**_Livrable du sprint :_** _Cycle de vie complet d'un agent géré par le référent, avec données simulées._

**Sprint 7 — Supervision (administrateur central)**

Objectif : construire l'espace de supervision globale de la plateforme.

**☐** Tableau de bord plateforme

**☐** Gestion des comptes et attribution des rôles

**☐** Sécurité & journalisation

**☐** Paramètres globaux (rétention des logs, formats de documents acceptés)

**_Livrable du sprint :_** _Espace de supervision complet et navigable avec données simulées._

**Sprint 8 — Intégration à l'API réelle**

Objectif : remplacer les données simulées par les vrais échanges avec le backend, une fois celui-ci disponible.

**☐** Remplacement des services mock par de vrais appels HTTP vers le service Backend (FastAPI, port 8000)

**☐** Implémentation de l'intercepteur JWT (ajout automatique du token, gestion de l'expiration)

**☐** Appel réel de GET /agents à chaque chargement de la sélection d'agent (jamais lu depuis le token)

**☐** Implémentation de la consommation du flux SSE réel pour les réponses de l'agent

**☐** Résolution des écarts de format avec Moussa (Backend) et Fabiana (RAG)

**_Livrable du sprint :_** _Application connectée au backend réel, sans donnée simulée restante._

**Sprint 9 — Vérification finale**

Objectif : valider l'ensemble avant la démonstration de fin de Phase 1.

**☐** Vérification des parcours complets pour les 3 rôles

**☐** Vérification de la fidélité aux maquettes

**☐** Vérification de l'affichage mobile et tablette

**☐** Vérification de la gestion des erreurs (401, 403, 404, 500)

**☐** Build de production et vérification finale

**_Livrable du sprint :_** _Frontend prêt pour la démonstration finale de la Phase 1._

# **2\. État d'avancement global**

| **Sprint**                                         | **Statut**         |
| -------------------------------------------------- | ------------------ |
| Sprint 0 — Cadrage, design et vérification croisée | \[x\] Terminé      |
| Sprint 1 — Fondations du projet Angular            | \[x\] Terminé      |
| Sprint 2 — Modèles et données simulées             | \[x\] Terminé      |
| Sprint 3 — Navigation, session et rôles simulés    | \[x\] Terminé      |
| Sprint 4 — Pages transverses                       | \[x\] Terminé      |
| Sprint 5 — Zone conversation                       | \[~\] En cours     |
| Sprint 6 — Gestion des agents (référent)           | \[ \] Non commencé |
| Sprint 7 — Supervision (administrateur central)    | \[ \] Non commencé |
| Sprint 8 — Intégration à l'API réelle              | \[ \] Non commencé |
| Sprint 9 — Vérification finale                     | \[ \] Non commencé |

_À mettre à jour au fur et à mesure : \[ \] Non commencé / \[~\] En cours / \[x\] Terminé._

_Document de suivi — Bloc Interfaces, NANA Marc — s'appuie sur le cahier des charges v2 et le document de structure Bloc Interfaces v2._
