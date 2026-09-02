import type { Message } from './message.model';

export interface Conversation {
  id: string;
  utilisateurId: string;
  agentId: string;
  titre: string;
  creeLe: string;
  misAJourLe: string;
  messages: Message[];
}
