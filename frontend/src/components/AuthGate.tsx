"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { currentUser, type User } from "@/lib/auth";

const AuthContext = createContext<User | null>(null);

/** The signed-in user, as provided by the nearest AuthGate. */
export function useAuthUser(): User | null {
  return useContext(AuthContext);
}

/** Redirects to /login unless there's an active session; provides the signed-in user to its children. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    currentUser().then((found) => {
      if (cancelled) return;
      setUser(found);
      if (!found) router.replace("/login");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (user === "loading" || user === null) return null;
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
