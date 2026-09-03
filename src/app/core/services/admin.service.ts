import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { User, UserRole, Direction } from '../../shared/models/user.model';
import type {
  DashboardStatsResponse,
  LogApiResponse,
  LogSignalementRequest,
  SystemSettingsSchema,
  UserApiResponse,
  UserCreatePayload,
  UserUpdatePayload,
} from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/system`;

  /**
   * Récupère les agrégats de statistiques pour le tableau de bord d'administration
   */
  getDashboardStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/dashboard`);
  }

  /**
   * Récupère la liste de tous les utilisateurs inscrits dans le système
   */
  getUsers(): Observable<User[]> {
    return this.http.get<UserApiResponse[]>(`${this.apiUrl}/users`).pipe(
      map((users) => users.map((u) => this.mapUserFromApi(u))),
      catchError(() => of([])),
    );
  }

  /**
   * Crée un nouvel utilisateur avec mot de passe initial
   */
  createUser(payload: UserCreatePayload): Observable<User> {
    return this.http
      .post<UserApiResponse>(`${this.apiUrl}/users`, payload)
      .pipe(map((u) => this.mapUserFromApi(u)));
  }

  /**
   * Met à jour un utilisateur existant
   */
  updateUser(userId: string, payload: UserUpdatePayload): Observable<User> {
    return this.http
      .put<UserApiResponse>(`${this.apiUrl}/users/${userId}`, payload)
      .pipe(map((u) => this.mapUserFromApi(u)));
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  updateUserStatus(userId: string, actif: boolean): Observable<User> {
    return this.http
      .patch<UserApiResponse>(`${this.apiUrl}/users/${userId}/status`, { actif })
      .pipe(map((u) => this.mapUserFromApi(u)));
  }

  /**
   * Récupère le journal d'audit global des interactions des agents IA
   */
  getLogs(): Observable<LogApiResponse[]> {
    return this.http.get<LogApiResponse[]>(`${this.apiUrl}/logs`);
  }

  /**
   * Signale une anomalie ou un commentaire sur une interaction IA
   */
  signalInteraction(interactionId: string, comment: string): Observable<boolean> {
    const payload: LogSignalementRequest = {
      signale: true,
      commentaire_signalement: comment,
    };

    return this.http
      .patch<void>(`${environment.apiUrl}/interactions/${interactionId}/signalement`, payload)
      .pipe(map(() => true));
  }

  /**
   * Récupère la configuration système globale (rétention des logs, formats acceptés)
   */
  getSettings(): Observable<SystemSettingsSchema> {
    return this.http.get<SystemSettingsSchema>(`${this.apiUrl}/settings`);
  }

  /**
   * Met à jour la configuration système globale
   */
  updateSettings(settings: SystemSettingsSchema): Observable<SystemSettingsSchema> {
    return this.http.put<SystemSettingsSchema>(`${this.apiUrl}/settings`, settings);
  }

  // =========================================================================
  // 🔀 FONCTION DE CONVERSION (Traducteur Utilisateur Backend -> Frontend)
  // =========================================================================

  private mapUserFromApi(user: UserApiResponse): User {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom ?? '',
      email: user.email ?? '',
      direction: (user.direction as Direction) || 'RH',
      role: (user.role as UserRole) || 'collaborateur',
      actif: user.actif ?? true,
    };
  }
}
