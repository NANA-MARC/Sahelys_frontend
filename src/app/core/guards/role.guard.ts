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

  const normalize = (r?: string) => {
    if (!r) return '';
    const norm = r
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    if (norm.startsWith('referent')) return 'referent';
    if (norm.startsWith('admin')) return 'administrateur';
    return norm;
  };

  const userRole = normalize(currentUser.role);

  if (requiredRole && userRole !== normalize(requiredRole)) {
    return router.createUrlTree(['/access-denied']);
  }

  if (requiredRoles && !requiredRoles.some((r) => normalize(r) === userRole)) {
    return router.createUrlTree(['/access-denied']);
  }

  return true;
};
