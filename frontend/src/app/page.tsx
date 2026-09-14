"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate, { useAuthUser } from "@/components/AuthGate";
import DocumentChat from "@/components/DocumentChat";
import { signOut } from "@/lib/auth";
import { ChatTurn, DocumentType, mergeFields } from "@/lib/documentChat";
import { downloadForDocument } from "@/lib/documentDownload";
import { DOCUMENT_NAMES, DOCUMENT_REGISTRY, DOCUMENT_TYPES, initialDataByType, type FieldData } from "@/lib/documentRegistry";
import { saveDocument } from "@/lib/documentHistory";

type DownloadState = "idle" | "working" | "error";

export default function Home() {
  return (
    <AuthGate>
      <DocumentCreator />
    </AuthGate>
  );
}

function DocumentCreator() {
  const router = useRouter();
  const user = useAuthUser();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [dataByType, setDataByType] = useState<Record<DocumentType, FieldData>>(initialDataByType);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  const activeConfig = documentType ? DOCUMENT_REGISTRY[documentType] : null;
  const activeData = documentType ? dataByType[documentType] : EMPTY_FIELD_DATA;

  const missing = useMemo(
    () => (activeConfig ? activeConfig.missingRequiredFields(activeData) : []),
    [activeConfig, activeData],
  );
  const canDownload = documentType !== null && missing.length === 0 && downloadState !== "working";

  // Fill in today's date (for every document that has one) after mount,
  // client-side, so it reflects the visitor's own local date instead of
  // being frozen into a prerendered page. Whichever document the chat ends
  // up resolving to already has a sensible effective date.
  const effectiveDateFilled = useRef(false);
  useEffect(() => {
    if (effectiveDateFilled.current) return;
    effectiveDateFilled.current = true;
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;
    setDataByType((prev) => {
      const next = { ...prev };
      for (const type of DOCUMENT_TYPES) {
        if ("effectiveDate" in next[type] && !next[type].effectiveDate) {
          next[type] = { ...next[type], effectiveDate: iso };
        }
      }
      return next;
    });
  }, []);

  function handleTurn(turn: ChatTurn) {
    setDocumentType(turn.documentType);
    if (turn.documentType) {
      const type = turn.documentType;
      setDataByType((prev) => ({ ...prev, [type]: mergeFields(prev[type], turn.fields) }));
    }
  }

  async function handleDownload() {
    if (!canDownload || !activeConfig || !documentType) return;
    setDownloadState("working");
    try {
      await downloadForDocument(documentType, activeData);
      await saveDocument(documentType, activeConfig.fileSlug(activeData).replace(/-/g, " "), activeData);
      setDownloadState("idle");
    } catch (error) {
      console.error("Failed to generate document PDF", error);
      setDownloadState("error");
    }
  }

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#032147]">
            {activeConfig?.title ?? "Legal document creator"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeConfig ? (
              <>
                {activeConfig.blurb} Based on the{" "}
                <a
                  className="underline"
                  href={activeConfig.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {activeConfig.linkText}
                </a>{" "}
                (CC BY 4.0).
              </>
            ) : (
              "Chat with the AI to start any of this product's supported legal documents."
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-sm text-[#888888]">
          <Link href="/documents" className="font-medium text-[#209dd7] hover:underline">
            My Documents
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-label="Document chat">
          <DocumentChat
            documentType={documentType}
            fields={activeData}
            documentNames={DOCUMENT_NAMES}
            onTurn={handleTurn}
          />
        </section>

        <section aria-label="Document preview" className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#032147]">Preview</h2>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className="rounded-md bg-[#753991] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloadState === "working" ? "Generating…" : "Download PDF"}
            </button>
          </div>

          {documentType && missing.length > 0 ? (
            <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Add the following before downloading: {missing.join(", ")}.
            </p>
          ) : null}
          {downloadState === "error" ? (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              Something went wrong generating the PDF. Please try again.
            </p>
          ) : null}

          <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            {activeConfig ? (
              <activeConfig.Preview data={activeData} />
            ) : (
              <p className="text-sm text-slate-500">
                Once you tell the chat which document you want, its preview will appear here.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// Stable reference (not a fresh `{}` each render) so it doesn't invalidate
// the `missing` useMemo above every time there's no active document yet.
const EMPTY_FIELD_DATA: FieldData = {};
