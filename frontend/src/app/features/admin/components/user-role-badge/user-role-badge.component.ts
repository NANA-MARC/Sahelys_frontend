import { Component, input } from '@angular/core';
import type { UserRole } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-role-badge',
  standalone: true,
  templateUrl: './user-role-badge.component.html',
  styleUrl: './user-role-badge.component.scss',
})
export class UserRoleBadgeComponent {
  readonly role = input.required<UserRole>();

  getRoleLabel(r: UserRole): string {
    switch (r) {
      case 'administrateur': return 'Admin Central';
      case 'referent':               return 'Référent';
      default:                       return 'Collaborateur';
    }
  }
}
