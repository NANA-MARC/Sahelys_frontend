import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RoleRouterService } from '../../../core/auth/role-router.service';
import { SessionService } from '../../../core/auth/session.service';

type LoginForm = {
  email: string;
  password: string;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly roleRouterService = inject(RoleRouterService);

  formModel: LoginForm = {
    email: '',
    password: '',
  };

  showPassword = false;

  login(): void {
    const email = this.formModel.email.trim();

    if (!email) {
      return;
    }

    this.mockLogin(this.getRoleFromEmail(email));
  }

  mockLogin(role: 'collaborateur' | 'referent' | 'administrateur_central'): void {
    this.sessionService.setUser({
      id: `demo-${role}`,
      role,
      direction: role === 'administrateur_central' ? 'IT' : 'RH',
    });

    this.roleRouterService.redirectByRole();
  }

  private getRoleFromEmail(email: string): 'collaborateur' | 'referent' | 'administrateur_central' {
    if (email.toLowerCase().includes('referent')) {
      return 'referent';
    }

    if (email.toLowerCase().includes('admin')) {
      return 'administrateur_central';
    }

    return 'collaborateur';
  }
}
