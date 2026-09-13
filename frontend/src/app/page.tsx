"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import NdaChat from "@/components/NdaChat";
import NdaPreview from "@/components/NdaPreview";
import { currentEmail, logout } from "@/lib/auth";
import {
  defaultFormData,
  missingRequiredFields,
  ndaFileSlug,
  todayIso,
} from "@/lib/nda";

type DownloadState = "idle" | "working" | "error";

export default function Home() {
  return (
    <AuthGate>
      <NdaCreator />
    </AuthGate>
  );
}

function NdaCreator() {
  const router = useRouter();
  const email = currentEmail();
  const [data, setData] = useState(defaultFormData);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  const missing = useMemo(() => missingRequiredFields(data), [data]);
  const canDownload = missing.length === 0 && downloadState !== "working";

  // Fill in today's date after mount, client-side, so it reflects the
  // visitor's own local date instead of being frozen into a prerendered page.
  // Ref-guarded (rather than a bare state check) so this reads as the
  // one-time client sync it is, not a state-derived-from-state update.
  const effectiveDateFilled = useRef(false);
  useEffect(() => {
    if (effectiveDateFilled.current) return;
    effectiveDateFilled.current = true;
    setData((prev) => (prev.effectiveDate ? prev : { ...prev, effectiveDate: todayIso() }));
  }, []);

  async function handleDownload() {
    if (missing.length > 0) return;
    setDownloadState("working");
    try {
      const { generateNdaBlob } = await import("@/components/NdaPdf");
      const blob = await generateNdaBlob(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Mutual-NDA-${ndaFileSlug(data)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Deferred rather than immediate: revoking the object URL right after
      // click() can race the browser actually reading the blob to save the
      // file (notably on Firefox), silently breaking the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadState("idle");
    } catch (error) {
      console.error("Failed to generate NDA PDF", error);
      setDownloadState("error");
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mutual NDA creator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Chat with the AI about your deal, review the generated agreement, and
            download it as a PDF. Based on the{" "}
            <a
              className="underline"
              href="https://commonpaper.com/standards/mutual-nda/1.0/"
              target="_blank"
              rel="noreferrer"
            >
              Common Paper Mutual NDA
            </a>{" "}
            (CC BY 4.0).
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-sm text-[#888888]">
          {email ? <span>{email}</span> : null}
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
        <section aria-label="NDA details">
          <NdaChat fields={data} onFieldsChange={setData} />
        </section>

        <section aria-label="Document preview" className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Preview</h2>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {downloadState === "working" ? "Generating…" : "Download PDF"}
            </button>
          </div>

          {missing.length > 0 ? (
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
            <NdaPreview data={data} />
          </div>
        </section>
      </div>
    </main>
  );
}
