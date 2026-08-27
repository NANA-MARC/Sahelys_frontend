import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly variant = input<'success' | 'warning' | 'error' | 'neutral' | null>(null);

  badgeClass(): string {
    if (this.variant()) {
      return `status--${this.variant()}`;
    }
    const val = this.status().toLowerCase().trim();
    if (val === 'actif' || val === 'publié' || val === 'publie' || val === 'valide') {
      return 'status--success';
    }
    if (val === 'en cours' || val === 'avertissement' || val === 'indexation') {
      return 'status--warning';
    }
    if (val === 'inactif' || val === 'désactivé' || val === 'desactive' || val === 'erreur' || val === 'bloqué') {
      return 'status--error';
    }
    return 'status--neutral';
  }
}
