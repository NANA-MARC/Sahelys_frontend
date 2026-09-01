import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideSearch,
  LucideHelpCircle,
  LucideBell,
  LucideSettings,
  LucideLogOut,
  LucideUser,
  LucideShield,
  LucideArrowLeft,
  LucideChevronDown,
  LucideBot,
  LucideMessageSquare,
} from '@lucide/angular';
import { SessionService } from '../../../core/auth/session.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideDynamicIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  // Lucide Icons
  readonly Search = LucideSearch;
  readonly HelpCircle = LucideHelpCircle;
  readonly Bell = LucideBell;
  readonly Settings = LucideSettings;
  readonly LogOut = LucideLogOut;
  readonly UserIcon = LucideUser;
  readonly Shield = LucideShield;
  readonly ArrowLeft = LucideArrowLeft;
  readonly ChevronDown = LucideChevronDown;
  readonly Bot = LucideBot;
  readonly MessageSquare = LucideMessageSquare;

  // Inputs
  readonly showSearch = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Rechercher un agent ou un document...');
  readonly searchValue = input<string>('');
  readonly title = input<string>('');
  readonly backUrl = input<string>('');

  // Outputs
  readonly searchChange = output<string>();

  // State
  readonly isMenuOpen = signal<boolean>(false);

  // Current User Signal
  readonly currentUser = this.sessionService.currentUser;

  get initials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    return user.role === 'administrateur' ? 'AC' : user.role === 'referent' ? 'REF' : 'CO';
  }

  get userRoleLabel(): string {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'administrateur':
        return 'Admin Central';
      case 'referent':
        return 'Référent Direction';
      case 'collaborateur':
        return 'Collaborateur';
      default:
        return 'Utilisateur';
    }
  }

  get userDirection(): string {
    return this.currentUser()?.direction || 'SAHELYS';
  }

  get homeUrl(): string {
    const role = this.currentUser()?.role;
    return role === 'administrateur' || role === 'referent' ? '/admin/agents' : '/chat';
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.sessionService.logout();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}
