/**
 * Talks to the backend's AI chat endpoint, which extracts Mutual NDA cover
 * page field values from the conversation and returns the model's next reply.
 */

import { NdaFormData } from "./nda";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatTurn {
  reply: string;
  fields: NdaFormData;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  fields: NdaFormData,
): Promise<ChatTurn> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, fields }),
  });

  if (!response.ok) {
    throw new Error("AI chat is unavailable right now.");
  }

  return response.json();
}
