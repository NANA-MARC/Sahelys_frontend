# 📡 Contrat API Backend — SahelysAgents
> **Base URL** : `http://192.168.11.177:8000`  
> **Version** : 1.0.0  
> **Auth** : `HTTPBearer` — Header `Authorization: Bearer <jwt_token>`  
> **OpenAPI** : `GET /openapi.json`

---

## 🔐 Authentification — `/auth`

### `POST /auth/login`
Connexion et obtention du JWT.

**Body :**
```json
{
  "nom": "Moussa KIENDREBEOGO",        // string, required
  "mot_de_passe": "MotDePasseRH2026!"  // string, required
}
```
> ⚠️ Le backend utilise `nom` (pas `email`) comme identifiant de connexion !

**Réponse 200 :**
```json
{
  "access_token": "eyJ...",   // string JWT
  "token_type": "bearer",     // default
  "role": "collaborateur",    // "collaborateur" | "referent" | "administrateur"
  "direction": "RH",          // string — direction de l'utilisateur
  "nom": "Marc NANA"          // string — nom d'affichage
}
```

---

### `GET /auth/me` 🔒
Retourne le profil de l'utilisateur connecté.

**Réponse 200 :**
```json
{
  "id": "uuid",
  "nom": "string",
  "direction": "string",
  "role": "string"
}
```

---

## 🤖 Agents & Habilitations — `/agents`

### `GET /agents` 🔒
Lister les agents accessibles à l'utilisateur connecté.
- **Admin** → tous les agents
- **Référent / Collaborateur** → agents de sa direction + autorisations nominatives

**Réponse 200 :** `AgentResponse[]`
```json
[{
  "id": "uuid",
  "nom": "string",
  "description": "string | null",
  "direction_proprietaire": "string",   // ⚠️ Différent de "direction" côté frontend
  "system_prompt": "string",
  "statut": "string",                   // "actif" | "inactif" — ⚠️ Différent de "publié" côté frontend
  "date_creation": "datetime"
}]
```

---

### `POST /agents` 🔒
Créer un nouvel agent (référent ou admin uniquement).

**Body (`AgentCreate`) :**
```json
{
  "nom": "Agent RH - Congés",             // string, required, 3-255 chars
  "description": "string | null",         // optional
  "system_prompt": "Tu es l'agent..."     // string, required, min 10 chars
}
```
> ⚠️ Pas de champ `direction` dans le body — la direction est déduite du JWT du référent connecté !

**Réponse 201 :** `AgentResponse`

---

### `GET /agents/{agent_id}` 🔒
Consulter le détail d'un agent.
- **Path param** : `agent_id` (UUID)
- **Réponse 200** : `AgentResponse`

---

### `PUT /agents/{agent_id}` 🔒
Mettre à jour un agent (référent de la direction ou admin).

**Body (`AgentUpdate`) — tous champs optionnels :**
```json
{
  "nom": "string | null",
  "description": "string | null",
  "system_prompt": "string | null",
  "statut": "string | null"    // "actif" | "inactif"
}
```
**Réponse 200** : `AgentResponse`

---

### `DELETE /agents/{agent_id}` 🔒
Supprimer ou désactiver un agent.
- **Réponse 204** : No content

---

### `GET /agents/{agent_id}/access` 🔒
Lister les autorisations nominatives d'un agent.

**Réponse 200 :** `AccessGrantResponse[]`
```json
[{
  "id": "uuid",
  "utilisateur_id": "uuid",
  "agent_id": "uuid",
  "date_attribution": "datetime"
}]
```

---

### `POST /agents/{agent_id}/access` 🔒
Accorder un accès nominatif à un utilisateur.

**Body (`AccessGrantRequest`) :**
```json
{
  "utilisateur_id": "uuid"    // required
}
```
**Réponse 201** : `AccessGrantResponse`

---

### `DELETE /agents/{agent_id}/access/{utilisateur_id}` 🔒
Révoquer une autorisation nominative.
- **Réponse 204** : No content

