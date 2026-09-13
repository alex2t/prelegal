"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

// Statically exported pages prerender with no `window`, so the server
// snapshot is always "not authenticated"; useSyncExternalStore reconciles
// against the real client value right after hydration.
function getServerSnapshot(): boolean {
  return false;
}

/** Redirects to /login unless the fake session flag is set. */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authed = useSyncExternalStore(subscribe, isAuthenticated, getServerSnapshot);

  useEffect(() => {
    if (!authed) router.replace("/login");
  }, [authed, router]);

  if (!authed) return null;
  return <>{children}</>;
}
