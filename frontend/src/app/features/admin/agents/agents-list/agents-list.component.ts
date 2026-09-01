import { AsyncPipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, catchError, of, switchMap, forkJoin } from 'rxjs';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideArrowRight,
  LucideUsers,
  LucideMonitor,
  LucideBot,
  LucideLayoutGrid,
  LucideSettings2,
  LucideMessageSquare,
  LucideEye,
} from '@lucide/angular';

import type { Agent } from '../../../../shared/models/agent.model';
import { AgentService } from '../../../../core/services/agent.service';
import { DocumentService } from '../../../../core/services/document.service';
import { SessionService } from '../../../../core/auth/session.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

type AgentWithCount = Agent & { docCount: number };
type StatusFilter = 'tous' | 'publié' | 'brouillon' | 'désactivé';

@Component({
  selector: 'app-agents-list',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    RouterLink,
    LucideDynamicIcon,
    TitleCasePipe,
    HeaderComponent,
  ],
  templateUrl: './agents-list.component.html',
  styleUrl: './agents-list.component.scss',
})
export class AgentsListComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly documentService = inject(DocumentService);
  private readonly sessionService = inject(SessionService);

  private readonly statusFilter$ = new BehaviorSubject<StatusFilter>('tous');
  statusFilter: StatusFilter = 'tous';

  readonly currentUser = this.sessionService.getCurrentUser();
  readonly isAdmin = this.currentUser?.role === 'administrateur';
  readonly backUrl = this.isAdmin ? '/admin/supervision' : '/chat';
  readonly directionLabel = this.isAdmin
    ? 'Toutes les directions'
    : `Direction ${this.currentUser?.direction || 'Générale'}`;

  readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    { value: 'publié', label: 'Publiés' },
    { value: 'brouillon', label: 'Brouillons' },
    { value: 'désactivé', label: 'Désactivés' },
  ];

  readonly Plus = LucidePlus;
  readonly ArrowRight = LucideArrowRight;
  readonly Users = LucideUsers;
  readonly Monitor = LucideMonitor;
  readonly Bot = LucideBot;
  readonly LayoutGrid = LucideLayoutGrid;
  readonly Settings2 = LucideSettings2;
  readonly MessageSquare = LucideMessageSquare;
  readonly Eye = LucideEye;

  readonly agents$: Observable<AgentWithCount[]> = combineLatest([
    this.agentService.getAgents().pipe(catchError(() => of([]))),
    this.statusFilter$,
  ]).pipe(
    switchMap(([agents, statusFilter]) => {
      const userDir = this.currentUser?.direction?.trim().toLowerCase();
      const role = this.currentUser?.role?.trim().toLowerCase();
      const isCentralAdmin = role === 'administrateur' || role === 'admin';

      const filtered = agents.filter((agent) => {
        const agentDir = agent.direction?.trim().toLowerCase();
        const matchesDirection = isCentralAdmin || !userDir || agentDir === userDir;
        const matchesStatus = statusFilter === 'tous' || agent.statut === statusFilter;
        return matchesDirection && matchesStatus;
      });

      if (filtered.length === 0) return of([]);

      return forkJoin(
        filtered.map((agent) =>
          this.documentService.getDocuments(agent.id).pipe(
            map((docs) => ({ ...agent, docCount: docs.length })),
            catchError(() => of({ ...agent, docCount: 0 }))
          )
        )
      );
    }),
  );

  ngOnInit(): void {}

  setFilter(status: StatusFilter): void {
    this.statusFilter = status;
    this.statusFilter$.next(status);
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

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'publié':
      case 'actif':
        return 'badge--publie';
      case 'brouillon':
        return 'badge--brouillon';
      case 'désactivé':
      case 'inactif':
        return 'badge--desactive';
      default:
        return 'badge--brouillon';
    }
  }
}
