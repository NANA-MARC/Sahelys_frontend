export type UserRole = 'collaborateur' | 'referent' | 'administrateur_central';

export type Direction = 'RH' | 'IT' | 'Finance' | 'Commercial';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  direction: Direction;
  role: UserRole;
  actif: boolean;
}
