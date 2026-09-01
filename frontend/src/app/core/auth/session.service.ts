import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Direction, UserRole } from '../../shared/models/user.model';
import type { TokenResponse } from '../../shared/models/api.models';

export type SessionUser = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  direction: Direction;
  token: string;
};

const STORAGE_KEY = 'sahelys_session_user';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  readonly currentUser = signal<SessionUser | null>(this.getInitialUser());

  /**
   * Connexion réelle à l'API Backend FastAPI (/auth/login)
   */
  login(email: string, password: string): Observable<boolean> {
    const payload = {
      nom: email, // Moussa prend 'nom' ou 'username' (prend aussi l'email)
      mot_de_passe: password,
    };

    return this.http.post<TokenResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      map((res) => {
        const user: SessionUser = {
          id: res.nom, // Utilisé comme identifiant unique
          nom: res.nom,
          prenom: '',
          email: email.includes('@') ? email : `${res.nom.toLowerCase().replace(/\s+/g, '.')}@sahelys.local`,
          role: this.normalizeRole(res.role),
          direction: res.direction as Direction,
          token: res.access_token,
        };

        this.setUser(user);
        return true;
      }),
      catchError((error) => {
        let msg = 'Identifiants incorrects ou serveur indisponible.';
        if (error.status === 401) {
          msg = 'Nom d\'utilisateur/Email ou mot de passe incorrect.';
        } else if (error.status === 0) {
          msg = 'Impossible de contacter le serveur backend. Vérifiez qu\'il est démarré sur ' + environment.apiUrl;
        }
        return throwError(() => new Error(msg));
      })
    );
  }

  logout(): void {
    this.setUser(null);
  }

  setUser(user: SessionUser | null): void {
    this.currentUser.set(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUser();
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  private getInitialUser(): SessionUser | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user && user.role) {
            user.role = this.normalizeRole(user.role);
            user.prenom = user.prenom ?? '';
            user.email = user.email ?? `${(user.nom || 'user').toLowerCase().replace(/\s+/g, '.')}@sahelys.local`;
          }
          return user;
        } catch {
          // Ignorer l'erreur de désérialisation
        }
      }
    }
    return null;
  }

  private normalizeRole(rawRole: string | undefined | null): UserRole {
    if (!rawRole) return 'collaborateur';
    const clean = rawRole.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (clean.includes('referent')) {
      return 'referent';
    }
    if (clean.includes('admin')) {
      return 'administrateur';
    }
    return 'collaborateur';
  }
}
