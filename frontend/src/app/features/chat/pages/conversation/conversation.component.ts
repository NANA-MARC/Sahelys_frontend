import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
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
import { MockDataService } from '../../../../core/services/mock-data.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MessageBubbleComponent } from '../../components/message-bubble/message-bubble.component';


@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgFor,
    NgIf,
    LucideDynamicIcon,
    HeaderComponent,
    MessageBubbleComponent,
  ],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.scss',
})
export class ConversationComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly mockDataService = inject(MockDataService);
  private streamTimer?: ReturnType<typeof setInterval>;

  readonly conversations$ = this.mockDataService.getConversations();
  private readonly selectedConversationId$ = new BehaviorSubject<string | null>(null);
  private readonly draftConversation$ = new BehaviorSubject<Conversation | null>(null);

  attachedFiles: File[] = [];

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
        return draftConversation;
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
  );

  readonly agent$: Observable<Agent | undefined> = combineLatest([
    this.conversation$,
    this.mockDataService.getAgents(),
  ]).pipe(
    map(([conversation, agents]) => agents.find((agent) => agent.id === conversation?.agentId)),
  );

  draft = '';
  streamedAnswer = '';
  isStreaming = false;

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

  selectConversation(conversationId: string): void {
    this.stopStreaming();
    this.draft = '';
    this.streamedAnswer = '';
    this.attachedFiles = [];
    this.selectedConversationId$.next(conversationId);
    this.closeSidebarOnMobile();
  }

  startNewConversation(): void {
    this.stopStreaming();
    this.draft = '';
    this.streamedAnswer = '';
    this.attachedFiles = [];

    const draftConversation: Conversation = {
      id: `new-${Date.now()}`,
      utilisateurId: 'user-001',
      agentId: this.route.snapshot.paramMap.get('id') ?? 'agent-rh',
      titre: 'Nouvelle conversation',
      creeLe: new Date().toISOString(),
      misAJourLe: new Date().toISOString(),
      messages: [],
    };

    this.draftConversation$.next(draftConversation);
    this.selectedConversationId$.next(draftConversation.id);
    this.closeSidebarOnMobile();
  }

  sendMessage(): void {
    const question = this.draft.trim();

    if ((!question && this.attachedFiles.length === 0) || this.isStreaming) {
      return;
    }

    this.draft = '';
    this.attachedFiles = [];
    this.streamedAnswer = '';
    this.isStreaming = true;

    const answer =
      'Je prépare une réponse à partir des documents de cet agent. Cette réponse est simulée token par token pour la démonstration.';

    let position = 0;

    this.streamTimer = setInterval(() => {
      this.streamedAnswer += answer[position++] ?? '';

      if (position >= answer.length) {
        this.stopStreaming();
      }
    }, 24);
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }

  private stopStreaming(): void {
    if (this.streamTimer) {
      clearInterval(this.streamTimer);
    }

    this.streamTimer = undefined;

    if (this.streamedAnswer.length > 0) {
      this.isStreaming = false;
    }
  }
}
