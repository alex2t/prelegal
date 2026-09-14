/** Talks to the backend's saved-document endpoints (list/fetch a user's previously generated documents). */

import { DocumentType } from "./documentChat";

export interface DocumentSummary {
  id: number;
  documentType: DocumentType;
  title: string;
  createdAt: string;
}

export interface SavedDocument extends DocumentSummary {
  fields: Record<string, unknown>;
}

interface DocumentSummaryWire {
  id: number;
  document_type: DocumentType;
  title: string;
  created_at: string;
}

interface SavedDocumentWire extends DocumentSummaryWire {
  fields: Record<string, unknown>;
}

export async function listDocuments(): Promise<DocumentSummary[]> {
  const response = await fetch("/api/documents", { credentials: "include" });
  if (!response.ok) {
    throw new Error("Failed to load your documents.");
  }
  const body: DocumentSummaryWire[] = await response.json();
  return body.map((doc) => ({
    id: doc.id,
    documentType: doc.document_type,
    title: doc.title,
    createdAt: doc.created_at,
  }));
}

/** Best-effort: callers shouldn't block the user's download on this succeeding. */
export async function saveDocument(
  documentType: DocumentType,
  title: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await fetch("/api/documents", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_type: documentType, title, fields }),
  }).catch(() => {});
}

export async function getDocument(id: number): Promise<SavedDocument> {
  const response = await fetch(`/api/documents/${id}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Failed to load that document.");
  }
  const doc: SavedDocumentWire = await response.json();
  return {
    id: doc.id,
    documentType: doc.document_type,
    title: doc.title,
    createdAt: doc.created_at,
    fields: doc.fields,
  };
}
