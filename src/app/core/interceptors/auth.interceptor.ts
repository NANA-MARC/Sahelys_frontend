import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../auth/session.service';

/**
 * Intercepteur HTTP Angular (Standalone)
 * Intercepte chaque requête sortante et ajoute l'en-tête Authorization: Bearer <token>
 * si l'utilisateur est connecté et possède un jeton valide.
 * Intercepte également les réponses HTTP 401 (jeton expiré) et 403 (accès refusé).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const token = sessionService.getToken();

  const handleResponse = (
    request$ = next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req),
  ) => {
    return request$.pipe(
      catchError((error: HttpErrorResponse) => {
        // Expiration du jeton JWT (sauf lors d'une tentative de connexion active)
        if (error.status === 401 && !req.url.includes('/auth/login')) {
          sessionService.logout();
          router.navigate(['/login'], { queryParams: { expired: 'true' } });
        }
        return throwError(() => error);
      }),
    );
  };

  return handleResponse();
};
