export type DocumentIndexationStatus =
  | 'en_attente'
  | 'en_cours'
  | 'indexe'
  | 'erreur';

export type DocumentConfidentialite = 'interne' | 'confidentiel';

export interface AgentDocument {
  id: string;
  agentId: string;
  nom: string;
  format: string;
  dateAjout: string;
  statutIndexation: DocumentIndexationStatus;
  confidentialite: DocumentConfidentialite;
}