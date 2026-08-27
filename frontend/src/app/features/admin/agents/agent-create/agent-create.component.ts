import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideX,
  LucideCheck,
  LucideUpload,
  LucideTrash2,
  LucideUsers,
  LucideUserCheck,
} from '@lucide/angular';

import type { Agent, AgentStatus } from '../../../../shared/models/agent.model';
import type { AgentDocument } from '../../../../shared/models/document.model';
import type { Direction } from '../../../../shared/models/user.model';
import { MockDataService } from '../../../../core/services/mock-data.service';
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
  private readonly mockDataService = inject(MockDataService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  currentStep = 1;
  readonly totalSteps = 5;

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
  ];

  readonly tons: { value: TonAgent; label: string }[] = [
    { value: 'formel', label: 'Formel' },
    { value: 'neutre', label: 'Neutre' },
    { value: 'convivial', label: 'Convivial' },
  ];

  readonly utilisateurs$ = this.mockDataService.getUsers();

  readonly wizardForm = this.fb.group({
    step1: this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      direction: [this.sessionService.getCurrentUser()?.direction ?? 'RH', Validators.required],
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
    
    // Ajout des nouveaux fichiers sans doublons de nom
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

  // --- Étape 5 : publication ---
  publishAgent(statut: AgentStatus): void {
    const step1 = this.wizardForm.value.step1;
    const step2 = this.wizardForm.value.step2;
    const step4 = this.wizardForm.value.step4;

    if (!step1 || !step2 || !step4) return;

    const direction = (step1.direction as Direction) || 'RH';
    const newId = `agent-${direction.toLowerCase()}-${Date.now()}`;
    
    const agent: Agent = {
      id: newId,
      nom: step1.nom || '',
      description: step1.description || '',
      instructions: step4.instructions || '',
      direction,
      statut,
    };

    this.mockDataService.createAgent(agent);

    // Simuler l'ajout de documents à partir des objets File réels
    const files = (step2.documents as File[]) || [];
    files.forEach((file, i) => {
      const doc: AgentDocument = {
        id: `doc-new-${Date.now()}-${i}`,
        agentId: newId,
        nom: file.name,
        format: file.name.split('.').pop() ?? 'pdf',
        dateAjout: new Date().toISOString().split('T')[0],
        statutIndexation: 'en_attente',
        confidentialite: 'interne',
      };
      this.mockDataService.addDocument(doc);
    });

    this.router.navigateByUrl('/admin/agents');
  }

  get directionLabel(): string {
    const dir = this.wizardForm.get('step1.direction')?.value;
    return this.directions.find((d) => d.value === dir)?.label ?? '';
  }
}
