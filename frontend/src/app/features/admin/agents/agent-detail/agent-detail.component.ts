import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import {
  LucideDynamicIcon,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
  LucideEye,
  LucideFlag,
  LucideUsers,
  LucideMonitor,
  LucideBot,
  LucideCheck,
  LucideFileText,
  LucideArrowLeft,
} from '@lucide/angular';

import type { Agent } from '../../../../shared/models/agent.model';
import type { AgentDocument } from '../../../../shared/models/document.model';
import type { User } from '../../../../shared/models/user.model';
import type { Autorisation } from '../../../../shared/models/autorisation.model';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

type TabId = 'general' | 'documents' | 'acces' | 'qualite';

const QUALITY_MOCK = {
  questionsCount: 312,
  satisfaction: 94,
  signalees: 7,
  feedbacks: [
    { initiale: 'C', question: 'Où trouver le formulaire de demande de congés ?', reponse: 'Bonjour Camille, le formulaire...', date: '14 Mar 2026, 09:30', statut: 'bonne' },
    { initiale: 'R', question: 'Puis-je reporter mes congés non pris ?', reponse: 'Bonjour Robert, oui... (snipped)', date: '14 Mar 2026, 10:15', statut: 'bonne' },
    { initiale: 'M', question: 'Les tickets restaurant sont-ils revalorisés ?', reponse: "Bonjour Michel, l'information... (snipped)", date: '14 Mar 2026, 11:00', statut: 'signalee' },
    { initiale: 'G', question: 'Comment contacter la mutuelle santé ?', reponse: 'Bonjour Gaelle, vous pouvez... (sn)', date: '14 Mar 2026, 14:00', statut: 'bonne' },
    { initiale: 'S', question: 'Quels sont les jours fériés en 2027 ?', reponse: 'Bonjour Sylvain, les jours... (snipp)', date: '14 Mar 2026, 15:30', statut: 'bonne' },
  ],
};

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    NgClass,
    NgFor,
    NgIf,
    RouterLink,
    TitleCasePipe,
    LucideDynamicIcon,
    HeaderComponent,
  ],
  templateUrl: './agent-detail.component.html',
  styleUrl: './agent-detail.component.scss',
})
export class AgentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockDataService = inject(MockDataService);

  readonly activeTab$ = new BehaviorSubject<TabId>('general');
  activeTab: TabId = 'general';

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'general', label: 'Général' },
    { id: 'documents', label: 'Documents' },
    { id: 'acces', label: 'Accès' },
    { id: 'qualite', label: 'Qualité' },
  ];

  docSearch = '';
  private readonly docSearch$ = new BehaviorSubject<string>('');

  userSearch = '';
  private readonly userSearch$ = new BehaviorSubject<string>('');

  accesGlobal = false;
  readonly quality = QUALITY_MOCK;

  readonly Plus = LucidePlus;
  readonly Search = LucideSearch;
  readonly Trash2 = LucideTrash2;
  readonly Eye = LucideEye;
  readonly Flag = LucideFlag;
  readonly Users = LucideUsers;
  readonly Monitor = LucideMonitor;
  readonly Bot = LucideBot;
  readonly Check = LucideCheck;
  readonly FileText = LucideFileText;
  readonly ArrowLeft = LucideArrowLeft;

  private readonly agentId$ = this.route.paramMap.pipe(map((p) => p.get('id') ?? ''));

  readonly agent$: Observable<Agent | undefined> = this.agentId$.pipe(
    switchMap((id) => this.mockDataService.getAgentById(id)),
  );

  readonly documents$: Observable<AgentDocument[]> = combineLatest([
    this.agentId$.pipe(switchMap((id) => this.mockDataService.getDocumentsByAgent(id))),
    this.docSearch$,
  ]).pipe(
    map(([docs, search]) =>
      search.trim()
        ? docs.filter((d) => d.nom.toLowerCase().includes(search.toLowerCase()))
        : docs,
    ),
  );

  readonly autorisations$: Observable<Autorisation[]> = this.agentId$.pipe(
    switchMap((id) => this.mockDataService.getAutorisationsByAgent(id)),
  );

  readonly allUsers$: Observable<User[]> = combineLatest([
    this.mockDataService.getUsers(),
    this.userSearch$,
  ]).pipe(
    map(([users, search]) =>
      search.trim()
        ? users.filter(
            (u) =>
              u.nom.toLowerCase().includes(search.toLowerCase()) ||
              u.prenom.toLowerCase().includes(search.toLowerCase()),
          )
        : users,
    ),
  );

  ngOnInit(): void {}

  setTab(tab: TabId): void {
    this.activeTab = tab;
    this.activeTab$.next(tab);
  }

  updateDocSearch(value: string): void {
    this.docSearch = value;
    this.docSearch$.next(value);
  }

  updateUserSearch(value: string): void {
    this.userSearch = value;
    this.userSearch$.next(value);
  }

  getIconForAgent(agentId: string) {
    if (agentId.includes('rh')) return this.Users;
    if (agentId.includes('it')) return this.Monitor;
    return this.Bot;
  }

  getIconClass(agentId: string): string {
    if (agentId.includes('rh')) return 'icon-rh';
    if (agentId.includes('it')) return 'icon-it';
    return '';
  }

  deleteDocument(docId: string): void {
    this.mockDataService.deleteDocument(docId);
  }

  isUserAuthorized(userId: string, autorisations: Autorisation[]): boolean {
    return autorisations.some((a) => a.utilisateurId === userId);
  }

  toggleUserAccess(userId: string, agentId: string, autorisations: Autorisation[]): void {
    if (this.isUserAuthorized(userId, autorisations)) {
      this.mockDataService.removeAutorisation(agentId, userId);
    } else {
      this.mockDataService.addAutorisation({
        id: `auth-${Date.now()}`,
        agentId,
        utilisateurId: userId,
        dateAttribution: new Date().toISOString().split('T')[0],
      });
    }
  }

  onFileSelected(event: Event, agentId: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).forEach((file, i) => {
      this.mockDataService.addDocument({
        id: `doc-upload-${Date.now()}-${i}`,
        agentId,
        nom: file.name,
        format: file.name.split('.').pop() ?? 'pdf',
        dateAjout: new Date().toISOString().split('T')[0],
        statutIndexation: 'en_attente',
        confidentialite: 'interne',
      });
    });
    input.value = '';
  }

  updateAgentStatut(agent: Agent, statut: Agent['statut']): void {
    this.mockDataService.updateAgent({ ...agent, statut });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'publié':    return 'status--publie';
      case 'brouillon': return 'status--brouillon';
      case 'désactivé': return 'status--desactive';
      default:          return 'status--brouillon';
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/admin/agents');
  }
}
