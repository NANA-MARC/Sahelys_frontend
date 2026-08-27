import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import type { UserRole } from '../../shared/models/user.model';
import { SessionService } from '../auth/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  // Accepte un rôle unique (`role`) ou un tableau de rôles (`roles`) dans route.data
  const requiredRole = route.data?.['role'] as UserRole | undefined;
  const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;
  const currentUser = sessionService.getCurrentUser();

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return router.createUrlTree(['/access-denied']);
  }

  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    return router.createUrlTree(['/access-denied']);
  }

  return true;
};
