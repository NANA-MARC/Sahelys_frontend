import { Component, input } from '@angular/core';
import { LucideDynamicIcon, LucideCheck } from '@lucide/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  readonly message = input<string | null>(null);

  readonly CheckIcon = LucideCheck;
}
