"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import DocumentChat from "@/components/DocumentChat";
import NdaPreview from "@/components/NdaPreview";
import DesignPartnerPreview from "@/components/DesignPartnerPreview";
import PilotPreview from "@/components/PilotPreview";
import { currentEmail, logout } from "@/lib/auth";
import { ChatTurn, DocumentType, mergeFields } from "@/lib/documentChat";
import {
  defaultFormData as defaultNdaData,
  missingRequiredFields as missingNdaFields,
  ndaFileSlug,
  todayIso,
  type NdaFormData,
} from "@/lib/nda";
import {
  defaultDesignPartnerFormData,
  missingRequiredFields as missingDesignPartnerFields,
  designPartnerFileSlug,
  type DesignPartnerFormData,
} from "@/lib/designPartner";
import {
  defaultPilotFormData,
  missingRequiredFields as missingPilotFields,
  pilotFileSlug,
  type PilotFormData,
} from "@/lib/pilot";

type DownloadState = "idle" | "working" | "error";

const DOCUMENT_META: Record<
  DocumentType,
  { title: string; blurb: string; href: string; linkText: string }
> = {
  mutual_nda: {
    title: "Mutual NDA creator",
    blurb:
      "Chat with the AI about your deal, review the generated agreement, and download it as a PDF.",
    href: "https://commonpaper.com/standards/mutual-nda/1.0/",
    linkText: "Common Paper Mutual NDA",
  },
  design_partner_agreement: {
    title: "Design Partner Agreement creator",
    blurb:
      "Chat with the AI about your partnership, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/Design-Partner-Agreement",
    linkText: "Common Paper Design Partner Agreement",
  },
  pilot_agreement: {
    title: "Pilot Agreement creator",
    blurb:
      "Chat with the AI about your pilot, review the generated agreement, and download it as a PDF.",
    href: "https://commonpaper.com/standards/pilot-agreement/1.1",
    linkText: "Common Paper Pilot Agreement",
  },
};

export default function Home() {
  return (
    <AuthGate>
      <DocumentCreator />
    </AuthGate>
  );
}

function DocumentCreator() {
  const router = useRouter();
  const email = currentEmail();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [ndaData, setNdaData] = useState<NdaFormData>(defaultNdaData);
  const [designPartnerData, setDesignPartnerData] = useState<DesignPartnerFormData>(
    defaultDesignPartnerFormData,
  );
  const [pilotData, setPilotData] = useState<PilotFormData>(defaultPilotFormData);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");

  const missing = useMemo(() => {
    if (documentType === "mutual_nda") return missingNdaFields(ndaData);
    if (documentType === "design_partner_agreement") return missingDesignPartnerFields(designPartnerData);
    if (documentType === "pilot_agreement") return missingPilotFields(pilotData);
    return [];
  }, [documentType, ndaData, designPartnerData, pilotData]);
  const canDownload = documentType !== null && missing.length === 0 && downloadState !== "working";

  // Fill in today's date after mount, client-side, so it reflects the
  // visitor's own local date instead of being frozen into a prerendered page.
  // Both documents' defaults are filled - whichever one the chat ends up
  // resolving to already has a sensible effective date.
  const effectiveDateFilled = useRef(false);
  useEffect(() => {
    if (effectiveDateFilled.current) return;
    effectiveDateFilled.current = true;
    const today = todayIso();
    setNdaData((prev) => (prev.effectiveDate ? prev : { ...prev, effectiveDate: today }));
    setDesignPartnerData((prev) => (prev.effectiveDate ? prev : { ...prev, effectiveDate: today }));
    setPilotData((prev) => (prev.effectiveDate ? prev : { ...prev, effectiveDate: today }));
  }, []);

  function handleTurn(turn: ChatTurn) {
    setDocumentType(turn.documentType);
    if (turn.documentType === "mutual_nda") {
      setNdaData(
        (prev) =>
          mergeFields(prev as unknown as Record<string, unknown>, turn.fields) as unknown as NdaFormData,
      );
    } else if (turn.documentType === "design_partner_agreement") {
      setDesignPartnerData(
        (prev) =>
          mergeFields(prev as unknown as Record<string, unknown>, turn.fields) as unknown as DesignPartnerFormData,
      );
    } else if (turn.documentType === "pilot_agreement") {
      setPilotData(
        (prev) =>
          mergeFields(prev as unknown as Record<string, unknown>, turn.fields) as unknown as PilotFormData,
      );
    }
  }

  async function handleDownload() {
    if (!canDownload) return;
    setDownloadState("working");
    try {
      if (documentType === "mutual_nda") {
        const { generateNdaBlob } = await import("@/components/NdaPdf");
        await triggerDownload(
          await generateNdaBlob(ndaData),
          `Mutual-NDA-${ndaFileSlug(ndaData)}.pdf`,
        );
      } else if (documentType === "design_partner_agreement") {
        const { generateDesignPartnerBlob } = await import("@/components/DesignPartnerPdf");
        await triggerDownload(
          await generateDesignPartnerBlob(designPartnerData),
          `Design-Partner-Agreement-${designPartnerFileSlug(designPartnerData)}.pdf`,
        );
      } else if (documentType === "pilot_agreement") {
        const { generatePilotBlob } = await import("@/components/PilotPdf");
        await triggerDownload(
          await generatePilotBlob(pilotData),
          `Pilot-Agreement-${pilotFileSlug(pilotData)}.pdf`,
        );
      }
      setDownloadState("idle");
    } catch (error) {
      console.error("Failed to generate document PDF", error);
      setDownloadState("error");
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const meta = documentType ? DOCUMENT_META[documentType] : null;
  const activeFields = (documentType === "mutual_nda"
    ? ndaData
    : documentType === "design_partner_agreement"
      ? designPartnerData
      : documentType === "pilot_agreement"
        ? pilotData
        : {}) as unknown as Record<string, unknown>;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {meta?.title ?? "Legal document creator"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {meta ? (
              <>
                {meta.blurb} Based on the{" "}
                <a
                  className="underline"
                  href={meta.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {meta.linkText}
                </a>{" "}
                (CC BY 4.0).
              </>
            ) : (
              "Chat with the AI to start a Mutual NDA, a Design Partner Agreement, or a Pilot Agreement."
            )}
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
        <section aria-label="Document chat">
          <DocumentChat documentType={documentType} fields={activeFields} onTurn={handleTurn} />
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
            {documentType === "mutual_nda" ? (
              <NdaPreview data={ndaData} />
            ) : documentType === "design_partner_agreement" ? (
              <DesignPartnerPreview data={designPartnerData} />
            ) : documentType === "pilot_agreement" ? (
              <PilotPreview data={pilotData} />
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

async function triggerDownload(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Deferred rather than immediate: revoking the object URL right after
  // click() can race the browser actually reading the blob to save the
  // file (notably on Firefox), silently breaking the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
