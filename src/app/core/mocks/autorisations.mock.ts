import type { Autorisation } from '../../shared/models/autorisation.model';

export const AUTORISATIONS_MOCK: Autorisation[] = [
  {
    id: 'auth-001',
    agentId: 'agent-rh',
    utilisateurId: 'user-001',
    dateAttribution: '2026-05-01',
  },
  {
    id: 'auth-002',
    agentId: 'agent-rh',
    utilisateurId: 'user-003',
    dateAttribution: '2026-05-10',
  },
  {
    id: 'auth-003',
    agentId: 'agent-it',
    utilisateurId: 'user-001',
    dateAttribution: '2026-05-15',
  },
  {
    id: 'auth-004',
    agentId: 'agent-it',
    utilisateurId: 'user-003',
    dateAttribution: '2026-05-15',
  },
];
