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

    const rawRole = (currentUser.role || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (rawRole.includes('referent')) {
      this.router.navigateByUrl('/admin/agents');
    } else if (rawRole.includes('admin')) {
      this.router.navigateByUrl('/admin/supervision');
    } else {
      this.router.navigateByUrl('/chat');
    }
  }
}
