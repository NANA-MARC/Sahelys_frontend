import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class RoleRouterService {
  constructor(
    private readonly router: Router,
    private readonly sessionService: SessionService,
  ) {}

  redirectByRole(): void {
    const currentUser = this.sessionService.getCurrentUser();

    if (!currentUser) {
      this.router.navigateByUrl('/chat');
      return;
    }

    switch (currentUser.role) {
      case 'collaborateur':
        this.router.navigateByUrl('/chat');
        break;
      case 'referent':
        this.router.navigateByUrl('/admin/agents');
        break;
      case 'administrateur_central':
        this.router.navigateByUrl('/admin/supervision');
        break;
      default:
        this.router.navigateByUrl('/chat');
        break;
    }
  }
}
