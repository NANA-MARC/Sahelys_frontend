import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type {
  AuditLog,
  DirectionActivity,
  PlatformSettings,
  SupervisionKPIs,
} from '../../shared/models/supervision.model';

const DEFAULT_KPIS: SupervisionKPIs = {
  directionsActives: 3,
  agentsPublies: 5,
  utilisateursActifs: 142,
  alertesSecurite: 1,
};

const DEFAULT_ACTIVITIES: DirectionActivity[] = [
  { id: 'act-1', direction: 'RH', agentNom: 'Agent RH', statut: 'Actif', referentNom: 'Camille Lebrun', derniereActivite: '14 Mar 2026, 09:30' },
  { id: 'act-2', direction: 'IT', agentNom: 'Agent IT', statut: 'Actif', referentNom: 'Robert Dubois', derniereActivite: '14 Mar 2026, 10:15' },
  { id: 'act-3', direction: 'Finance', agentNom: 'Agent Finance', statut: 'Inactif', referentNom: 'Michel Durand', derniereActivite: '12 Mar 2026, 11:00' },
  { id: 'act-4', direction: 'Commercial', agentNom: 'Agent Commercial', statut: 'Actif', referentNom: 'Gaelle Moreau', derniereActivite: '14 Mar 2026, 14:00' },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', evenement: 'Connexion échouée', utilisateurNom: 'Camille Lebrun', utilisateurInitiales: 'CL', direction: 'RH', dateHeure: '14 Mar 2026, 09:30', niveau: 'alerte' },
  { id: 'log-2', evenement: 'Document supprimé', utilisateurNom: 'Robert Dubois', utilisateurInitiales: 'RD', direction: 'IT', dateHeure: '14 Mar 2026, 10:15', niveau: 'avertissement' },
  { id: 'log-3', evenement: 'Nouvel agent publié', utilisateurNom: 'Michel Durand', utilisateurInitiales: 'MD', direction: 'Finance', dateHeure: '12 Mar 2026, 11:00', niveau: 'information' },
  { id: 'log-4', evenement: 'Tentative d\'accès non autorisé', utilisateurNom: 'Gaelle Moreau', utilisateurInitiales: 'GM', direction: 'Commercial', dateHeure: '14 Mar 2026, 14:00', niveau: 'alerte' },
  { id: 'log-5', evenement: 'Mot de passe réinitialisé', utilisateurNom: 'Antoine Bernard', utilisateurInitiales: 'AB', direction: 'IT', dateHeure: '14 Mar 2026, 14:15', niveau: 'information' },
  { id: 'log-6', evenement: 'Configuration modifiée', utilisateurNom: 'Sophie Bernard', utilisateurInitiales: 'SB', direction: 'RH', dateHeure: '14 Mar 2026, 14:30', niveau: 'avertissement' },
];

const DEFAULT_SETTINGS: PlatformSettings = {
  acceptedFormats: {
    pdf: true,
    word: true,
    excel: false,
    powerpoint: false,
  },
  defaultPrivacy: 'Interne',
  logRetentionDays: 90,
  securityAlertsEnabled: true,
};

@Injectable({
  providedIn: 'root',
})
export class SupervisionService {
  private readonly _kpis$ = new BehaviorSubject<SupervisionKPIs>(DEFAULT_KPIS);
  private readonly _activities$ = new BehaviorSubject<DirectionActivity[]>(DEFAULT_ACTIVITIES);
  private readonly _auditLogs$ = new BehaviorSubject<AuditLog[]>(DEFAULT_AUDIT_LOGS);
  private readonly _settings = signal<PlatformSettings>(DEFAULT_SETTINGS);

  // --- Getters RxJS / Signals ---
  getKPIs(): Observable<SupervisionKPIs> {
    return this._kpis$.asObservable();
  }

  getActivities(): Observable<DirectionActivity[]> {
    return this._activities$.asObservable();
  }

  getAuditLogs(): Observable<AuditLog[]> {
    return this._auditLogs$.asObservable();
  }

  getSettings() {
    return this._settings;
  }

  // --- Actions ---
  updateSettings(newSettings: PlatformSettings): void {
    this._settings.set({ ...newSettings });
  }

  addAuditLog(log: Omit<AuditLog, 'id'>): void {
    const current = this._auditLogs$.getValue();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
    };
    this._auditLogs$.next([newLog, ...current]);
  }
}
