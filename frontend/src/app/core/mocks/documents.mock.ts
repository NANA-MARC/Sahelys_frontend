import type { AgentDocument } from '../../shared/models/document.model';

export const DOCUMENTS_MOCK: AgentDocument[] = [
  {
    id: 'document-001',
    agentId: 'agent-rh',
    nom: 'Politique_Conges_2026.pdf',
    format: 'pdf',
    dateAjout: '2026-05-14',
    statutIndexation: 'en_attente',
    confidentialite: 'interne',
  },
  {
    id: 'document-002',
    agentId: 'agent-rh',
    nom: 'Guide_Avantages_Sociaux.docx',
    format: 'docx',
    dateAjout: '2026-05-14',
    statutIndexation: 'en_cours',
    confidentialite: 'confidentiel',
  },
  {
    id: 'document-003',
    agentId: 'agent-rh',
    nom: 'Code_Ethique_v3.pdf',
    format: 'pdf',
    dateAjout: '2026-05-10',
    statutIndexation: 'indexe',
    confidentialite: 'interne',
  },
  {
    id: 'document-004',
    agentId: 'agent-rh',
    nom: 'Manuel_Employe_Securite.pdf',
    format: 'pdf',
    dateAjout: '2026-05-02',
    statutIndexation: 'erreur',
    confidentialite: 'interne',
  },
];
