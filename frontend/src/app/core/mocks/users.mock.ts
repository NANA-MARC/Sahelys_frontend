import type { User } from '../../shared/models/user.model';

export const USERS_MOCK: User[] = [
  {
    id: 'user-001',
    nom: 'Kaboré',
    prenom: 'Awa',
    email: 'awa.kabore@sahelys.local',
    direction: 'RH',
    role: 'collaborateur',
    actif: true,
  },
  {
    id: 'user-002',
    nom: 'Lebrun',
    prenom: 'Camille',
    email: 'camille.lebrun@sahelys.local',
    direction: 'RH',
    role: 'referent',
    actif: true,
  },
  {
    id: 'user-003',
    nom: 'Ouédraogo',
    prenom: 'Ibrahim',
    email: 'ibrahim.ouedraogo@sahelys.local',
    direction: 'IT',
    role: 'collaborateur',
    actif: true,
  },
  {
    id: 'user-004',
    nom: 'Diallo',
    prenom: 'Moussa',
    email: 'moussa.diallo@sahelys.local',
    direction: 'IT',
    role: 'administrateur_central',
    actif: true,
  },
];
