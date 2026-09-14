import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGreeting, mergeFields, sendChatMessage } from "./documentChat";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendChatMessage", () => {
  it("posts the conversation, document type, and fields, translating the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "Got it.",
        document_type: "mutual_nda",
        fields: { purpose: "Evaluating a partnership." },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const messages = [{ role: "user" as const, content: "Acme, Inc. and Globex Corp." }];
    const turn = await sendChatMessage(messages, null, {});

    expect(turn).toEqual({
      reply: "Got it.",
      documentType: "mutual_nda",
      fields: { purpose: "Evaluating a partnership." },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, document_type: null, fields: {} }),
      }),
    );
  });

  it("stays undecided when the backend hasn't picked a document type yet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reply: "What kind of agreement?", document_type: null, fields: {} }),
      }),
    );

    const turn = await sendChatMessage([], null, {});
    expect(turn.documentType).toBeNull();
  });

  it("throws when the backend responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );

    await expect(sendChatMessage([], null, {})).rejects.toThrow(
      "AI chat is unavailable right now.",
    );
  });
});

describe("buildGreeting", () => {
  it("lists every document name as a bullet point", () => {
    const greeting = buildGreeting(["Mutual NDA", "Pilot Agreement"]);
    expect(greeting.role).toBe("assistant");
    expect(greeting.content).toContain("- Mutual NDA");
    expect(greeting.content).toContain("- Pilot Agreement");
  });
});

describe("mergeFields", () => {
  it("keeps an existing non-blank value when the model returns a blank for it", () => {
    const previous = { effectiveDate: "2026-09-13", governingLaw: "" };
    const incoming = { effectiveDate: "", governingLaw: "" };

    expect(mergeFields(previous, incoming)).toEqual({
      effectiveDate: "2026-09-13",
      governingLaw: "",
    });
  });

  it("applies a non-blank incoming value even when a previous value existed", () => {
    const previous = { effectiveDate: "2026-09-13" };
    const incoming = { effectiveDate: "2026-10-01" };

    expect(mergeFields(previous, incoming)).toEqual({ effectiveDate: "2026-10-01" });
  });

  it("applies incoming non-string values (e.g. nested objects) as-is", () => {
    const previous = { party1: { company: "" } };
    const incoming = { party1: { company: "Acme, Inc." } };

    expect(mergeFields(previous, incoming)).toEqual({ party1: { company: "Acme, Inc." } });
  });

  it("fills a previously blank field from the incoming value", () => {
    const previous = { purpose: "" };
    const incoming = { purpose: "Evaluating a partnership." };

    expect(mergeFields(previous, incoming)).toEqual({ purpose: "Evaluating a partnership." });
  });
});
