import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
export class LoginComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sessionService = inject(SessionService);
  private readonly roleRouterService = inject(RoleRouterService);

  formModel: LoginForm = {
    email: '',
    password: '',
  };

  showPassword = false;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSessionExpired = signal(false);

  ngOnInit(): void {
    const expired = this.route.snapshot.queryParamMap.get('expired');
    if (expired === 'true') {
      this.isSessionExpired.set(true);
    }
  }

  login(): void {
    const email = this.formModel.email.trim();
    const password = this.formModel.password;

    if (!email || !password) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isSessionExpired.set(false);

    this.sessionService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.roleRouterService.redirectByRole();
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Échec de la connexion.');
      },
    });
  }
}
