import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, switchMap, catchError, of } from 'rxjs';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
  LucideEye,
  LucideFlag,
  LucideUsers,
  LucideMonitor,
  LucideBot,
  LucideCheck,
  LucideFileText,
  LucideArrowLeft,
} from '@lucide/angular';

import type { Agent } from '../../../../shared/models/agent.model';
import type { AgentDocument } from '../../../../shared/models/document.model';
import type { User, Direction } from '../../../../shared/models/user.model';
import type { AccessGrantResponse } from '../../../../shared/models/api.models';
import { AgentService } from '../../../../core/services/agent.service';
import { DocumentService } from '../../../../core/services/document.service';
import { AdminService } from '../../../../core/services/admin.service';
import { SessionService } from '../../../../core/auth/session.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

type TabId = 'general' | 'documents' | 'acces' | 'qualite';

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgClass,
    NgFor,
    NgIf,
    RouterLink,
    TitleCasePipe,
    LucideDynamicIcon,
    HeaderComponent,
  ],
  templateUrl: './agent-detail.component.html',
  styleUrl: './agent-detail.component.scss',
})
export class AgentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agentService = inject(AgentService);
  private readonly documentService = inject(DocumentService);
  private readonly adminService = inject(AdminService);
  private readonly sessionService = inject(SessionService);

  readonly activeTab$ = new BehaviorSubject<TabId>('general');
  activeTab: TabId = 'general';

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'general', label: 'Général' },
    { id: 'documents', label: 'Documents' },
    { id: 'acces', label: 'Accès' },
    { id: 'qualite', label: 'Qualité' },
  ];

  docSearch = '';
  private readonly docSearch$ = new BehaviorSubject<string>('');

  userSearch = '';
  private readonly userSearch$ = new BehaviorSubject<string>('');

  accesGlobal = false;

  private readonly refreshAgent$ = new BehaviorSubject<void>(undefined);
  private readonly refreshDocs$ = new BehaviorSubject<void>(undefined);
  private readonly refreshAccess$ = new BehaviorSubject<void>(undefined);

  private readonly agentId$ = this.route.paramMap.pipe(map((p) => p.get('id') ?? ''));

  readonly quality$: Observable<{
    questionsCount: number;
    satisfaction: number;
    signalees: number;
    feedbacks: { initiale: string; question: string; reponse: string; date: string; statut: string }[];
  }> = combineLatest([
    this.agentId$,
    this.adminService.getLogs().pipe(catchError(() => of([]))),
  ]).pipe(
    map(([agentId, logs]) => {
      const agentLogs = logs.filter((l) => !l.agent_id || l.agent_id === agentId);
      const total = agentLogs.length;
      const signalees = agentLogs.filter((l) => l.signale).length;
      const satisfaction = total > 0 ? Math.round(((total - signalees) / total) * 100) : 100;

      const feedbacks = agentLogs.map((log) => ({
        initiale: log.utilisateur_id ? log.utilisateur_id.slice(0, 2).toUpperCase() : 'US',
        question: log.question || 'Question posée à l\'agent',
        reponse: log.reponse || 'Réponse de l\'agent',
        date: new Date(log.date_heure).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        statut: log.signale ? 'Signalée' : 'Validée',
      }));

      return {
        questionsCount: total,
        satisfaction,
        signalees,
        feedbacks,
      };
    })
  );

  readonly Plus = LucidePlus;
  readonly Search = LucideSearch;
  readonly Trash2 = LucideTrash2;
  readonly Eye = LucideEye;
  readonly Flag = LucideFlag;
  readonly Users = LucideUsers;
  readonly Monitor = LucideMonitor;
  readonly Bot = LucideBot;
  readonly Check = LucideCheck;
  readonly FileText = LucideFileText;
  readonly ArrowLeft = LucideArrowLeft;

  readonly currentUser = this.sessionService.getCurrentUser();
  readonly isCentralAdmin = this.currentUser?.role === 'administrateur';

  readonly directions: { value: Direction; label: string }[] = [
    { value: 'RH', label: 'Ressources Humaines' },
    { value: 'IT', label: 'Informatique & SI' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Commercial', label: 'Commercial' },
  ];

  editForm = {
    nom: '',
    description: '',
    direction: 'RH' as Direction,
    instructions: '',
    statut: 'publié' as Agent['statut'],
  };

  isSaving = false;
  saveSuccessMessage: string | null = null;
  saveErrorMessage: string | null = null;

  readonly agent$: Observable<Agent | undefined> = combineLatest([
    this.agentId$,
    this.refreshAgent$,
  ]).pipe(
    switchMap(([id]) =>
      this.agentService.getAgentById(id).pipe(
        map((agent) => {
          if (agent) {
            this.editForm = {
              nom: agent.nom,
              description: agent.description,
              direction: agent.direction,
              instructions: agent.instructions,
              statut: agent.statut,
            };
          }
          return agent;
        }),
        catchError(() => of(undefined))
      )
    )
  );

  readonly documents$: Observable<AgentDocument[]> = combineLatest([
    this.agentId$,
    this.refreshDocs$,
    this.docSearch$,
  ]).pipe(
    switchMap(([id, _, search]) =>
      this.documentService.getDocuments(id).pipe(
        map((docs) =>
          search.trim()
            ? docs.filter((d) => d.nom.toLowerCase().includes(search.toLowerCase()))
            : docs
        ),
        catchError(() => of([]))
      )
    )
  );

  readonly autorisations$: Observable<AccessGrantResponse[]> = combineLatest([
    this.agentId$,
    this.refreshAccess$,
  ]).pipe(
    switchMap(([id]) => this.agentService.getAccessList(id).pipe(
      catchError(() => of([]))
    ))
  );

  /** true si les utilisateurs de direction sont accessibles (admin), false pour référent */
  canManageUsers = false;

  /**
   * Observable combiné : pour l'admin → tous les utilisateurs de la direction avec toggle.
   * Pour le référent (getUsers() retourne []) → uniquement les utilisateurs déjà habilités.
   */
  readonly resolvedUsers$: Observable<{
    id: string;
    prenom: string;
    nom: string;
    direction: string;
    isAuthorized: boolean;
    initials: string;
  }[]> = combineLatest([
    this.adminService.getUsers().pipe(catchError(() => of([]))),
    this.autorisations$,
    this.userSearch$,
    this.agent$,
  ]).pipe(
    map(([users, autorisations, search, agent]) => {
      const currentUser = this.sessionService.getCurrentUser();
      const isCentralAdmin = currentUser?.role === 'administrateur';
      const dirFilter = isCentralAdmin ? agent?.direction : currentUser?.direction;

      if (users.length > 0) {
        // Admin ou référent avec accès complet — filtrer par direction
        this.canManageUsers = true;
        let filtered = users;
        if (dirFilter) {
          const targetDir = dirFilter.trim().toLowerCase();
          filtered = users.filter(
            (u) => u.direction && u.direction.trim().toLowerCase() === targetDir
          );
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (u) => u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q)
          );
        }
        return filtered.map((u) => ({
          id: u.id,
          prenom: u.prenom ?? '',
          nom: u.nom,
          direction: u.direction ?? '',
          isAuthorized: autorisations.some((a) => a.utilisateur_id === u.id),
          initials: `${(u.prenom?.[0] ?? u.nom[0] ?? '?')}${u.nom[0] ?? ''}`.toUpperCase(),
        }));
      } else {
        // Référent sans accès à /admin/system/users — afficher uniquement les habilités
        this.canManageUsers = false;
        let filtered = autorisations;
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = autorisations.filter((a) =>
            a.utilisateur_id.toLowerCase().includes(q)
          );
        }
        return filtered.map((a) => ({
          id: a.utilisateur_id,
          prenom: '',
          nom: `Collaborateur`,
          direction: '',
          isAuthorized: true,
          initials: a.utilisateur_id.slice(0, 2).toUpperCase(),
        }));
      }
    })
  );

  ngOnInit(): void {}

  setTab(tab: TabId): void {
    this.activeTab = tab;
    this.activeTab$.next(tab);
  }

  updateDocSearch(value: string): void {
    this.docSearch = value;
    this.docSearch$.next(value);
  }

  updateUserSearch(value: string): void {
    this.userSearch = value;
    this.userSearch$.next(value);
  }

  getIconForAgent(agentId: string) {
    if (agentId.includes('rh')) return this.Users;
    if (agentId.includes('it')) return this.Monitor;
    return this.Bot;
  }

  getIconClass(agentId: string): string {
    if (agentId.includes('rh')) return 'icon-rh';
    if (agentId.includes('it')) return 'icon-it';
    return '';
  }

  deleteDocument(docId: string): void {
    this.documentService.deleteDocument(docId).subscribe(() => {
      this.refreshDocs$.next();
    });
  }

  isUserAuthorized(userId: string, autorisations: AccessGrantResponse[]): boolean {
    return autorisations.some((a) => a.utilisateur_id === userId);
  }

  toggleUserAccess(userId: string, agentId: string, autorisations: AccessGrantResponse[]): void {
    if (this.isUserAuthorized(userId, autorisations)) {
      this.agentService.revokeAccess(agentId, userId).subscribe(() => {
        this.refreshAccess$.next();
      });
    } else {
      this.agentService.grantAccess(agentId, userId).subscribe(() => {
        this.refreshAccess$.next();
      });
    }
  }

  onFileSelected(event: Event, agentId: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const files = Array.from(input.files);
    let uploadedCount = 0;
    
    files.forEach((file) => {
      this.documentService.uploadDocument(agentId, file).subscribe({
        next: () => {
          uploadedCount++;
          if (uploadedCount === files.length) {
            this.refreshDocs$.next();
          }
        },
        error: (err) => {
          console.error('Erreur téléversement document:', err);
        }
      });
    });
    input.value = '';
  }

  updateAgentStatut(agent: Agent, statut: Agent['statut']): void {
    this.agentService.updateAgent(agent.id, { statut }).subscribe(() => {
      this.refreshAgent$.next();
    });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'publié':
      case 'actif':
        return 'status--publie';
      case 'brouillon':
        return 'status--brouillon';
      case 'désactivé':
      case 'inactif':
        return 'status--desactive';
      default:
        return 'status--brouillon';
    }
  }

  saveAgentInfo(agentId: string): void {
    if (!this.editForm.nom.trim() || this.isSaving) return;

    this.isSaving = true;
    this.saveSuccessMessage = null;
    this.saveErrorMessage = null;

    const payload: Partial<Agent> = {
      nom: this.editForm.nom.trim(),
      description: this.editForm.description.trim(),
      instructions: this.editForm.instructions.trim(),
      statut: this.editForm.statut,
    };

    // La direction ne peut être mise à jour que par un Administrateur Central
    if (this.isCentralAdmin && this.editForm.direction) {
      payload.direction = this.editForm.direction;
    }

    this.agentService.updateAgent(agentId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccessMessage = 'Informations de l\'agent enregistrées avec succès !';
        this.refreshAgent$.next();
        setTimeout(() => (this.saveSuccessMessage = null), 4000);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveErrorMessage = err.message || 'Erreur lors de la mise à jour de l\'agent.';
        setTimeout(() => (this.saveErrorMessage = null), 4000);
      },
    });
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/agents');
  }
}
