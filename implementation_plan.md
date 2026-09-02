# Plan d'Implémentation — Intégration Frontend ↔ Backend (Sprint 8)

## Contexte & Objectif

L'objectif de cette étape est d'effectuer la transition complète du frontend Angular (actuellement basé sur `MockDataService`) vers l'API réellle FastAPI disponible à `http://192.168.11.177:8000`. 

Suite à nos échanges et aux retours positifs de **Moussa (Dev Backend)**, les choix techniques sont stabilisés :
1. **Login par Email** : Maintenu côté Backend ! Le formulaire de connexion Frontend n'a pas besoin de changer.
2. **Conversations** : Moussa ajoute la table `conversations` et les endpoints `GET /conversations`, `GET /conversations/{id}`, `DELETE /conversations/{id}`.
3. **Rôle Administrateur** : Renommé en `'administrateur'` dans les modèles et guards Frontend (au lieu de `'administrateur_central'`).
4. **Statuts des Agents** : Mapping binaire Backend (`'actif'` / `'inactif'`) vers l'affichage UI Frontend (`'publié'` / `'désactivé'`).
5. **Direction lors de la création d'Agent** : Préréglée et verrouillée avec la direction du Référent connecté.
6. **Création d'utilisateur Admin** : Ajout du champ "Mot de passe initial" dans le modal.

---

## User Review Required

> [!IMPORTANT]
> La migration se fera de façon **progressive et modulaire**. Les composants Angular continueront de fonctionner pendant les phases de développement. Chaque service HTTP sera testé et validé avant le retrait des mocks.

---

## Proposed Changes

### Phase 1 — Configuration Environnement & Client HTTP

#### [NEW] [environment.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/environments/environment.ts)
#### [NEW] [environment.prod.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/environments/environment.prod.ts)
- Définition de `apiUrl: 'http://192.168.11.177:8000'`.

---

### Phase 2 — Harmonisation des Modèles & Types TypeScript

#### [MODIFY] [user.model.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/shared/models/user.model.ts)
- Mettre à jour `UserRole`: `'collaborateur' | 'referent' | 'administrateur'` (remplacer `administrateur_central`).

#### [MODIFY] [agent.model.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/shared/models/agent.model.ts)
- Ajouter le support des types de statut backend `'actif' | 'inactif'` tout en conservant l'adaptation UI (`'publié'` / `'désactivé'`).

#### [NEW] [api.models.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/shared/models/api.models.ts)
- Définir les schémas stricts des DTOs du backend (format `snake_case`) pour le typage des réponses HTTP :
  - `TokenResponse`, `UserApiResponse`, `AgentApiResponse`, `DocumentApiResponse`, `ConversationApiResponse`, `DashboardStatsResponse`, `LogApiResponse`, `SystemSettingsSchema`.

---

### Phase 3 — Sécurité & Intercepteur HTTP JWT

#### [NEW] [auth.interceptor.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/interceptors/auth.interceptor.ts)
- Création de l'intercepteur fonctionnel HTTP Angular (`HttpInterceptorFn`).
- Injection automatique de l'en-tête `Authorization: Bearer <token>` sur chaque requête HTTP sortante.

#### [MODIFY] [app.config.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/app.config.ts)
- Déclarer `provideHttpClient(withInterceptors([authInterceptor]))`.

#### [MODIFY] [role.guard.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/guards/role.guard.ts)
- Mettre à jour la vérification des rôles pour supporter `'administrateur'`.

#### [MODIFY] [user-role-badge.component.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/features/admin/components/user-role-badge/user-role-badge.component.ts)
- Aligner les styles et libellés du badge de rôle sur `'administrateur'`.

---

### Phase 4 — Authentification Réelle (`SessionService` & `LoginComponent`)

#### [MODIFY] [session.service.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/auth/session.service.ts)
- Remplacer le mock par un véritable appel `HttpClient.post<TokenResponse>('/auth/login', { nom: email, mot_de_passe: password })`.
- Stocker le JWT dans un `Signal` et dans le `localStorage` (avec sécurisation SSR).
- Déduire automatiquement `nom`, `role`, et `direction` à partir de la réponse JWT.

