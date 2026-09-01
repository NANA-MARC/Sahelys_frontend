import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import {
  LucideDynamicIcon,
  LucideX,
  LucideCheck,
  LucideUpload,
  LucideTrash2,
  LucideUsers,
  LucideUserCheck,
} from '@lucide/angular';

import type { AgentStatus } from '../../../../shared/models/agent.model';
import type { Direction } from '../../../../shared/models/user.model';
import { AgentService } from '../../../../core/services/agent.service';
import { DocumentService } from '../../../../core/services/document.service';
import { AdminService } from '../../../../core/services/admin.service';
import { SessionService } from '../../../../core/auth/session.service';

type TonAgent = 'formel' | 'neutre' | 'convivial';

@Component({
  selector: 'app-agent-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './agent-create.component.html',
  styleUrl: './agent-create.component.scss',
})
export class AgentCreateComponent {
  private readonly agentService = inject(AgentService);
  private readonly documentService = inject(DocumentService);
  private readonly adminService = inject(AdminService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  currentStep = 1;
  readonly totalSteps = 5;
  isSaving = false;
  errorMessage: string | null = null;

  readonly currentUser = this.sessionService.currentUser();
  readonly isCentralAdmin = this.currentUser?.role === 'administrateur';
  readonly userDirection = this.currentUser?.direction ?? 'RH';

  readonly steps = [
    { num: 1, label: 'Nom & rôle' },
    { num: 2, label: 'Documents' },
    { num: 3, label: 'Utilisateurs' },
    { num: 4, label: 'Instructions' },
    { num: 5, label: 'Publication' },
  ];

  readonly directions: { value: Direction; label: string }[] = [
    { value: 'RH', label: 'Ressources Humaines' },
    { value: 'IT', label: 'Informatique' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Commercial', label: 'Commercial' },
  ];

  readonly tons: { value: TonAgent; label: string }[] = [
    { value: 'formel', label: 'Formel' },
    { value: 'neutre', label: 'Neutre' },
    { value: 'convivial', label: 'Convivial' },
  ];

  readonly utilisateurs$ = this.adminService.getUsers().pipe(
    map((users) => {
      if (this.isCentralAdmin || !this.userDirection) return users;
      const userDir = this.userDirection.trim().toLowerCase();
      return users.filter((u) => u.direction && u.direction.trim().toLowerCase() === userDir);
    }),
    catchError(() => of([]))
  );

  readonly wizardForm = this.fb.group({
    step1: this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      direction: [{ value: this.userDirection, disabled: !this.isCentralAdmin }, Validators.required],
    }),
    step2: this.fb.group({
      documents: [[] as File[]],
    }),
    step3: this.fb.group({
      utilisateurIds: [[] as string[]],
    }),
    step4: this.fb.group({
      instructions: ['', Validators.required],
      ton: ['neutre' as TonAgent, Validators.required],
    }),
  });

  // Lucide icons
  readonly X = LucideX;
  readonly Check = LucideCheck;
  readonly Upload = LucideUpload;
  readonly Trash2 = LucideTrash2;
  readonly Users = LucideUsers;
  readonly UserCheck = LucideUserCheck;

  // --- Navigation wizard ---
  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  next(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previous(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canGoNext(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.wizardForm.get('step1')?.valid ?? false;
      case 4:
        return this.wizardForm.get('step4')?.valid ?? false;
      default:
        return true;
    }
  }

  // --- Étape 2 : Gestion des fichiers réels ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;
    
    const docsControl = this.wizardForm.get('step2.documents');
    const currentFiles = docsControl?.value ?? [];
    
    const newFiles = Array.from(files).filter(
      (f) => !currentFiles.some((cf: File) => cf.name === f.name)
    );
    
    docsControl?.setValue([...currentFiles, ...newFiles]);
    input.value = '';
  }

  removeDocument(name: string): void {
    const docsControl = this.wizardForm.get('step2.documents');
    const currentFiles = docsControl?.value ?? [];
    docsControl?.setValue(currentFiles.filter((f: File) => f.name !== name));
  }

  get currentDocuments(): File[] {
    return this.wizardForm.get('step2.documents')?.value ?? [];
  }

  // --- Étape 3 : sélection d'utilisateurs ---
  toggleUser(userId: string): void {
    const idsControl = this.wizardForm.get('step3.utilisateurIds');
    const currentIds = (idsControl?.value ?? []) as string[];
    const index = currentIds.indexOf(userId);
    
    if (index === -1) {
      idsControl?.setValue([...currentIds, userId]);
    } else {
      idsControl?.setValue(currentIds.filter((id) => id !== userId));
    }
  }

  isUserSelected(userId: string): boolean {
    const currentIds = (this.wizardForm.get('step3.utilisateurIds')?.value ?? []) as string[];
    return currentIds.includes(userId);
  }

  get cancelUrl(): string {
    return '/admin/agents';
  }

  // --- Étape 5 : publication via API ---
  publishAgent(statut: AgentStatus): void {
    const rawForm = this.wizardForm.getRawValue();
    const step1 = rawForm.step1;
    const step2 = rawForm.step2;
    const step3 = rawForm.step3;
    const step4 = rawForm.step4;

    if (!step1 || !step4 || this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = null;

    const payload = {
      nom: step1.nom || '',
      description: step1.description || '',
      system_prompt: step4.instructions || '',
    };

    // 1. Création de l'agent
    this.agentService.createAgent(payload).subscribe({
      next: (createdAgent) => {
        const files = (step2?.documents as File[]) || [];
        const userIds = (step3?.utilisateurIds as string[]) || [];

        // 2. Upload des documents RAG si présent
        const uploadPromises = files.map((file) =>
          this.documentService.uploadDocument(createdAgent.id, file).toPromise()
        );

        // 3. Attribution des accès spécifiques si présent
        const grantPromises = userIds.map((uId) =>
          this.agentService.grantAccess(createdAgent.id, uId).toPromise()
        );

        Promise.allSettled([...uploadPromises, ...grantPromises]).then((results) => {
          this.isSaving = false;
          const rejected = results.filter((r) => r.status === 'rejected');
          if (rejected.length > 0) {
            console.warn(`[AgentCreate] Agent créé mais ${rejected.length} opération(s) secondaire(s) ont échoué.`);
          }
          this.router.navigateByUrl(this.cancelUrl);
        });
      },
      error: (err: HttpErrorResponse | Error) => {
        this.isSaving = false;
        if ('error' in err && err.error?.detail) {
          const detail = err.error.detail;
          this.errorMessage = typeof detail === 'string' ? detail : 'Accès refusé par le serveur backend (HTTP 403).';
        } else {
          this.errorMessage = err.message || 'Échec de la création de l\'agent.';
        }
      },
    });
  }

  get directionLabel(): string {
    return this.userDirection;
  }
}
