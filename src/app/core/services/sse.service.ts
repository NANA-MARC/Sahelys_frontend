import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SessionService } from '../auth/session.service';

export interface SseStreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (conversationId?: string) => void;
  onError?: (err: Error) => void;
}

@Injectable({
  providedIn: 'root',
})
export class SseService {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  /**
   * Interroge un agent IA en streaming SSE (Server-Sent Events) token par token.
   * @param agentId Identifiant de l'agent interrogeable
   * @param question Question posée par l'utilisateur
   * @param conversationId Identifiant optionnel de la conversation active
   * @param callbacks Fonctions de rappel pour les morceaux de texte reçus, la fin et les erreurs
   * @returns Fonction d'annulation (AbortController)
   */
  queryStream(
    agentId: string,
    question: string,
    conversationId?: string,
    callbacks?: SseStreamCallbacks
  ): () => void {
    const controller = new AbortController();
    const token = this.sessionService.getToken();
    const url = `${environment.apiUrl}/agents/${agentId}/query`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload: { question: string; conversation_id?: string } = {
      question,
    };
    if (conversationId && !conversationId.startsWith('new-')) {
      payload.conversation_id = conversationId;
    }

    console.log('[SSE CONNECTED] URL =', url, '| conversation_id =', payload.conversation_id ?? 'undefined (new)');

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          this.sessionService.logout();
          this.router.navigate(['/login'], { queryParams: { expired: 'true' } });
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        if (!response.ok) {
          throw new Error(`Erreur de génération IA (HTTP ${response.status})`);
        }
        if (!response.body) {
          throw new Error('Aucun flux de réponse reçu du microservice IA.');
        }

        // Récupération de l'en-tête X-Conversation-Id retourné par FastAPI
        const serverConvId =
          response.headers.get('x-conversation-id') ||
          response.headers.get('X-Conversation-Id') ||
          undefined;

        console.log('[SSE CONNECTED] HTTP', response.status, '| X-Conversation-Id header =', serverConvId);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let chunkCount = 0;
        let isDoneReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[SSE CONNECTED] Flux fermé côté backend. Total chunks =', chunkCount);
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Traiter chaque ligne SSE complète (séparée par \n)
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;

            let cleanToken: string;
            if (trimmed.startsWith('data:')) {
              const tokenValue = line.slice(line.indexOf('data:') + 5);
              cleanToken = tokenValue.startsWith(' ') ? tokenValue.slice(1) : tokenValue;
            } else {
              // Fallback tolérant pour le serveur backend actuel avant son redémarrage
              cleanToken = trimmed;
            }

            if (cleanToken === '[DONE]') {
              console.log('[SSE SIGNAL] data: [DONE] reçu — Fin du flux transmise par le backend');
              isDoneReceived = true;
              break;
            }

            if (cleanToken) {
              chunkCount++;
              console.log(`[SSE CHUNK #${chunkCount}]`, JSON.stringify(cleanToken));
              callbacks?.onChunk?.(cleanToken);
            }
          }

          if (isDoneReceived) {
            reader.cancel();
            break;
          }
        }

        // Traiter le reliquat du buffer s'il reste une ligne finale
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          let cleanToken = trimmed.startsWith('data:')
            ? trimmed.slice(5).trimStart()
            : trimmed;
          if (cleanToken && cleanToken !== '[DONE]') {
            chunkCount++;
            console.log(`[SSE CHUNK #${chunkCount}] (buffer final)`, JSON.stringify(cleanToken));
            callbacks?.onChunk?.(cleanToken);
          }
        }

        console.log('[SSE COMPLETE] onComplete() appelé avec conversation_id =', serverConvId);
        callbacks?.onComplete?.(serverConvId);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.log('[SSE ERROR]', error.message);
          callbacks?.onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      });

    return () => controller.abort();
  }
}
