import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

import type { Agent } from '../../shared/models/agent.model';
import type { AgentDocument } from '../../shared/models/document.model';
import type { Conversation } from '../../shared/models/conversation.model';
import type { User } from '../../shared/models/user.model';
import type { Autorisation } from '../../shared/models/autorisation.model';

import { AGENTS_MOCK } from '../mocks/agents.mock';
import { CONVERSATIONS_MOCK } from '../mocks/conversations.mock';
import { DOCUMENTS_MOCK } from '../mocks/documents.mock';
import { USERS_MOCK } from '../mocks/users.mock';
import { AUTORISATIONS_MOCK } from '../mocks/autorisations.mock';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  // --- État en mémoire via BehaviorSubject ---
  private readonly _agents$ = new BehaviorSubject<Agent[]>([...AGENTS_MOCK]);
  private readonly _documents$ = new BehaviorSubject<AgentDocument[]>([...DOCUMENTS_MOCK]);
  private readonly _conversations$ = new BehaviorSubject<Conversation[]>([...CONVERSATIONS_MOCK]);
  private readonly _autorisations$ = new BehaviorSubject<Autorisation[]>([...AUTORISATIONS_MOCK]);

  // --- Utilisateurs (lecture seule en Phase 1) ---
  getUsers(): Observable<User[]> {
    return new BehaviorSubject<User[]>(USERS_MOCK).asObservable();
  }

  getUserById(userId: string): Observable<User | undefined> {
    return new BehaviorSubject<User | undefined>(
      USERS_MOCK.find((user) => user.id === userId),
    ).asObservable();
  }

  // --- Agents ---
  getAgents(): Observable<Agent[]> {
    return this._agents$.asObservable();
  }

  getAgentById(agentId: string): Observable<Agent | undefined> {
    return this._agents$.pipe(map((agents) => agents.find((a) => a.id === agentId)));
  }

  createAgent(agent: Agent): void {
    const current = this._agents$.getValue();
    this._agents$.next([...current, agent]);
  }

  updateAgent(updated: Agent): void {
    const current = this._agents$.getValue();
    this._agents$.next(current.map((a) => (a.id === updated.id ? updated : a)));
  }

  // --- Documents ---
  getDocuments(): Observable<AgentDocument[]> {
    return this._documents$.asObservable();
  }

  getDocumentsByAgent(agentId: string): Observable<AgentDocument[]> {
    return this._documents$.pipe(map((docs) => docs.filter((d) => d.agentId === agentId)));
  }

  getDocumentById(documentId: string): Observable<AgentDocument | undefined> {
    return this._documents$.pipe(map((docs) => docs.find((d) => d.id === documentId)));
  }

  addDocument(document: AgentDocument): void {
    const current = this._documents$.getValue();
    this._documents$.next([...current, document]);
  }

  updateDocumentStatus(
    documentId: string,
    statut: AgentDocument['statutIndexation'],
  ): void {
    const current = this._documents$.getValue();
    this._documents$.next(
      current.map((d) => (d.id === documentId ? { ...d, statutIndexation: statut } : d)),
    );
  }

  deleteDocument(documentId: string): void {
    const current = this._documents$.getValue();
    this._documents$.next(current.filter((d) => d.id !== documentId));
  }

  // --- Conversations ---
  getConversations(): Observable<Conversation[]> {
    return this._conversations$.asObservable();
  }

  getConversationById(conversationId: string): Observable<Conversation | undefined> {
    return this._conversations$.pipe(
      map((convs) => convs.find((c) => c.id === conversationId)),
    );
  }

  getConversationsByUser(userId: string): Observable<Conversation[]> {
    return this._conversations$.pipe(
      map((convs) => convs.filter((c) => c.utilisateurId === userId)),
    );
  }

  getConversationsByAgent(agentId: string): Observable<Conversation[]> {
    return this._conversations$.pipe(
      map((convs) => convs.filter((c) => c.agentId === agentId)),
    );
  }

  // --- Autorisations ---
  getAutorisationsByAgent(agentId: string): Observable<Autorisation[]> {
    return this._autorisations$.pipe(
      map((auths) => auths.filter((a) => a.agentId === agentId)),
    );
  }

  addAutorisation(autorisation: Autorisation): void {
    const current = this._autorisations$.getValue();
    // Eviter les doublons
    const exists = current.some(
      (a) => a.agentId === autorisation.agentId && a.utilisateurId === autorisation.utilisateurId,
    );
    if (!exists) {
      this._autorisations$.next([...current, autorisation]);
    }
  }

  removeAutorisation(agentId: string, utilisateurId: string): void {
    const current = this._autorisations$.getValue();
    this._autorisations$.next(
      current.filter((a) => !(a.agentId === agentId && a.utilisateurId === utilisateurId)),
    );
  }
}