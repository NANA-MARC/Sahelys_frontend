export interface SourcePassage {
  texte: string;
  document: string;
  reference: string;
  score: number;
}

export interface SourcesResponse {
  passages: SourcePassage[];
}

export type MessageAuteur = 'utilisateur' | 'agent';

export interface Message {
  id: string;
  conversationId: string;
  auteur: MessageAuteur;
  contenu: string;
  creeLe: string;
  sources?: SourcesResponse;
}
