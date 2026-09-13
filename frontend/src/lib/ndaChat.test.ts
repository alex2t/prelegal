import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultFormData } from "./nda";
import { sendChatMessage } from "./ndaChat";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendChatMessage", () => {
  it("posts the conversation and current fields, and returns the parsed turn", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Got it.", fields: defaultFormData }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const messages = [{ role: "user" as const, content: "Acme, Inc. and Globex Corp." }];
    const turn = await sendChatMessage(messages, defaultFormData);

    expect(turn).toEqual({ reply: "Got it.", fields: defaultFormData });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, fields: defaultFormData }),
      }),
    );
  });

  it("throws when the backend responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }),
    );

    await expect(sendChatMessage([], defaultFormData)).rejects.toThrow(
      "AI chat is unavailable right now.",
    );
  });
});
