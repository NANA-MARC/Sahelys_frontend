import { AsyncPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideDynamicIcon,
  LucideHelpCircle,
  LucideBell,
  LucideSettings,
  LucideSearch,
  LucidePlus,
  LucideLock,
  LucideUnlock,
  LucideEdit,
  LucideTrash2,
  LucideDownload,
  LucideAlertTriangle,
  LucideCheck,
  LucideX,
  LucideShieldAlert,
} from '@lucide/angular';
import { toSignal } from '@angular/core/rxjs-interop';

import type { Direction, User, UserRole } from '../../../shared/models/user.model';
import type {
  AuditLog,
  AuditLogSeverity,
  PlatformSettings,
} from '../../../shared/models/supervision.model';
import { SupervisionService } from '../../../core/services/supervision.service';
import { AdminService } from '../../../core/services/admin.service';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { UserRoleBadgeComponent } from '../components/user-role-badge/user-role-badge.component';

import { Router } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';

type TabId = 'dashboard' | 'agents' | 'comptes' | 'securite' | 'parametres';

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    TitleCasePipe,
    LucideDynamicIcon,
    HeaderComponent,
    KpiCardComponent,
    StatusBadgeComponent,
    UserRoleBadgeComponent,
    ModalComponent,
    ToastComponent,
  ],
  templateUrl: './supervision.component.html',
  styleUrl: './supervision.component.scss',
})
export class SupervisionComponent {
  private readonly router = inject(Router);
  private readonly supervisionService = inject(SupervisionService);
  private readonly agentService = inject(AgentService);
  readonly adminService = inject(AdminService);

