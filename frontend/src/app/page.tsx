"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import DocumentChat from "@/components/DocumentChat";
import NdaPreview from "@/components/NdaPreview";
import DesignPartnerPreview from "@/components/DesignPartnerPreview";
import PilotPreview from "@/components/PilotPreview";
import CloudServicePreview from "@/components/CloudServicePreview";
import ServiceLevelPreview from "@/components/ServiceLevelPreview";
import ProfessionalServicesPreview from "@/components/ProfessionalServicesPreview";
import DataProcessingPreview from "@/components/DataProcessingPreview";
import SoftwareLicensePreview from "@/components/SoftwareLicensePreview";
import PartnershipPreview from "@/components/PartnershipPreview";
import BusinessAssociatePreview from "@/components/BusinessAssociatePreview";
import AiAddendumPreview from "@/components/AiAddendumPreview";
import { currentEmail, logout } from "@/lib/auth";
import { ChatTurn, DocumentType, mergeFields } from "@/lib/documentChat";
import { defaultFormData as defaultNdaData, missingRequiredFields as missingNdaFields, ndaFileSlug } from "@/lib/nda";
import {
  defaultDesignPartnerFormData,
  missingRequiredFields as missingDesignPartnerFields,
  designPartnerFileSlug,
} from "@/lib/designPartner";
import { defaultPilotFormData, missingRequiredFields as missingPilotFields, pilotFileSlug } from "@/lib/pilot";
import {
  defaultCloudServiceFormData,
  missingRequiredFields as missingCloudServiceFields,
  cloudServiceFileSlug,
} from "@/lib/cloudService";
import {
  defaultServiceLevelFormData,
  missingRequiredFields as missingServiceLevelFields,
  serviceLevelFileSlug,
} from "@/lib/serviceLevel";
import {
  defaultProfessionalServicesFormData,
  missingRequiredFields as missingProfessionalServicesFields,
  professionalServicesFileSlug,
} from "@/lib/professionalServices";
import {
  defaultDataProcessingFormData,
  missingRequiredFields as missingDataProcessingFields,
  dataProcessingFileSlug,
} from "@/lib/dataProcessing";
import {
  defaultSoftwareLicenseFormData,
  missingRequiredFields as missingSoftwareLicenseFields,
  softwareLicenseFileSlug,
} from "@/lib/softwareLicense";
import {
  defaultPartnershipFormData,
  missingRequiredFields as missingPartnershipFields,
  partnershipFileSlug,
} from "@/lib/partnership";
import {
  defaultBusinessAssociateFormData,
  missingRequiredFields as missingBusinessAssociateFields,
  businessAssociateFileSlug,
} from "@/lib/businessAssociate";
import {
  defaultAiAddendumFormData,
  missingRequiredFields as missingAiAddendumFields,
  aiAddendumFileSlug,
} from "@/lib/aiAddendum";

type DownloadState = "idle" | "working" | "error";
type FieldData = Record<string, unknown>;

// Stable reference (not a fresh `{}` each render) so it doesn't invalidate
// the `missing` useMemo below every time there's no active document yet.
const EMPTY_FIELD_DATA: FieldData = {};

interface DocumentConfig {
  title: string;
  blurb: string;
  href: string;
  linkText: string;
  defaultData: FieldData;
  missingRequiredFields: (data: FieldData) => string[];
  fileSlug: (data: FieldData) => string;
  filenamePrefix: string;
  Preview: (props: { data: FieldData }) => React.ReactElement;
  loadGenerateBlob: () => Promise<(data: FieldData) => Promise<Blob>>;
}

// `T` is intentionally unconstrained (not `T extends FieldData`): a plain
// interface like `PilotFormData` has no index signature, so TypeScript
// won't consider it assignable to `Record<string, unknown>` even though
// it's structurally compatible - constraining T that way makes every real
// FormData type fail at the call site below. Accepting any `T` and erasing
// it to `FieldData` only inside this function (the one place that needs to
// hold all 11 documents' otherwise-incompatible shapes in one map) avoids
// that, the same way backend/src/backend/chat.py's `_DOCUMENTS` registry
// erases each document's Pydantic model down to a common `BaseModel`.
function config<T>(cfg: {
  title: string;
  blurb: string;
  href: string;
  linkText: string;
  defaultData: T;
  missingRequiredFields: (data: T) => string[];
  fileSlug: (data: T) => string;
  filenamePrefix: string;
  Preview: (props: { data: T }) => React.ReactElement;
  loadGenerateBlob: () => Promise<Record<string, unknown>>;
  generateBlobExport: string;
}): DocumentConfig {
  return {
    title: cfg.title,
    blurb: cfg.blurb,
    href: cfg.href,
    linkText: cfg.linkText,
    defaultData: cfg.defaultData as unknown as FieldData,
    missingRequiredFields: cfg.missingRequiredFields as unknown as (data: FieldData) => string[],
    fileSlug: cfg.fileSlug as unknown as (data: FieldData) => string,
    filenamePrefix: cfg.filenamePrefix,
    Preview: cfg.Preview as unknown as (props: { data: FieldData }) => React.ReactElement,
    loadGenerateBlob: async () => {
      const pdfModule = await cfg.loadGenerateBlob();
      return pdfModule[cfg.generateBlobExport] as (data: FieldData) => Promise<Blob>;
    },
  };
}

