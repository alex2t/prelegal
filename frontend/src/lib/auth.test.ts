import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { currentEmail, isAuthenticated, login, logout } from "./auth";

// vitest runs in the "node" environment (no jsdom), so `window` is undefined
// unless a test opts into a fake one via vi.stubGlobal.
function stubBrowser() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("without a browser environment", () => {
  it("reports unauthenticated and no-ops on login/logout", () => {
    expect(isAuthenticated()).toBe(false);
    expect(currentEmail()).toBeNull();
    expect(() => login("a@example.com")).not.toThrow();
    expect(() => logout()).not.toThrow();
  });
});

describe("with a browser environment", () => {
  beforeEach(() => {
    stubBrowser();
  });

  it("starts unauthenticated", () => {
    expect(isAuthenticated()).toBe(false);
    expect(currentEmail()).toBeNull();
  });

  it("becomes authenticated after login, and remembers the email", () => {
    login("a@example.com");
    expect(isAuthenticated()).toBe(true);
    expect(currentEmail()).toBe("a@example.com");
  });

  it("clears the session on logout", () => {
    login("a@example.com");
    logout();
    expect(isAuthenticated()).toBe(false);
    expect(currentEmail()).toBeNull();
  });
});
