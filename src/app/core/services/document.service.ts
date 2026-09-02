import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { AgentDocument, DocumentConfidentialite, DocumentIndexationStatus } from '../../shared/models/document.model';
import type { DocumentApiResponse } from '../../shared/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Récupère la liste des documents associés à un agent
   */
  getDocuments(agentId: string): Observable<AgentDocument[]> {
    return this.http.get<DocumentApiResponse[]>(`${this.apiUrl}/agents/${agentId}/documents`).pipe(
      map((docs) => docs.map((d) => this.mapDocumentFromApi(d)))
    );
  }

  /**
   * Envoie (upload) un nouveau fichier RAG pour un agent (multipart/form-data)
   */
  uploadDocument(agentId: string, file: File): Observable<AgentDocument> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<DocumentApiResponse>(`${this.apiUrl}/agents/${agentId}/documents`, formData).pipe(
      map((d) => this.mapDocumentFromApi(d))
    );
  }

  /**
   * Supprime un document de la base RAG
   */
  deleteDocument(documentId: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${documentId}`).pipe(
      map(() => true)
    );
  }

  // =========================================================================
  // 🔀 FONCTION DE CONVERSION (Traducteur DTO Backend -> Modèle Frontend)
  // =========================================================================

  private mapDocumentFromApi(doc: DocumentApiResponse): AgentDocument {
    const docName = doc.nom || doc.nom_fichier || 'Document';
    const ext = docName.split('.').pop()?.toUpperCase() ?? 'PDF';
    const dateStr = doc.date_ajout || doc.date_upload || new Date().toISOString();

    return {
      id: doc.id,
      agentId: doc.agent_id,
      nom: docName,
      format: ext,
      dateAjout: dateStr,
      statutIndexation: (doc.statut_indexation as DocumentIndexationStatus) || 'indexe',
      confidentialite: (doc.niveau_confidentialite === 'standard' ? 'interne' : doc.niveau_confidentialite) as DocumentConfidentialite,
    };
  }
}