---

### `POST /agents/{agent_id}/query` 🔒 ⭐ STREAMING SSE
Interroger un agent en streaming (réponse token par token).

**Body (`QueryRequest`) :**
```json
{
  "question": "Quelle est la procédure pour demander des congés ?"   // string, required, min 1 char
}
```
**Réponse 200** : Stream SSE (text/event-stream)
> La réponse est streamée — utiliser `EventSource` ou la consommation SSE côté frontend.

---

## 📄 Documents & RAG — `/agents/{agent_id}/documents`

### `POST /agents/{agent_id}/documents` 🔒
Téléverser un document (PDF, DOCX, TXT) pour la base RAG.

**Body** : `multipart/form-data`
```
file: <binary file>
```
**Réponse 201 :** `DocumentResponse`
```json
{
  "id": "uuid",
  "agent_id": "uuid",
  "nom_fichier": "string",           // ⚠️ "nom_fichier" pas "nom"
  "chemin_fichier": "string",
  "taille_octets": 12345,
  "statut_indexation": "string",     // "en_attente" | "en_cours" | "indexe" | "erreur"
  "actif": true,
  "niveau_confidentialite": "standard",
  "date_upload": "datetime"
}
```

---

### `GET /agents/{agent_id}/documents` 🔒
Lister les documents d'un agent.

**Réponse 200** : `DocumentResponse[]`

---

### `DELETE /documents/{document_id}` 🔒
Supprimer un document (disque + BDD + moteur RAG).
- **Réponse 204** : No content

---

## 🛡️ Administration Centralisée — `/admin/system`

### `GET /admin/system/dashboard` 🔒
Tableau de bord agrégé système (admin uniquement).

**Réponse 200 :**
```json
{
  "total_utilisateurs": 142,
  "total_agents": 5,
  "total_documents": 47,
  "total_interactions": 312,
  "interactions_signalees": 7
}
```

---

### `GET /admin/system/users` 🔒
Lister tous les comptes utilisateurs (admin uniquement).

**Réponse 200** : `UserResponse[]`
```json
[{
  "id": "uuid",
  "nom": "string",
  "direction": "string",
  "role": "string"
}]
```
> ⚠️ `UserResponse` retourne seulement 4 champs — pas de `prenom`, `email`, `actif` !

---

### `POST /admin/system/users` 🔒
Créer un compte utilisateur.

**Body (`UserCreate`) :**
```json
{
  "email": "marc@sahelys.com",       // string email, required
  "mot_de_passe": "Password123",     // string, min 6 chars, required
  "nom": "NANA",                     // required
  "prenom": "Marc",                  // required
  "direction": "IT",                 // required
  "role": "collaborateur"            // default: "collaborateur"
}
```
**Réponse 201** : `UserResponse`

---

### `PUT /admin/system/users/{user_id}` 🔒
Modifier un compte utilisateur.

**Body (`UserUpdate`) — tous optionnels :**
```json
{
  "email": "string | null",
  "nom": "string | null",
  "prenom": "string | null",
  "direction": "string | null",
  "role": "string | null"
}
```
**Réponse 200** : `UserResponse`

---

### `GET /admin/system/logs` 🔒
Lister tous les journaux d'interactions (toutes directions).

**Réponse 200** : `LogResponse[]`
```json
[{
  "id": "uuid",
  "utilisateur_id": "uuid",
  "agent_id": "uuid",
  "question": "string",
  "reponse": "string",
  "sources_citees": "string | null",
  "signale": false,
  "commentaire_signalement": "string | null",
  "date_heure": "datetime"
}]
```

---

### `GET /admin/system/settings` 🔒
Consulter les paramètres système.

**Réponse 200 :**
```json
{
  "duree_retention_logs": 90,                       // integer, default 90 jours
  "formats_documents_acceptes": ["pdf", "docx", "txt"]  // string[]
}
```

