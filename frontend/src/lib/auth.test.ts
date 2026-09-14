import { afterEach, describe, expect, it, vi } from "vitest";
import { currentUser, signIn, signOut, signUp } from "./auth";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("signUp", () => {
  it("posts credentials and returns the created user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: "a@example.com" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = await signUp("a@example.com", "correct horse");

    expect(user).toEqual({ email: "a@example.com" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/signup",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "a@example.com", password: "correct horse" }),
      }),
    );
  });

  it("throws the backend's error detail on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "An account with that email already exists." }),
      }),
    );

    await expect(signUp("a@example.com", "correct horse")).rejects.toThrow(
      "An account with that email already exists.",
    );
  });
});

describe("signIn", () => {
  it("posts credentials and returns the signed-in user", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: "a@example.com" }) }),
    );

    const user = await signIn("a@example.com", "correct horse");
    expect(user).toEqual({ email: "a@example.com" });
  });

  it("throws a fallback message when the error body has no detail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    await expect(signIn("a@example.com", "wrong")).rejects.toThrow("Sign in failed.");
  });
});

describe("currentUser", () => {
  it("returns the user when a session is active", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: "a@example.com" }) }),
    );

    expect(await currentUser()).toEqual({ email: "a@example.com" });
  });

  it("returns null when there's no active session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    expect(await currentUser()).toBeNull();
  });
});

describe("signOut", () => {
  it("posts to the signout endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await signOut();

    expect(fetchMock).toHaveBeenCalledWith("/api/signout", { method: "POST", credentials: "include" });
  });
});
