import { AsyncPipe, NgIf } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideDynamicIcon,
  LucideUser,
  LucideShield,
  LucideKey,
  LucideLogOut,
  LucideEye,
  LucideEyeOff,
  LucideCheck,
  LucideBuilding,
} from '@lucide/angular';

import { of } from 'rxjs';
import { SessionService } from '../../../../core/auth/session.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    FormsModule,
    LucideDynamicIcon,
    HeaderComponent,
    ToastComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  readonly user$ = of(this.sessionService.getCurrentUser());

  // Lucide Icons
  readonly UserIcon = LucideUser;
  readonly Shield = LucideShield;
  readonly Key = LucideKey;
  readonly LogOut = LucideLogOut;
  readonly Eye = LucideEye;
  readonly EyeOff = LucideEyeOff;
  readonly Check = LucideCheck;
  readonly Building = LucideBuilding;

  showPassword = false;
  toastMessage = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  saveProfile(): void {
    this.toastMessage.set('Profil mis à jour avec succès !');
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  logout(): void {
    this.sessionService.logout();
    this.router.navigateByUrl('/login');
  }
}
