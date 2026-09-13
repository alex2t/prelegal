"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login(email);
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-1 flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold text-[#032147]">Sign in to prelegal</h1>
      <p className="mt-1 text-sm text-[#888888]">
        Placeholder sign-in for the V1 foundation — any email and password
        will do.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#032147]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#209dd7] focus:ring-1 focus:ring-[#209dd7]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#032147]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-[#209dd7] focus:ring-1 focus:ring-[#209dd7]"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
