import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, tap } from 'rxjs';
import type { UserRole } from '../../shared/models/user.model';

export type SessionUser = {
  id: string;
  role: UserRole;
  direction: 'RH' | 'IT' | 'Finance' | 'Commercial';
  token?: string; // Faux token pour préparer l'intercepteur
};

const STORAGE_KEY = 'sahelys_session_user';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  readonly currentUser = signal<SessionUser | null>(this.getInitialUser());

  // --- API MOCKÉE POUR L'AUTHENTIFICATION ---
  login(email: string, password: string): Observable<boolean> {
    // Simulation d'une requête HTTP qui prend 800ms
    return of(true).pipe(
      delay(800),
      tap(() => {
        // En vrai, le backend renverrait ces infos. On les simule.
        const mockUser: SessionUser = {
          id: 'user-001',
          role: 'administrateur_central', // Pour le test, on donne ce rôle
          direction: 'RH',
          token: 'mock-jwt-token-123456789'
        };
        this.setUser(mockUser);
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
          return JSON.parse(stored);
        } catch {
          // Ignorer l'erreur
        }
      }
    }
    // CORRECTION DE SÉCURITÉ : On ne renvoie plus d'utilisateur par défaut !
    return null;
  }
}