---

### `PUT /admin/system/settings` 🔒
Mettre à jour les paramètres système.

**Body** : même schéma que la réponse GET.

---

## 🚨 Signalements — Qualité

### `PUT /logs/{interaction_id}/signalement` 🔒
### `PATCH /interactions/{interaction_id}/signalement` 🔒
*(Deux routes identiques — doublon apparent dans l'API)*

Signaler une réponse incorrecte ou ambiguë.

**Body (`LogSignalementRequest`) :**
```json
{
  "signale": true,                                    // default: true
  "commentaire_signalement": "Réponse hors sujet"   // string, min 3 chars, required
}
```
**Réponse 200** : `LogResponse`

---

## 🏥 Utilitaires

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Non | Endpoint d'accueil |
| `GET` | `/health` | Non | Health check du service |

---

## ⚠️ Écarts critiques Frontend ↔ Backend

Ces différences sont à corriger impérativement lors du Sprint 8 (intégration API) :

| # | Sujet | Frontend (mock actuel) | Backend (API réelle) |
|---|---|---|---|
| E1 | **Login** | Champ `email` | Champ **`nom`** (nom complet) |
| E2 | **Statut d'agent** | `'publié'` / `'désactivé'` / `'brouillon'` | **`'actif'`** / **`'inactif'`** |
| E3 | **Direction d'agent** | Champ `direction` dans le body de création | **Déduit automatiquement** du JWT |
| E4 | **Nom fichier doc** | `nom` | **`nom_fichier`** |
| E5 | **Confidentialité doc** | `'interne'` / `'confidentiel'` | **`'standard'`** (valeur par défaut) |
| E6 | **UserResponse** | `id, nom, prenom, email, direction, role, actif` | Seulement `id, nom, direction, role` |
| E7 | **Streaming** | `setInterval` simulé | **SSE réel** (Server-Sent Events) |
| E8 | **Autorisations** | `id, agentId, utilisateurId, dateAttribution` | `id, agent_id, utilisateur_id, date_attribution` (snake_case) |
| E9 | **Logs/interactions** | `AuditLog` custom (supervision) | `LogResponse` avec `question`, `reponse`, `sources_citees` |
| E10 | **Dashboard** | KPIs hardcodés dans `SupervisionService` | **Endpoint dédié** `GET /admin/system/dashboard` |

---

## 🗺️ Mapping Frontend Services → Endpoints API

```
SessionService.login()           → POST  /auth/login
SessionService.getCurrentUser()  → GET   /auth/me

MockDataService.getAgents()      → GET   /agents
MockDataService.getAgentById()   → GET   /agents/{agent_id}
MockDataService.createAgent()    → POST  /agents
MockDataService.updateAgent()    → PUT   /agents/{agent_id}
[manquant]                       → DELETE /agents/{agent_id}

MockDataService.getDocuments()   → GET   /agents/{agent_id}/documents
MockDataService.addDocument()    → POST  /agents/{agent_id}/documents (multipart)
MockDataService.deleteDocument() → DELETE /documents/{document_id}

MockDataService.getAutorisations()  → GET    /agents/{agent_id}/access
MockDataService.addAutorisation()   → POST   /agents/{agent_id}/access
MockDataService.removeAutorisation()→ DELETE /agents/{agent_id}/access/{utilisateur_id}

[manquant]                          → POST  /agents/{agent_id}/query (SSE streaming)

SupervisionService (KPIs, Logs)     → GET /admin/system/dashboard
MockDataService.getUsers()          → GET /admin/system/users
[manquant]                          → POST /admin/system/users
[manquant]                          → PUT  /admin/system/users/{user_id}
[manquant]                          → GET  /admin/system/logs
[manquant]                          → GET  /admin/system/settings
[manquant]                          → PUT  /admin/system/settings
```

---

*Extrait le 27 août 2026 depuis http://192.168.11.177:8000/openapi.json*
