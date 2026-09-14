import { afterEach, describe, expect, it, vi } from "vitest";
import { getDocument, listDocuments, saveDocument } from "./documentHistory";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listDocuments", () => {
  it("translates the wire format's document_type/created_at to camelCase", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 1, document_type: "mutual_nda", title: "Acme and Globex", created_at: "2026-09-14 10:00:00" },
        ],
      }),
    );

    const summaries = await listDocuments();

    expect(summaries).toEqual([
      { id: 1, documentType: "mutual_nda", title: "Acme and Globex", createdAt: "2026-09-14 10:00:00" },
    ]);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(listDocuments()).rejects.toThrow("Failed to load your documents.");
  });
});

describe("getDocument", () => {
  it("fetches a single document and translates it to camelCase", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        document_type: "pilot_agreement",
        title: "Acme",
        created_at: "2026-09-14 10:00:00",
        fields: { provider: "Acme" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const doc = await getDocument(1);

    expect(doc).toEqual({
      id: 1,
      documentType: "pilot_agreement",
      title: "Acme",
      createdAt: "2026-09-14 10:00:00",
      fields: { provider: "Acme" },
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/documents/1", { credentials: "include" });
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(getDocument(1)).rejects.toThrow("Failed to load that document.");
  });
});

describe("saveDocument", () => {
  it("posts the document in wire format", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await saveDocument("mutual_nda", "Acme and Globex", { purpose: "Evaluating a partnership." });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/documents",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          document_type: "mutual_nda",
          title: "Acme and Globex",
          fields: { purpose: "Evaluating a partnership." },
        }),
      }),
    );
  });

  it("does not throw when the request fails (best-effort save)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    await expect(saveDocument("mutual_nda", "Acme", {})).resolves.toBeUndefined();
  });
});
