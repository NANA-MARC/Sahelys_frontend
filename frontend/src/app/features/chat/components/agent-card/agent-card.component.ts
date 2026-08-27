import { Component, input, output } from '@angular/core';
import {
  LucideDynamicIcon,
  LucideArrowRight,
  LucideUsers,
  LucideMonitor,
  LucideCreditCard,
  LucideBot,
} from '@lucide/angular';
import type { Agent } from '../../../../shared/models/agent.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [LucideDynamicIcon, StatusBadgeComponent],
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss',
})
export class AgentCardComponent {
  readonly agent = input.required<Agent>();
  readonly select = output<Agent>();

  readonly ArrowRightIcon = LucideArrowRight;

  getIcon(name: string) {
    const n = (name || '').toLowerCase();
    if (n.includes('rh')) return LucideUsers;
    if (n.includes('it')) return LucideMonitor;
    if (n.includes('finance')) return LucideCreditCard;
    return LucideBot;
  }
}
