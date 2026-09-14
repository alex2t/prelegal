"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate, { useAuthUser } from "@/components/AuthGate";
import { signOut } from "@/lib/auth";
import { documentDisplayName, DOCUMENT_REGISTRY } from "@/lib/documentRegistry";
import { downloadForDocument } from "@/lib/documentDownload";
import { DocumentSummary, getDocument, listDocuments, SavedDocument } from "@/lib/documentHistory";

export default function DocumentsPage() {
  return (
    <AuthGate>
      <DocumentHistory />
    </AuthGate>
  );
}

function DocumentHistory() {
  const router = useRouter();
  const user = useAuthUser();
  const [summaries, setSummaries] = useState<DocumentSummary[] | "loading" | "error">("loading");
  const [selected, setSelected] = useState<SavedDocument | null>(null);
  const [downloading, setDownloading] = useState(false);
  const selectedConfig = selected ? DOCUMENT_REGISTRY[selected.documentType] : null;

  useEffect(() => {
    listDocuments()
      .then(setSummaries)
      .catch(() => setSummaries("error"));
  }, []);

  async function handleSelect(id: number) {
    try {
      setSelected(await getDocument(id));
    } catch {
      setSummaries("error");
    }
  }

  async function handleDownload() {
    if (!selected) return;
    setDownloading(true);
    try {
      await downloadForDocument(selected.documentType, selected.fields);
    } finally {
      setDownloading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#032147]">My Documents</h1>
          <p className="mt-1 text-sm text-slate-600">Documents you&apos;ve previously generated.</p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm text-[#888888]">
          <Link href="/" className="font-medium text-[#209dd7] hover:underline">
            Back to creator
          </Link>
          {user ? <span>{user.email}</span> : null}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </header>

      {selected ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm font-medium text-[#209dd7] hover:underline"
            >
              ← Back to list
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? "Generating…" : "Download PDF"}
            </button>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {selectedConfig ? <selectedConfig.Preview data={selected.fields} /> : null}
          </div>
        </div>
      ) : summaries === "loading" ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : summaries === "error" ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Something went wrong loading your documents. Please try again.
        </p>
      ) : summaries.length === 0 ? (
        <p className="text-sm text-slate-500">
          You haven&apos;t generated any documents yet.{" "}
          <Link href="/" className="text-[#209dd7] hover:underline">
            Start one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
          {summaries.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => handleSelect(doc.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-[#032147]">{doc.title}</p>
                  <p className="text-xs text-[#888888]">{documentDisplayName(doc.documentType)}</p>
                </div>
                <span className="shrink-0 text-xs text-[#888888]">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