const DOCUMENT_REGISTRY: Record<DocumentType, DocumentConfig> = {
  mutual_nda: config({
    title: "Mutual NDA creator",
    blurb: "Chat with the AI about your deal, review the generated agreement, and download it as a PDF.",
    href: "https://commonpaper.com/standards/mutual-nda/1.0/",
    linkText: "Common Paper Mutual NDA",
    defaultData: defaultNdaData,
    missingRequiredFields: missingNdaFields,
    fileSlug: ndaFileSlug,
    filenamePrefix: "Mutual-NDA",
    Preview: NdaPreview,
    loadGenerateBlob: () => import("@/components/NdaPdf"),
    generateBlobExport: "generateNdaBlob",
  }),
  design_partner_agreement: config({
    title: "Design Partner Agreement creator",
    blurb: "Chat with the AI about your partnership, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/Design-Partner-Agreement",
    linkText: "Common Paper Design Partner Agreement",
    defaultData: defaultDesignPartnerFormData,
    missingRequiredFields: missingDesignPartnerFields,
    fileSlug: designPartnerFileSlug,
    filenamePrefix: "Design-Partner-Agreement",
    Preview: DesignPartnerPreview,
    loadGenerateBlob: () => import("@/components/DesignPartnerPdf"),
    generateBlobExport: "generateDesignPartnerBlob",
  }),
  cloud_service_agreement: config({
    title: "Cloud Service Agreement creator",
    blurb: "Chat with the AI about your SaaS offering, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/CSA",
    linkText: "Common Paper Cloud Service Agreement",
    defaultData: defaultCloudServiceFormData,
    missingRequiredFields: missingCloudServiceFields,
    fileSlug: cloudServiceFileSlug,
    filenamePrefix: "Cloud-Service-Agreement",
    Preview: CloudServicePreview,
    loadGenerateBlob: () => import("@/components/CloudServicePdf"),
    generateBlobExport: "generateCloudServiceBlob",
  }),
  service_level_agreement: config({
    title: "Service Level Agreement creator",
    blurb: "Chat with the AI about your uptime commitments, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/SLA",
    linkText: "Common Paper Service Level Agreement",
    defaultData: defaultServiceLevelFormData,
    missingRequiredFields: missingServiceLevelFields,
    fileSlug: serviceLevelFileSlug,
    filenamePrefix: "Service-Level-Agreement",
    Preview: ServiceLevelPreview,
    loadGenerateBlob: () => import("@/components/ServiceLevelPdf"),
    generateBlobExport: "generateServiceLevelBlob",
  }),
  professional_services_agreement: config({
    title: "Professional Services Agreement creator",
    blurb: "Chat with the AI about your engagement, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/PSA",
    linkText: "Common Paper Professional Services Agreement",
    defaultData: defaultProfessionalServicesFormData,
    missingRequiredFields: missingProfessionalServicesFields,
    fileSlug: professionalServicesFileSlug,
    filenamePrefix: "Professional-Services-Agreement",
    Preview: ProfessionalServicesPreview,
    loadGenerateBlob: () => import("@/components/ProfessionalServicesPdf"),
    generateBlobExport: "generateProfessionalServicesBlob",
  }),
  data_processing_agreement: config({
    title: "Data Processing Agreement creator",
    blurb: "Chat with the AI about your data processing terms, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/DPA",
    linkText: "Common Paper Data Processing Agreement",
    defaultData: defaultDataProcessingFormData,
    missingRequiredFields: missingDataProcessingFields,
    fileSlug: dataProcessingFileSlug,
    filenamePrefix: "Data-Processing-Agreement",
    Preview: DataProcessingPreview,
    loadGenerateBlob: () => import("@/components/DataProcessingPdf"),
    generateBlobExport: "generateDataProcessingBlob",
  }),
  software_license_agreement: config({
    title: "Software License Agreement creator",
    blurb: "Chat with the AI about your license terms, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/Software-License-Agreement",
    linkText: "Common Paper Software License Agreement",
    defaultData: defaultSoftwareLicenseFormData,
    missingRequiredFields: missingSoftwareLicenseFields,
    fileSlug: softwareLicenseFileSlug,
    filenamePrefix: "Software-License-Agreement",
    Preview: SoftwareLicensePreview,
    loadGenerateBlob: () => import("@/components/SoftwareLicensePdf"),
    generateBlobExport: "generateSoftwareLicenseBlob",
  }),
  partnership_agreement: config({
    title: "Partnership Agreement creator",
    blurb: "Chat with the AI about your partnership, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/Partnership-Agreement",
    linkText: "Common Paper Partnership Agreement",
    defaultData: defaultPartnershipFormData,
    missingRequiredFields: missingPartnershipFields,
    fileSlug: partnershipFileSlug,
    filenamePrefix: "Partnership-Agreement",
    Preview: PartnershipPreview,
    loadGenerateBlob: () => import("@/components/PartnershipPdf"),
    generateBlobExport: "generatePartnershipBlob",
  }),
  business_associate_agreement: config({
    title: "Business Associate Agreement creator",
    blurb: "Chat with the AI about your HIPAA obligations, review the generated agreement, and download it as a PDF.",
    href: "https://github.com/CommonPaper/BAA",
    linkText: "Common Paper Business Associate Agreement",
    defaultData: defaultBusinessAssociateFormData,
    missingRequiredFields: missingBusinessAssociateFields,
    fileSlug: businessAssociateFileSlug,
    filenamePrefix: "Business-Associate-Agreement",
    Preview: BusinessAssociatePreview,
    loadGenerateBlob: () => import("@/components/BusinessAssociatePdf"),
    generateBlobExport: "generateBusinessAssociateBlob",
  }),
  pilot_agreement: config({
    title: "Pilot Agreement creator",
    blurb: "Chat with the AI about your pilot, review the generated agreement, and download it as a PDF.",
    href: "https://commonpaper.com/standards/pilot-agreement/1.1",
    linkText: "Common Paper Pilot Agreement",
    defaultData: defaultPilotFormData,
    missingRequiredFields: missingPilotFields,
    fileSlug: pilotFileSlug,
    filenamePrefix: "Pilot-Agreement",
    Preview: PilotPreview,
    loadGenerateBlob: () => import("@/components/PilotPdf"),
    generateBlobExport: "generatePilotBlob",
  }),
  ai_addendum: config({
    title: "AI Addendum creator",
    blurb: "Chat with the AI about your AI terms, review the generated addendum, and download it as a PDF.",
    href: "https://github.com/CommonPaper/AI-Addendum",
    linkText: "Common Paper AI Addendum",
    defaultData: defaultAiAddendumFormData,
    missingRequiredFields: missingAiAddendumFields,
    fileSlug: aiAddendumFileSlug,
    filenamePrefix: "AI-Addendum",
    Preview: AiAddendumPreview,
    loadGenerateBlob: () => import("@/components/AiAddendumPdf"),
    generateBlobExport: "generateAiAddendumBlob",
  }),
};

const DOCUMENT_TYPES = Object.keys(DOCUMENT_REGISTRY) as DocumentType[];

// Display names for the chat's opening greeting, derived from each
// document's title (e.g. "Pilot Agreement creator" -> "Pilot Agreement")
// rather than duplicating a second list of document names to keep in sync.
const DOCUMENT_NAMES = DOCUMENT_TYPES.map((type) => DOCUMENT_REGISTRY[type].title.replace(/ creator$/, ""));

function initialDataByType(): Record<DocumentType, FieldData> {
  const entries = DOCUMENT_TYPES.map((type) => [type, DOCUMENT_REGISTRY[type].defaultData] as const);
  return Object.fromEntries(entries) as Record<DocumentType, FieldData>;
}

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
      const generateBlob = await activeConfig.loadGenerateBlob();
      const blob = await generateBlob(activeData);
      await triggerDownload(blob, `${activeConfig.filenamePrefix}-${activeConfig.fileSlug(activeData)}.pdf`);
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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
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
          <DocumentChat
            documentType={documentType}
            fields={activeData}
            documentNames={DOCUMENT_NAMES}
            onTurn={handleTurn}
          />
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
