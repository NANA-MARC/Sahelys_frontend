import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Agent, AgentStatus } from '../../shared/models/agent.model';
import type { Direction } from '../../shared/models/user.model';
import type {
  AccessGrantResponse,
  AgentApiResponse,
  AgentCreatePayload,
  AgentUpdatePayload,
} from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agents`;

  /**
   * Récupère la liste de tous les agents disponibles
   */
  getAgents(): Observable<Agent[]> {
    return this.http.get<AgentApiResponse[]>(this.apiUrl).pipe(
      map((apiAgents) => apiAgents.map((apiAgent) => this.mapAgentFromApi(apiAgent)))
    );
  }

  /**
   * Récupère un agent par son identifiant
   */
  getAgentById(id: string): Observable<Agent> {
    return this.http.get<AgentApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((apiAgent) => this.mapAgentFromApi(apiAgent))
    );
  }

  /**
   * Crée un nouvel agent (le backend associe automatiquement la direction du Référent)
   */
  createAgent(agent: { nom: string; description?: string; system_prompt: string }): Observable<Agent> {
    const payload: AgentCreatePayload = {
      nom: agent.nom,
      description: agent.description,
      system_prompt: agent.system_prompt,
    };

    return this.http.post<AgentApiResponse>(this.apiUrl, payload).pipe(
      map((apiAgent) => this.mapAgentFromApi(apiAgent))
    );
  }

  /**
   * Met à jour les informations d'un agent
   */
  updateAgent(id: string, agent: Partial<Agent>): Observable<Agent> {
    const payload: AgentUpdatePayload = {
      nom: agent.nom,
      description: agent.description,
      system_prompt: agent.instructions,
      statut: agent.statut ? this.mapStatusToApi(agent.statut) : undefined,
    };

    return this.http.put<AgentApiResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      map((apiAgent) => this.mapAgentFromApi(apiAgent))
    );
  }

  /**
   * Supprime un agent
   */
  deleteAgent(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true)
    );
  }

  // --- Habilitations d'accès aux Agents ---

  /**
   * Obtient la liste des habilitations d'accès attribuées pour cet agent
   */
  getAccessList(agentId: string): Observable<AccessGrantResponse[]> {
    return this.http.get<AccessGrantResponse[]>(`${this.apiUrl}/${agentId}/access`);
  }

  /**
   * Accorde l'accès à cet agent à un utilisateur spécifique
   */
  grantAccess(agentId: string, utilisateurId: string): Observable<AccessGrantResponse | null> {
    return this.http.post<AccessGrantResponse>(`${this.apiUrl}/${agentId}/access`, {
      utilisateur_id: utilisateurId,
    }).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Révoque l'accès d'un utilisateur à cet agent
   */
  revokeAccess(agentId: string, utilisateurId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${agentId}/access/${utilisateurId}`).pipe(
      map(() => true)
    );
  }

  // =========================================================================
  // 🔀 FONCTIONS DE CONVERSION (Mappers Traducteurs : Backend <-> Frontend)
  // =========================================================================

  /**
   * Convertit un DTO Backend (snake_case) vers un modèle Frontend (camelCase)
   */
  private mapAgentFromApi(apiAgent: AgentApiResponse): Agent {
    return {
      id: apiAgent.id,
      nom: apiAgent.nom,
      description: apiAgent.description ?? '',
      instructions: apiAgent.system_prompt ?? '',
      direction: (apiAgent.direction_proprietaire ?? 'RH') as Direction,
      statut: this.mapStatusFromApi(apiAgent.statut),
    };
  }

  /**
   * Convertit le statut backend ('actif'/'inactif') vers le statut UI Angular ('publié'/'désactivé')
   */
  private mapStatusFromApi(statutBackend: string): AgentStatus {
    if (statutBackend === 'actif' || statutBackend === 'publié') {
      return 'publié';
    }
    return 'désactivé';
  }

  /**
   * Convertit le statut UI Angular ('publié'/'désactivé') vers le statut BDD backend ('actif'/'inactif')
   */
  private mapStatusToApi(statutFrontend: AgentStatus): string {
    if (statutFrontend === 'publié' || statutFrontend === 'actif') {
      return 'actif';
    }
    return 'inactif';
  }
}
