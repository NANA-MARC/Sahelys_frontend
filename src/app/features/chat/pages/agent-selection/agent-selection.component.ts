import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon, LucideHistory, LucideSparkles, LucideFilter } from '@lucide/angular';

import { AgentService } from '../../../../core/services/agent.service';
import { ConversationService } from '../../../../core/services/conversation.service';
import { SessionService } from '../../../../core/auth/session.service';
import { AgentCardComponent } from '../../components/agent-card/agent-card.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import type { Agent } from '../../../../shared/models/agent.model';

@Component({
  selector: 'app-agent-selection',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideDynamicIcon, AgentCardComponent, HeaderComponent],
  templateUrl: './agent-selection.component.html',
  styleUrl: './agent-selection.component.scss',
})
export class AgentSelectionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly agentService = inject(AgentService);
  private readonly conversationService = inject(ConversationService);
  private readonly sessionService = inject(SessionService);

  ngOnInit(): void {
    const user = this.sessionService.currentUser();
    if (user?.role === 'administrateur' || user?.role === 'referent') {
      this.router.navigateByUrl('/admin/agents');
    }
  }

  // Signals for Filtering
  readonly searchQuery = signal<string>('');
  readonly selectedDirection = signal<string>('TOUTES');

  readonly allAgents = toSignal(this.agentService.getAgents(), { initialValue: [] });
  readonly conversations = toSignal(this.conversationService.getConversations(), {
    initialValue: [],
  });

  // Lucide Icons
  readonly History = LucideHistory;
  readonly Sparkles = LucideSparkles;
  readonly Filter = LucideFilter;

  private readonly DIRECTION_LABELS: Record<string, string> = {
    RH: 'Ressources Humaines',
    Finance: 'Finance & Compta',
    Commercial: 'Commercial',
    IT: 'Informatique & SI',
    Juridique: 'Juridique',
    Opérations: 'Opérations',
    DG: 'Direction Générale',
  };

  // Compute Accessible Agents based on User Role & Direction
  readonly accessibleAgents = computed(() => {
    const user = this.sessionService.currentUser();
    const agents = this.allAgents();

    // Administrateur Central : Accès à tous les agents publiés
    if (!user || user.role === 'administrateur') {
      return agents.filter((a) => a.statut === 'publié');
    }

    // Référent ou Collaborateur : Accès aux agents publiés autorisés (de sa direction)
    return agents.filter(
      (a) => a.statut === 'publié' && (a.direction === user.direction || !a.direction),
    );
  });

  // Filter Agents based on Search Query and Selected Direction
  readonly filteredAgents = computed(() => {
    const agents = this.accessibleAgents();
    const query = this.searchQuery().toLowerCase().trim();
    const direction = this.selectedDirection();

    return agents.filter((agent) => {
      const matchesQuery =
        !query ||
        agent.nom.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query);

      const matchesDirection = direction === 'TOUTES' || agent.direction === direction;

      return matchesQuery && matchesDirection;
    });
  });

  // Available Directions for Filter Bar
  readonly availableDirections = computed(() => {
    const agents = this.accessibleAgents();
    const dirs = new Set<string>();
    dirs.add('TOUTES');
    agents.forEach((a) => {
      if (a.direction) dirs.add(a.direction);
    });
    return Array.from(dirs).map((d) => ({
      value: d,
      label: d === 'TOUTES' ? 'Toutes les directions' : this.DIRECTION_LABELS[d] || d,
    }));
  });

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  setDirection(dir: string): void {
    this.selectedDirection.set(dir);
  }

  setDirectionFilter(dir: string): void {
    this.selectedDirection.set(dir);
  }

  getDirectionLabel(dir: string): string {
    return this.DIRECTION_LABELS[dir] || dir;
  }

  onSelectAgent(agent: Agent): void {
    this.router.navigate(['/chat/conversation', agent.id]);
  }

  selectAgent(agent: Agent): void {
    this.onSelectAgent(agent);
  }
}
