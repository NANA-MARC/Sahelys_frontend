/**
 * DTOs (Data Transfer Objects) reflétant la structure exacte des réponses de l'API Backend FastAPI.
 * Les clés sont en snake_case conformément au contrat OpenAPI.
 */

// --- Auth ---
export interface LoginRequest {
  nom: string;
  mot_de_passe: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  direction: string;
  nom: string;
}

// --- Users ---
export interface UserApiResponse {
  id: string;
  nom: string;
  prenom?: string | null;
  email?: string | null;
  direction: string;
  role: string;
}

export interface UserCreatePayload {
  email: string;
  mot_de_passe: string;
  nom: string;
  prenom: string;
  direction: string;
  role?: string;
}

export interface UserUpdatePayload {
  email?: string | null;
  nom?: string | null;
  prenom?: string | null;
  direction?: string | null;
  role?: string | null;
}

// --- Agents ---
export interface AgentApiResponse {
  id: string;
  nom: string;
  description: string | null;
  direction_proprietaire: string;
  system_prompt: string;
  statut: string;
  date_creation: string;
}

export interface AgentCreatePayload {
  nom: string;
  description?: string;
  system_prompt: string;
}

export interface AgentUpdatePayload {
  nom?: string | null;
  description?: string | null;
  system_prompt?: string | null;
  statut?: string | null;
}

// --- Habilitations d'Accès ---
export interface AccessGrantRequest {
  utilisateur_id: string;
}

export interface AccessGrantResponse {
  id: string;
  utilisateur_id: string;
  agent_id: string;
  date_attribution: string;
}

// --- Documents (RAG) ---
export interface DocumentApiResponse {
  id: string;
  agent_id: string;
  nom: string;
  nom_fichier?: string;
  chemin_fichier: string;
  taille_octets?: number;
  statut_indexation: string;
  actif: boolean;
  niveau_confidentialite: string;
  date_ajout?: string;
  date_upload?: string;
}

// --- Conversations ---
export interface ConversationApiResponse {
  id: string;
  utilisateur_id: string;
  agent_id: string;
  titre: string;
  date_creation: string;
  date_mise_a_jour: string;
}

export interface MessageApiResponse {
  id: string;
  conversation_id: string;
  auteur: string;
  contenu: string;
  date_heure: string;
  sources_citees?: string | null;
}

export interface QueryRequest {
  question: string;
  conversation_id?: string;
}

// --- Administration Centralisée ---
export interface DashboardStatsResponse {
  total_utilisateurs: number;
  total_agents: number;
  total_documents: number;
  total_interactions: number;
  interactions_signalees: number;
}

export interface LogApiResponse {
  id: string;
  utilisateur_id: string;
  agent_id: string;
  question: string;
  reponse: string;
  sources_citees: string | null;
  signale: boolean;
  commentaire_signalement: string | null;
  date_heure: string;
}

export interface LogSignalementRequest {
  signale?: boolean;
  commentaire_signalement: string;
}

export interface SystemSettingsSchema {
  duree_retention_logs: number;
  formats_documents_acceptes: string[];
}
