import type { Agent } from '../../shared/models/agent.model';

export const AGENTS_MOCK: Agent[] = [
  {
    id: 'agent-rh',
    nom: 'Agent RH',
    description: 'Procédures, congés et avantages sociaux.',
    instructions:
      'Répondre avec clarté aux questions RH en s’appuyant uniquement sur les documents disponibles.',
    direction: 'RH',
    statut: 'publié',
  },
  {
    id: 'agent-it',
    nom: 'Agent IT',
    description: 'Assistance informatique, VPN et outils internes.',
    instructions:
      'Guider les collaborateurs sur les procédures et les outils informatiques internes.',
    direction: 'IT',
    statut: 'publié',
  },
  {
    id: 'agent-rh-brouillon',
    nom: 'Agent Recrutement',
    description: 'Informations sur le recrutement et l’intégration.',
    instructions: 'Répondre aux questions sur les procédures de recrutement.',
    direction: 'RH',
    statut: 'brouillon',
  },
  {
    id: 'agent-it-desactive',
    nom: 'Agent Sécurité IT',
    description: 'Règles de sécurité informatique.',
    instructions: 'Répondre uniquement à partir des politiques de sécurité validées.',
    direction: 'IT',
    statut: 'désactivé',
  },
];