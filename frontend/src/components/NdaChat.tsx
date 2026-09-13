"use client";

import { FormEvent, useState } from "react";
import { NdaFormData } from "@/lib/nda";
import { ChatMessage, sendChatMessage } from "@/lib/ndaChat";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! Let's set up your Mutual NDA. To start, who are the two parties entering into this agreement?",
};

interface NdaChatProps {
  fields: NdaFormData;
  onFieldsChange: (fields: NdaFormData) => void;
}

/** Freeform chat that fills in the NDA fields via the backend AI endpoint. */
export default function NdaChat({ fields, onFieldsChange }: NdaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(false);

    try {
      const turn = await sendChatMessage(nextMessages, fields);
      setMessages([...nextMessages, { role: "assistant", content: turn.reply }]);
      onFieldsChange(turn.fields);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <p
            key={index}
            className={
              message.role === "assistant"
                ? "max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-900"
                : "ml-auto max-w-[85%] rounded-lg bg-[#209dd7] px-3 py-2 text-sm text-white"
            }
          >
            {message.content}
          </p>
        ))}
        {sending ? <p className="text-xs text-[#888888]">Thinking…</p> : null}
        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            Something went wrong reaching the AI. Please try again.
          </p>
        ) : null}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#209dd7] focus:ring-1 focus:ring-[#209dd7]"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your answer…"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
