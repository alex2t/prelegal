/**
 * Talks to the backend's AI chat endpoint, which routes a freeform
 * conversation to one of the supported document types and, once decided,
 * extracts that document's field values, returning the model's next reply.
 */

export type DocumentType = "mutual_nda" | "design_partner_agreement" | "pilot_agreement";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatTurn {
  reply: string;
  documentType: DocumentType | null;
  fields: Record<string, unknown>;
}

/**
 * Applies a chat turn's field snapshot on top of the previous state, keeping
 * an existing non-blank value (e.g. the client-filled default effective
 * date, or Design Partner's "None."/"12 months" defaults) wherever the model
 * returned a blank string for a field it simply hasn't addressed yet.
 */
export function mergeFields(
  previous: Record<string, unknown>,
  incoming: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...previous };
  for (const key of Object.keys(incoming)) {
    const value = incoming[key];
    const previousValue = previous[key];
    if (value === "" && typeof previousValue === "string" && previousValue !== "") {
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  documentType: DocumentType | null,
  fields: Record<string, unknown>,
): Promise<ChatTurn> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, document_type: documentType, fields }),
  });

  if (!response.ok) {
    throw new Error("AI chat is unavailable right now.");
  }

  const body = await response.json();
  return {
    reply: body.reply,
    documentType: body.document_type,
    fields: body.fields,
  };
}