#### [MODIFY] [login.component.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/features/auth/login/login.component.ts)
- Ajouter l'état de chargement (`isLoading` signal) et la gestion des messages d'erreur de connexion.

---

### Phase 5 — Couche de Services HTTP Réels

#### [NEW] [agent.service.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/services/agent.service.ts)
- Implémenter les méthodes HTTP vers `/agents` :
  - `getAgents()`, `getAgentById(id)`, `createAgent(payload)`, `updateAgent(id, payload)`, `deleteAgent(id)`.
  - Habilitations : `getAccess(agentId)`, `grantAccess(agentId, userId)`, `revokeAccess(agentId, userId)`.
  - Mapping automatique `snake_case` (backend) ↔ `camelCase` (frontend).

#### [NEW] [conversation.service.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/services/conversation.service.ts)
- Implémenter la gestion des fils de discussion (nouveaux endpoints de Moussa) :
  - `getConversations()`, `getConversationById(id)`, `deleteConversation(id)`.

#### [NEW] [document.service.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/services/document.service.ts)
- Implémenter la gestion des documents de la base RAG :
  - `getDocuments(agentId)`, `uploadDocument(agentId, file)` (multipart/form-data), `deleteDocument(docId)`.

#### [NEW] [admin.service.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/services/admin.service.ts)
- Implémenter les appels HTTP de l'espace administration :
  - Dashboard : `getDashboardStats()` (`GET /admin/system/dashboard`).
  - Utilisateurs : `getUsers()`, `createUser(payload)`, `updateUser(id, payload)`.
  - Supervision & Logs : `getLogs()` (`GET /admin/system/logs`), `signalInteraction(id, payload)` (`PATCH /interactions/{id}/signalement`).
  - Paramètres Système : `getSettings()`, `updateSettings(settings)` (`GET/PUT /admin/system/settings`).

---

### Phase 6 — Integration SSE (Streaming de réponses IA)

#### [NEW] [sse.service.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/core/services/sse.service.ts)
- Création d'un service utilitaire lisant le flux de réponses en temps réel (`POST /agents/{agent_id}/query`) via `fetch()` et `ReadableStream`.

#### [MODIFY] [conversation.component.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/features/chat/pages/conversation/conversation.component.ts)
- Remplacer la boucle `setInterval` simulée par l'abonnement au flux SSE en temps réel.
- Rattacher chaque question envoyée au `conversation_id` actif.

---

### Phase 7 — Ajustements UI & Formulaires

#### [MODIFY] [agent-create.component.ts](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/features/admin/agents/agent-create/agent-create.component.ts)
- Remplacer le sélecteur manuel de direction par la direction du profil utilisateur actuellement connecté (préréglée et verrouillée).

#### [MODIFY] [supervision.component.html](file:///home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend/src/app/features/admin/supervision/supervision.component.html)
- Ajouter le champ **"Mot de passe initial *"** dans le modal de création d'utilisateur.
- Connecter les 4 onglets (`Dashboard`, `Comptes`, `Sécurité/Logs`, `Paramètres`) aux données réelles venant d'`AdminService`.

---

## Verification Plan

### Tests de Build & Intégrité
```bash
cd /home/nana-marc/programmation/sahelys_stage/SahelysAgents/frontend
npm run build
```

### Tests d'Intégration Manuels
1. **Authentification** : Se connecter avec un compte réel (`Moussa KIENDREBEOGO` ou compte de test) -> Vérifier l'obtention du JWT.
2. **Consultation des Agents** : Vérifier l'affichage de la liste des agents issus du backend (`GET /agents`).
3. **Chat & Streaming SSE** : Interroger un agent et constater le streaming token par token de sa réponse.
4. **Administration & Supervision** :
   - Consulter le tableau de bord avec les vrais agrégats BDD.
   - Créer un compte utilisateur avec mot de passe initial.
   - Modifier et sauvegarder les paramètres système (rétention des logs & formats acceptés).
