import { AsyncPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideArrowRight,
  LucideUsers,
  LucideMonitor,
  LucideBot,
  LucideLayoutGrid,
  LucideSettings2,
} from '@lucide/angular';

import type { Agent } from '../../../../shared/models/agent.model';
import type { AgentDocument } from '../../../../shared/models/document.model';
import { MockDataService } from '../../../../core/services/mock-data.service';
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
    NgFor,
    NgIf,
    RouterLink,
    LucideDynamicIcon,
    TitleCasePipe,
    HeaderComponent,
  ],
  templateUrl: './agents-list.component.html',
  styleUrl: './agents-list.component.scss',
})
export class AgentsListComponent implements OnInit {
  private readonly mockDataService = inject(MockDataService);
  private readonly sessionService = inject(SessionService);

  private readonly statusFilter$ = new BehaviorSubject<StatusFilter>('tous');
  statusFilter: StatusFilter = 'tous';

  readonly currentUser = this.sessionService.getCurrentUser();
  readonly directionLabel =
    this.currentUser?.direction === 'RH' ? 'Direction Ressources Humaines' : 'Direction Informatique';

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

  readonly agents$: Observable<AgentWithCount[]> = combineLatest([
    this.mockDataService.getAgents(),
    this.mockDataService.getDocuments(),
    this.statusFilter$,
  ]).pipe(
    map(([agents, documents, statusFilter]) => {
      const direction = this.currentUser?.direction;

      return agents
        .filter((agent) => {
          const matchesDirection = !direction || agent.direction === direction;
          const matchesStatus = statusFilter === 'tous' || agent.statut === statusFilter;
          return matchesDirection && matchesStatus;
        })
        .map((agent) => ({
          ...agent,
          docCount: (documents as AgentDocument[]).filter(
            (d) => d.agentId === agent.id && d.statutIndexation === 'indexe',
          ).length,
        }));
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
      case 'publié':     return 'badge--publie';
      case 'brouillon':  return 'badge--brouillon';
      case 'désactivé':  return 'badge--desactive';
      default:           return 'badge--brouillon';
    }
  }
}
