import { AsyncPipe, DatePipe, NgFor, NgIf, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { LucideDynamicIcon, LucideSearch, LucideBot, LucideUsers, LucideMonitor, LucideChevronRight } from '@lucide/angular';

import { MockDataService } from '../../../../core/services/mock-data.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgFor,
    NgIf,
    NgClass,
    RouterLink,
    LucideDynamicIcon,
    HeaderComponent,
  ],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.scss',
})
export class ConversationsComponent {
  private readonly mockDataService = inject(MockDataService);
  readonly filterOptions$ = this.mockDataService.getAgents();

  private readonly allConversations$ = combineLatest([
    this.mockDataService.getConversations(),
    this.mockDataService.getAgents(),
  ]).pipe(
    map(([conversations, agents]) =>
      conversations.map((conversation) => ({
        conversation,
        agent: agents.find((agent) => agent.id === conversation.agentId),
      })),
    ),
  );

  private readonly selectedAgentId$ = new BehaviorSubject('');
  private readonly searchTerm$ = new BehaviorSubject('');
  selectedAgentId = '';
  searchTerm = '';

  readonly Search = LucideSearch;
  readonly Bot = LucideBot;
  readonly Users = LucideUsers;
  readonly Monitor = LucideMonitor;
  readonly ChevronRight = LucideChevronRight;

  getIconForAgent(agentId: string | undefined) {
    switch (agentId) {
      case 'agent-rh':
        return this.Users;
      case 'agent-it':
        return this.Monitor;
      default:
        return this.Bot;
    }
  }

  readonly conversations$ = combineLatest([
    this.allConversations$,
    this.selectedAgentId$,
    this.searchTerm$,
  ]).pipe(
    map(([items, selectedAgentId, searchTerm]) =>
      items.filter(({ conversation, agent }) => {
        const query = searchTerm.trim().toLowerCase();
        const matchesAgent = !selectedAgentId || selectedAgentId === agent?.id;
        const matchesSearch =
          !query ||
          conversation.titre.toLowerCase().includes(query) ||
          agent?.nom.toLowerCase().includes(query);
        return matchesAgent && matchesSearch;
      }),
    ),
  );

  updateAgentFilter(agentId: string): void {
    this.selectedAgentId = agentId;
    this.selectedAgentId$.next(agentId);
  }

  updateSearchTerm(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.searchTerm$.next(searchTerm);
  }
}
