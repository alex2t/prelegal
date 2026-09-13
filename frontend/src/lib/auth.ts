/**
 * Fake session gate for the V1 foundation: no real authentication yet, just a
 * client-side flag set by the login screen so the app knows a user "signed
 * in". See PL-4.
 */

const STORAGE_KEY = "prelegal.auth.email";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function isAuthenticated(): boolean {
  return hasWindow() && window.localStorage.getItem(STORAGE_KEY) !== null;
}

export function currentEmail(): string | null {
  return hasWindow() ? window.localStorage.getItem(STORAGE_KEY) : null;
}

export function login(email: string): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, email);
}

export function logout(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
