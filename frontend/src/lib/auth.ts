/**
 * Calls the backend's session-cookie-based auth endpoints. The cookie is
 * httpOnly, so the client can't read it directly - `currentUser()` asks the
 * backend via `/api/me` instead of checking local state.
 */

export interface User {
  email: string;
}

async function parseErrorDetail(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function signUp(email: string, password: string): Promise<User> {
  const response = await fetch("/api/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Sign up failed."));
  }
  return response.json();
}

export async function signIn(email: string, password: string): Promise<User> {
  const response = await fetch("/api/signin", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorDetail(response, "Sign in failed."));
  }
  return response.json();
}

export async function signOut(): Promise<void> {
  await fetch("/api/signout", { method: "POST", credentials: "include" });
}

/** Returns the signed-in user, or null if there's no active session. */
export async function currentUser(): Promise<User | null> {
  const response = await fetch("/api/me", { credentials: "include" });
  if (!response.ok) return null;
  return response.json();
}
