import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of } from 'rxjs';

import type {
  AuditLog,
  DirectionActivity,
  PlatformSettings,
  SupervisionKPIs,
} from '../../shared/models/supervision.model';
import { AdminService } from './admin.service';
import { AgentService } from './agent.service';

const DEFAULT_KPIS: SupervisionKPIs = {
  directionsActives: 3,
  agentsPublies: 5,
  utilisateursActifs: 142,
  alertesSecurite: 1,
};

const DEFAULT_ACTIVITIES: DirectionActivity[] = [
  { id: 'act-1', direction: 'RH', agentNom: 'Agent RH', statut: 'Actif', referentNom: 'Camille Lebrun', derniereActivite: 'Aujourd\'hui' },
  { id: 'act-2', direction: 'IT', agentNom: 'Agent IT', statut: 'Actif', referentNom: 'Robert Dubois', derniereActivite: 'Aujourd\'hui' },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [];

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
  private readonly adminService = inject(AdminService);
  private readonly agentService = inject(AgentService);

  private readonly _kpis$ = new BehaviorSubject<SupervisionKPIs>(DEFAULT_KPIS);
  private readonly _activities$ = new BehaviorSubject<DirectionActivity[]>(DEFAULT_ACTIVITIES);
  private readonly _auditLogs$ = new BehaviorSubject<AuditLog[]>(DEFAULT_AUDIT_LOGS);
  private readonly _settings = signal<PlatformSettings>(DEFAULT_SETTINGS);

  /**
   * Récupère les agrégats de KPIs réels depuis le backend FastAPI
   */
  getKPIs(): Observable<SupervisionKPIs> {
    return this.adminService.getDashboardStats().pipe(
      map((stats) => ({
        utilisateursActifs: stats.total_utilisateurs,
        agentsPublies: stats.total_agents,
        directionsActives: stats.total_documents,
        alertesSecurite: stats.interactions_signalees,
      })),
      catchError(() => this._kpis$.asObservable())
    );
  }

  /**
   * Génère les activités de direction dynamiquement à partir des agents et utilisateurs réels
   */
  getActivities(): Observable<DirectionActivity[]> {
    return combineLatest([
      this.adminService.getUsers().pipe(catchError(() => of([]))),
      this.agentService.getAgents().pipe(catchError(() => of([]))),
    ]).pipe(
      map(([users, agents]) => {
        if (agents.length === 0) return DEFAULT_ACTIVITIES;
        return agents.map((agent) => {
          const referent = users.find(
            (u) => u.role === 'referent' && u.direction === agent.direction
          );
          return {
            id: `act-${agent.id}`,
            direction: agent.direction || 'RH',
            agentNom: agent.nom,
            statut: agent.statut === 'publié' ? 'Actif' : 'Inactif',
            referentNom: referent ? `${referent.prenom} ${referent.nom}` : 'Référent Direction',
            derniereActivite: 'Actif',
          };
        });
      })
    );
  }

  /**
   * Récupère les logs d'interactions réels depuis le backend FastAPI
   */
  getAuditLogs(): Observable<AuditLog[]> {
    return this.adminService.getLogs().pipe(
      map((logs) =>
        logs.map((log): AuditLog => ({
          id: log.id,
          evenement: log.question || 'Interaction avec agent',
          utilisateurNom: `Utilisateur ${log.utilisateur_id ? log.utilisateur_id.slice(0, 8) : 'Anonyme'}`,
          utilisateurInitiales: 'U',
          direction: 'Générale',
          dateHeure: new Date(log.date_heure).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          niveau: log.signale ? 'alerte' : 'information',
        }))
      ),
      catchError(() => this._auditLogs$.asObservable())
    );
  }

  getSettings() {
    return this._settings;
  }

  // --- Actions ---
  updateSettings(newSettings: PlatformSettings): void {
    this._settings.set({ ...newSettings });
    this.adminService.updateSettings({
      duree_retention_logs: newSettings.logRetentionDays,
      formats_documents_acceptes: Object.keys(newSettings.acceptedFormats).filter(
        (k) => newSettings.acceptedFormats[k as keyof typeof newSettings.acceptedFormats]
      ),
    }).subscribe({
      error: (err) => console.warn('Impossible de synchroniser les paramètres au serveur:', err)
    });
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
