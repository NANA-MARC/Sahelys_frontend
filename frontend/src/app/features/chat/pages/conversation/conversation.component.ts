import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, map, Observable, switchMap, startWith, tap } from 'rxjs';
import {
  LucideDynamicIcon,
  LucideSidebar,
  LucidePlus,
  LucideFileText,
  LucideSend,
  LucideBot,
  LucideUser,
  LucideMenu,
  LucideMessageSquare,
  LucidePaperclip,
  LucideX,
} from '@lucide/angular';

import type { Agent } from '../../../../shared/models/agent.model';
import type { Conversation } from '../../../../shared/models/conversation.model';
import type { Message } from '../../../../shared/models/message.model';
import { AgentService } from '../../../../core/services/agent.service';
import { ConversationService } from '../../../../core/services/conversation.service';
import { SseService } from '../../../../core/services/sse.service';
import { SessionService } from '../../../../core/auth/session.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MessageBubbleComponent } from '../../components/message-bubble/message-bubble.component';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    LucideDynamicIcon,
    HeaderComponent,
    MessageBubbleComponent,
  ],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly agentService = inject(AgentService);
  private readonly conversationService = inject(ConversationService);
  private readonly sseService = inject(SseService);
  private readonly sessionService = inject(SessionService);

  private abortStreamFn?: () => void;

  // Trigger pour recharger les conversations depuis le backend
  private readonly refreshConversations$ = new Subject<void>();

  readonly conversations$ = this.refreshConversations$.pipe(
    startWith(undefined),
    switchMap(() => this.conversationService.getConversations())
  );

  private readonly selectedConversationId$ = new BehaviorSubject<string | null>(null);
  private readonly draftConversation$ = new BehaviorSubject<Conversation | null>(null);

  // ID réel de la conversation créée par le backend (après le 1er SSE)
  private realConversationId: string | null = null;

  attachedFiles: File[] = [];
  readonly activeMessages = signal<Message[]>([]);

  readonly sidebarConversations$ = combineLatest([
    this.conversations$,
    this.draftConversation$,
  ]).pipe(
    map(([conversations, draftConversation]) =>
      draftConversation ? [draftConversation, ...conversations] : conversations,
    ),
  );

  readonly conversation$: Observable<Conversation | undefined> = combineLatest([
    this.conversations$,
    this.selectedConversationId$,
  ]).pipe(
    map(([conversations, selectedId]) => {
      const draftConversation = this.draftConversation$.value;

      if (selectedId === draftConversation?.id) {
        return draftConversation ?? undefined;
      }

      if (selectedId) {
        return conversations.find((conversation) => conversation.id === selectedId);
      }

      const conversationId = this.route.snapshot.queryParamMap.get('conversationId');
      if (conversationId) {
        return conversations.find((conversation) => conversation.id === conversationId);
      }

      const agentId = this.route.snapshot.paramMap.get('id');
      if (agentId) {
        return conversations.find((conversation) => conversation.agentId === agentId);
      }

      return conversations[0];
    }),
    tap((conv) => {
      // Synchroniser selectedConversationId$ si résolu depuis l'URL ou la liste par défaut
      if (conv && !conv.id.startsWith('new-')) {
        if (this.selectedConversationId$.value !== conv.id) {
          this.selectedConversationId$.next(conv.id);
          console.log('[SELECT] Initialized selectedConversationId from route/conversations:', conv.id);
        }
        if (this.activeMessages().length === 0) {
          this.loadConversationMessages(conv.id);
        }
      }
    })
  );

  readonly agent$: Observable<Agent | undefined> = combineLatest([
    this.conversation$,
    this.agentService.getAgents(),
  ]).pipe(
    map(([conversation, agents]) => {
      const routeAgentId = this.route.snapshot.paramMap.get('id');
      if (routeAgentId) {
        const found = agents.find((agent) => agent.id === routeAgentId);
        if (found) return found;
      }
      return agents.find((agent) => agent.id === conversation?.agentId) ?? agents[0];
    }),
  );

  readonly currentAgent = toSignal(this.agent$);

  draft = '';
  readonly streamedAnswer = signal<string>('');
  readonly isStreaming = signal<boolean>(false);

  readonly Sidebar = LucideSidebar;
  readonly Plus = LucidePlus;
  readonly FileText = LucideFileText;
  readonly Send = LucideSend;
  readonly Bot = LucideBot;
  readonly User = LucideUser;
  readonly Menu = LucideMenu;
  readonly MessageSquare = LucideMessageSquare;
  readonly Paperclip = LucidePaperclip;
  readonly X = LucideX;

  sidebarCollapsed =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 680px)').matches;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  closeSidebarOnMobile(): void {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 680px)').matches) {
      this.sidebarCollapsed = true;
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachedFiles = [...this.attachedFiles, ...Array.from(input.files)];
    }
  }

  removeAttachedFile(index: number): void {
    this.attachedFiles = this.attachedFiles.filter((_, i) => i !== index);
  }

  private loadedConversationId: string | null = null;

  selectConversation(conversationId: string): void {
    console.log('[SELECT] selectedConversationId =', conversationId);
    this.stopStreaming();
    this.draft = '';
    this.streamedAnswer.set('');
    this.attachedFiles = [];
    this.draftConversation$.next(null);
    this.realConversationId = null;
    this.loadedConversationId = null;
    this.activeMessages.set([]);
    this.selectedConversationId$.next(conversationId);
    this.loadConversationMessages(conversationId);
    this.closeSidebarOnMobile();
  }

  private loadConversationMessages(conversationId: string): void {
    if (conversationId.startsWith('new-') || this.loadedConversationId === conversationId) return;
    this.loadedConversationId = conversationId;
    this.conversationService.getMessages(conversationId).subscribe((messages) => {
      this.activeMessages.set(messages);
    });
  }

  startNewConversation(): void {
    this.stopStreaming();
    this.draft = '';
    this.streamedAnswer.set('');
    this.attachedFiles = [];
    this.realConversationId = null;
    this.loadedConversationId = null;

    const currentUser = this.sessionService.getCurrentUser();
    const agentId = this.currentAgent()?.id ?? this.route.snapshot.paramMap.get('id') ?? 'agent-rh';

    const draftConversation: Conversation = {
      id: `new-${Date.now()}`,
      utilisateurId: currentUser?.id ?? 'user-001',
      agentId: agentId,
      titre: 'Nouvelle conversation',
      creeLe: new Date().toISOString(),
      misAJourLe: new Date().toISOString(),
      messages: [],
    };

    this.draftConversation$.next(draftConversation);
    this.selectedConversationId$.next(draftConversation.id);
    console.log('[SELECT] New draft conversation created:', draftConversation.id);
    this.activeMessages.set([]);
    this.closeSidebarOnMobile();
  }

  /**
   * Envoie la question à l'agent IA et lit le flux SSE token par token
   */
  sendMessage(): void {
    const question = this.draft.trim();

    if ((!question && this.attachedFiles.length === 0) || this.isStreaming()) {
      return;
    }

    this.draft = '';
    this.attachedFiles = [];
    this.streamedAnswer.set('');
    this.isStreaming.set(true);

    const agentId = this.currentAgent()?.id ?? this.route.snapshot.paramMap.get('id') ?? 'agent-rh';

    // Utiliser la vraie conversation ID si déjà créée par le backend
    let activeConvId = this.realConversationId
      ?? (this.selectedConversationId$.value?.startsWith('new-') ? undefined : this.selectedConversationId$.value)
      ?? undefined;

    console.log('[SEND] selectedConversationId =', this.selectedConversationId$.value, 'realConversationId =', this.realConversationId, 'activeConvId =', activeConvId);
    console.log('[REQUEST] conversation_id envoyé =', activeConvId);

    // Auto-créer une conversation draft si aucune n'est sélectionnée
    if (!this.draftConversation$.value && !this.selectedConversationId$.value) {
      const currentUser = this.sessionService.getCurrentUser();
      const draft: Conversation = {
        id: `new-${Date.now()}`,
        utilisateurId: currentUser?.id ?? 'user-001',
        agentId,
        titre: question.slice(0, 40) || 'Nouvelle conversation',
        creeLe: new Date().toISOString(),
        misAJourLe: new Date().toISOString(),
        messages: [],
      };
      this.draftConversation$.next(draft);
      this.selectedConversationId$.next(draft.id);
    }

    // 1. Ajouter le message utilisateur dans le fil de discussion actif
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      conversationId: activeConvId || 'new',
      auteur: 'utilisateur',
      contenu: question,
      creeLe: new Date().toISOString(),
    };
    console.log('[ACTIVE MESSAGES BEFORE]', this.activeMessages().length, 'messages');
    this.activeMessages.update((msgs) => [...msgs, userMsg]);
    console.log('[ACTIVE MESSAGES AFTER user push]', this.activeMessages().length, 'messages');

    // 2. Déclencher le streaming SSE réactif
    this.abortStreamFn = this.sseService.queryStream(
      agentId,
      question,
      activeConvId,
      {
        onChunk: (chunk: string) => {
          this.streamedAnswer.update((t) => t + chunk);
          console.log('[STREAM] streamedAnswer longueur =', this.streamedAnswer().length, '| dernier chunk =', JSON.stringify(chunk));
        },
        onComplete: (serverConvId?: string) => {
          console.log('[SSE] complete, serverConvId =', serverConvId);
          this.isStreaming.set(false);
          const answerText = this.streamedAnswer().trim();
          console.log('[COMPLETE] réponse complète longueur =', answerText.length, '| aperçu =', answerText.slice(0, 80));
          console.log('[ACTIVE MESSAGES BEFORE onComplete]', this.activeMessages().length, 'messages');
          if (answerText) {
            const agentMsg: Message = {
              id: `agent-${Date.now()}`,
              conversationId: serverConvId || activeConvId || 'new',
              auteur: 'agent',
              contenu: answerText,
              creeLe: new Date().toISOString(),
            };
            this.activeMessages.update((msgs) => [...msgs, agentMsg]);
            this.streamedAnswer.set('');
            console.log('[ACTIVE MESSAGES AFTER onComplete]', this.activeMessages().length, 'messages | UI devrait afficher la réponse');
          } else {
            console.log('[COMPLETE] ⚠️ answerText vide — streamedAnswer était vide au moment de onComplete !');
          }
          this.abortStreamFn = undefined;

          // Recharger les conversations depuis le backend
          this.refreshConversations$.next();

          // Si le backend renvoie directement l'UUID via X-Conversation-Id
          if (serverConvId && (!this.selectedConversationId$.value || this.selectedConversationId$.value.startsWith('new-'))) {
            this.realConversationId = serverConvId;
            this.draftConversation$.next(null);
            this.selectedConversationId$.next(serverConvId);
            console.log('[ACTIVE CONVERSATION] conversation_id finale (depuis header) =', serverConvId);
          } else {
            const currentSelectedId = this.selectedConversationId$.value;
            console.log('[COMPLETE] conversation_id =', currentSelectedId);

            if (!currentSelectedId || currentSelectedId.startsWith('new-')) {
              setTimeout(() => {
                this.conversationService.getConversations().subscribe((convs) => {
                  const matching = convs.filter((c) => c.agentId === agentId);
                  const realConv = matching[0];
                  if (realConv) {
                    this.realConversationId = realConv.id;
                    this.draftConversation$.next(null);
                    this.selectedConversationId$.next(realConv.id);
                    console.log('[ACTIVE CONVERSATION] conversation_id finale (depuis API) =', realConv.id);
                  }
                });
              }, 500);
            } else {
              console.log('[ACTIVE CONVERSATION] conversation_id finale =', currentSelectedId);
            }
          }
        },
        onError: (err: Error) => {
          console.log('[SSE] error:', err.message);
          this.streamedAnswer.update((t) => t + `\n\n[Erreur : ${err.message}]`);
          this.isStreaming.set(false);
          const answerText = this.streamedAnswer().trim();
          if (answerText) {
            const errorMsg: Message = {
              id: `err-${Date.now()}`,
              conversationId: activeConvId || 'new',
              auteur: 'agent',
              contenu: answerText,
              creeLe: new Date().toISOString(),
            };
            this.activeMessages.update((msgs) => [...msgs, errorMsg]);
            this.streamedAnswer.set('');
          }
          this.abortStreamFn = undefined;
        },
      }
    );
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }

  private stopStreaming(): void {
    if (this.abortStreamFn) {
      this.abortStreamFn();
      this.abortStreamFn = undefined;
    }
    this.isStreaming.set(false);
  }
}

