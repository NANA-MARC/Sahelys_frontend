import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideDynamicIcon,
  LucideBot,
  LucideUser,
  LucideFileText,
  LucideThumbsUp,
  LucideThumbsDown,
  LucideChevronDown,
  LucideChevronUp,
} from '@lucide/angular';
import type { Message } from '../../../../shared/models/message.model';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
})
export class MessageBubbleComponent {
  readonly message = input.required<Message>();
  readonly agentName = input<string>('Agent IA');

  readonly showSources = signal<boolean>(false);
  readonly userFeedback = signal<'up' | 'down' | null>(null);

  readonly UserIcon = LucideUser;
  readonly BotIcon = LucideBot;
  readonly FileText = LucideFileText;
  readonly ThumbsUp = LucideThumbsUp;
  readonly ThumbsDown = LucideThumbsDown;
  readonly ChevronDown = LucideChevronDown;
  readonly ChevronUp = LucideChevronUp;

  toggleSources(): void {
    this.showSources.update((v) => !v);
  }

  setFeedback(type: 'up' | 'down'): void {
    this.userFeedback.set(this.userFeedback() === type ? null : type);
  }
}
