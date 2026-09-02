export type AuditLogSeverity = 'alerte' | 'avertissement' | 'information';

export interface AuditLog {
  id: string;
  evenement: string;
  utilisateurNom: string;
  utilisateurInitiales: string;
  direction: string;
  dateHeure: string;
  niveau: AuditLogSeverity;
}

export interface PlatformSettings {
  acceptedFormats: {
    pdf: boolean;
    word: boolean;
    excel: boolean;
    powerpoint: boolean;
  };
  defaultPrivacy: 'Interne' | 'Confidentiel' | 'Public';
  logRetentionDays: number;
  securityAlertsEnabled: boolean;
}

export interface SupervisionKPIs {
  directionsActives: number;
  agentsPublies: number;
  utilisateursActifs: number;
  alertesSecurite: number;
}

export interface DirectionActivity {
  id: string;
  direction: string;
  agentNom: string;
  statut: 'Actif' | 'Inactif';
  referentNom: string;
  derniereActivite: string;
}