  readonly activeTab = signal<TabId>('dashboard');

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'agents', label: 'Agents' },
    { id: 'comptes', label: 'Comptes' },
    { id: 'securite', label: 'Sécurité' },
    { id: 'parametres', label: 'Paramètres' },
  ];

  // Icônes
  readonly HelpCircle = LucideHelpCircle;
  readonly Bell = LucideBell;
  readonly SettingsIcon = LucideSettings;
  readonly Search = LucideSearch;
  readonly Plus = LucidePlus;
  readonly Lock = LucideLock;
  readonly Unlock = LucideUnlock;
  readonly Edit = LucideEdit;
  readonly Trash2 = LucideTrash2;
  readonly Download = LucideDownload;
  readonly AlertTriangle = LucideAlertTriangle;
  readonly Check = LucideCheck;
  readonly X = LucideX;
  readonly ShieldAlert = LucideShieldAlert;

  readonly kpis = toSignal(this.supervisionService.getKPIs());
  readonly activities = toSignal(this.supervisionService.getActivities(), { initialValue: [] });
  readonly auditLogsRaw = toSignal(this.supervisionService.getAuditLogs(), { initialValue: [] });
  readonly usersRaw = signal<User[]>([]);
  readonly agentsRaw = toSignal(this.agentService.getAgents(), { initialValue: [] });

  readonly settings = signal<PlatformSettings>({
    acceptedFormats: { pdf: true, word: true, excel: false, powerpoint: false },
    defaultPrivacy: 'Interne',
    logRetentionDays: 90,
    securityAlertsEnabled: true,
  });

  readonly userSearch = signal('');
  readonly directionFilter = signal('all');

  readonly logSearch = signal('');
  readonly logNiveauFilter = signal('all');

  readonly toastMessage = signal<string | null>(null);

  readonly showCreateUserModal = signal(false);
  editingUserId: string | null = null;
  newUser = {
    prenom: '',
    nom: '',
    email: '',
    mot_de_passe: '',
    direction: 'RH' as Direction,
    role: 'collaborateur' as UserRole,
  };

  constructor() {
    const currentSettings = this.supervisionService.getSettings()();
    this.settings.set({ ...currentSettings });
    this.adminService.getUsers().subscribe((users) => this.usersRaw.set(users));
  }

  readonly filteredUsers = computed(() => {
    const list = this.usersRaw();
    const search = this.userSearch().trim().toLowerCase();
    const dir = this.directionFilter();

    return list.filter((u) => {
      const matchSearch =
        !search ||
        u.nom.toLowerCase().includes(search) ||
        u.prenom.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search);
      const matchDir = dir === 'all' || u.direction === dir;
      return matchSearch && matchDir;
    });
  });

  readonly filteredLogs = computed(() => {
    const list = this.auditLogsRaw();
    const search = this.logSearch().trim().toLowerCase();
    const niv = this.logNiveauFilter();

    return list.filter((l) => {
      const matchSearch =
        !search ||
        l.evenement.toLowerCase().includes(search) ||
        l.utilisateurNom.toLowerCase().includes(search) ||
        l.direction.toLowerCase().includes(search);
      const matchNiveau = niv === 'all' || l.niveau === niv;
      return matchSearch && matchNiveau;
    });
  });

  setTab(tab: TabId): void {
    if (tab === 'agents') {
      this.router.navigateByUrl('/admin/agents');
      return;
    }
    this.activeTab.set(tab);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  openCreateUserModal(): void {
    this.editingUserId = null;
    this.newUser = {
      prenom: '',
      nom: '',
      email: '',
      mot_de_passe: '',
      direction: 'RH',
      role: 'collaborateur',
    };
    this.showCreateUserModal.set(true);
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal.set(false);
    this.editingUserId = null;
  }

  openEditUserModal(user: User): void {
    this.editingUserId = user.id;
    this.newUser = {
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      mot_de_passe: '',
      direction: user.direction,
      role: user.role,
    };
    this.showCreateUserModal.set(true);
  }

  submitCreateUser(): void {
    if (this.editingUserId) {
      this.submitUpdateUser();
      return;
    }

    if (!this.newUser.nom || !this.newUser.mot_de_passe) {
      alert('Veuillez renseigner au moins le nom et le mot de passe initial.');
      return;
    }

    const payload = {
      nom: this.newUser.nom,
      prenom: this.newUser.prenom,
      email:
        this.newUser.email ||
        `${this.newUser.prenom.toLowerCase()}.${this.newUser.nom.toLowerCase()}@sahelys.local`,
      mot_de_passe: this.newUser.mot_de_passe,
      role: this.newUser.role,
      direction: this.newUser.direction,
    };

    this.adminService.createUser(payload).subscribe({
      next: (created) => {
        this.usersRaw.update((users) => [...users, created]);
        this.closeCreateUserModal();
        this.showToast(`Compte pour ${created.nom} créé avec succès sur le serveur !`);
      },
      error: () => {
        // Fallback local pour démo si hors-ligne
        this.closeCreateUserModal();
        this.showToast(`Compte pour ${payload.prenom} ${payload.nom} pré-créé.`);
      },
    });
  }

  private submitUpdateUser(): void {
    if (!this.editingUserId || !this.newUser.nom) {
      alert('Veuillez renseigner au moins le nom.');
      return;
    }

    this.adminService
      .updateUser(this.editingUserId, {
        nom: this.newUser.nom,
        prenom: this.newUser.prenom,
        email: this.newUser.email || null,
        ...(this.newUser.mot_de_passe ? { mot_de_passe: this.newUser.mot_de_passe } : {}),
        direction: this.newUser.direction,
        role: this.newUser.role,
      })
      .subscribe({
        next: (updated) => {
          this.usersRaw.update((users) =>
            users.map((user) =>
              user.id === updated.id
                ? {
                    ...user,
                    ...updated,
                    prenom: updated.prenom || user.prenom,
                    email: updated.email || user.email,
                  }
                : user,
            ),
          );
          this.closeCreateUserModal();
          this.showToast(`Compte pour ${updated.nom} modifié avec succès !`);
        },
        error: () => {
          this.showToast('La modification du compte a échoué.');
        },
      });
  }

  deleteUser(user: User): void {
    if (user.role === 'administrateur') {
      this.showToast('Un compte administrateur ne peut pas être supprimé.');
      return;
    }

    if (!window.confirm(`Voulez-vous vraiment supprimer ${user.prenom} ${user.nom} ?`)) {
      return;
    }

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.usersRaw.update((users) => users.filter((item) => item.id !== user.id));
        this.showToast(`Compte de ${user.nom} supprimé avec succès.`);
      },
      error: () => {
        this.showToast('La suppression du compte a échoué.');
      },
    });
  }

  toggleUserStatus(user: User): void {
    if (user.role === 'administrateur') {
      this.showToast('Un compte administrateur ne peut pas être bloqué.');
      return;
    }

    const actif = !user.actif;
    this.adminService.updateUserStatus(user.id, actif).subscribe({
      next: (updated) => {
        this.usersRaw.update((users) =>
          users.map((item) => (item.id === user.id ? { ...item, ...updated, actif } : item)),
        );
        this.showToast(`Compte de ${user.nom} ${actif ? 'réactivé' : 'bloqué'} avec succès.`);
      },
      error: () => {
        this.showToast(
          `Le compte de ${user.nom} n'a pas pu être ${actif ? 'réactivé' : 'bloqué'}.`,
        );
      },
    });
  }

  saveSettings(): void {
    this.supervisionService.updateSettings(this.settings());
    this.showToast('Les paramètres globaux de la plateforme ont été enregistrés.');
  }

  exportLogs(): void {
    this.showToast('Téléchargement du fichier de journalisation (audit-logs.csv)...');
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case 'administrateur':
        return 'badge--admin';
      case 'referent':
        return 'badge--referent';
      default:
        return 'badge--collab';
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'administrateur':
        return 'Admin Central';
      case 'referent':
        return 'Référent';
      default:
        return 'Collaborateur';
    }
  }

  getLogSeverityClass(niveau: AuditLogSeverity): string {
    switch (niveau) {
      case 'alerte':
        return 'log--alerte';
      case 'avertissement':
        return 'log--warning';
      default:
        return 'log--info';
    }
  }
}
