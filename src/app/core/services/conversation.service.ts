import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Conversation } from '../../shared/models/conversation.model';
import type { Message } from '../../shared/models/message.model';
import type { ConversationApiResponse, MessageApiResponse } from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/conversations`;

  /**
   * Récupère toutes les conversations de l'utilisateur connecté
   */
  getConversations(): Observable<Conversation[]> {
    return this.http.get<ConversationApiResponse[]>(this.apiUrl).pipe(
      map((apiConvs) =>
        apiConvs
          .map((conv) => this.mapConversationFromApi(conv))
          .sort((a, b) => new Date(b.misAJourLe || b.creeLe).getTime() - new Date(a.misAJourLe || a.creeLe).getTime())
      ),
      catchError(() => of([]))
    );
  }

  /**
   * Récupère le détail d'une conversation et ses métadonnées
   */
  getConversationById(id: string): Observable<Conversation> {
    return this.http.get<ConversationApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((conv) => this.mapConversationFromApi(conv))
    );
  }

  /**
   * Récupère l'historique des messages passés d'une conversation
   */
  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<any>(`${this.apiUrl}/${conversationId}`).pipe(
      map((detail) => {
        if (!detail || !detail.messages || !Array.isArray(detail.messages)) return [];
        const result: Message[] = [];
        for (const item of detail.messages) {
          if (item.question || item.reponse) {
            if (item.question) {
              result.push({
                id: `${item.id}-user`,
                conversationId,
                auteur: 'utilisateur',
                contenu: item.question,
                creeLe: item.date_heure || detail.date_creation,
              });
            }
            if (item.reponse) {
              result.push({
                id: `${item.id}-agent`,
                conversationId,
                auteur: 'agent',
                contenu: item.reponse,
                creeLe: item.date_heure || detail.date_creation,
              });
            }
          } else if (item.contenu) {
            result.push(this.mapMessageFromApi(item));
          }
        }
        return result;
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Supprime une conversation et son historique
   */
  deleteConversation(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true)
    );
  }

  // =========================================================================
  // 🔀 FONCTIONS DE CONVERSION (Traducteurs DTO Backend -> Modèles Frontend)
  // =========================================================================

  private mapConversationFromApi(apiConv: ConversationApiResponse): Conversation {
    return {
      id: apiConv.id,
      utilisateurId: apiConv.utilisateur_id,
      agentId: apiConv.agent_id,
      titre: apiConv.titre || 'Nouvelle conversation',
      creeLe: apiConv.date_creation,
      misAJourLe: apiConv.date_mise_a_jour,
      messages: [],
    };
  }

  private mapMessageFromApi(apiMsg: MessageApiResponse): Message {
    return {
      id: apiMsg.id,
      conversationId: apiMsg.conversation_id,
      auteur: apiMsg.auteur === 'utilisateur' || apiMsg.auteur === 'user' ? 'utilisateur' : 'agent',
      contenu: apiMsg.contenu,
      creeLe: apiMsg.date_heure,
    };
  }
}
