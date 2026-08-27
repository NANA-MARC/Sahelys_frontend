import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon, LucideHistory, LucideSparkles, LucideFilter } from '@lucide/angular';

import { MockDataService } from '../../../../core/services/mock-data.service';
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
export class AgentSelectionComponent {
  private readonly router = inject(Router);
  private readonly mockDataService = inject(MockDataService);
  private readonly sessionService = inject(SessionService);

  // Signals for Filtering
  readonly searchQuery = signal<string>('');
  readonly selectedDirection = signal<string>('TOUTES');

  readonly allAgents = toSignal(this.mockDataService.getAgents(), { initialValue: [] });
  readonly conversations = toSignal(this.mockDataService.getConversations(), { initialValue: [] });

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
    if (!user || user.role === 'administrateur_central') {
      return agents.filter((a) => a.statut === 'publié');
    }

    // Référent ou Collaborateur : Accès aux agents publiés autorisés (de sa direction)
    return agents.filter(
      (a) => a.statut === 'publié' && (a.direction === user.direction || !a.direction),
    );
  });

  // Dynamically compute available directions based ONLY on accessible agents
  readonly availableDirections = computed(() => {
    const agents = this.accessibleAgents();
    const uniqueDirs = Array.from(new Set(agents.map((a) => a.direction))).filter(Boolean);

    const pills = [{ value: 'TOUTES', label: 'Toutes les directions' }];
    uniqueDirs.forEach((dir) => {
      pills.push({
        value: dir,
        label: this.DIRECTION_LABELS[dir] || dir,
      });
    });

    return pills;
  });

  // Computed Filtered Agents
  readonly filteredAgents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const dir = this.selectedDirection();

    return this.accessibleAgents().filter((agent) => {
      const matchesSearch =
        !query ||
        agent.nom.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.direction.toLowerCase().includes(query);

      const matchesDir = dir === 'TOUTES' || agent.direction === dir;

      return matchesSearch && matchesDir;
    });
  });

  onSearchChange(term: string): void {
    this.searchQuery.set(term);
  }

  setDirection(direction: string): void {
    this.selectedDirection.set(direction);
  }

  selectAgent(agent: Agent): void {
    this.router.navigate(['/chat/conversation', agent.id]);
  }
}
