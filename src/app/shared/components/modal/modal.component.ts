import { Component, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly close = output<void>();

  readonly XIcon = LucideX;
}
