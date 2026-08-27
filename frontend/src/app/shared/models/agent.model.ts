import type { Direction } from './user.model';

export type AgentStatus = 'brouillon' | 'publié' | 'désactivé';

export interface Agent {
  id: string;
  nom: string;
  description: string;
  instructions: string;
  direction: Direction;
  statut: AgentStatus;
}
