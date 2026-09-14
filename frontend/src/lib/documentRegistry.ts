/**
 * Maps each supported DocumentType to the pieces its UI needs: display
 * copy, default field values, validation/filename helpers, the preview
 * component, and how to load its PDF generator. Shared by the creator page
 * (frontend/src/app/page.tsx) and the document history page, so both can
 * render any of the 11 documents without duplicating this wiring.
 */

import { DocumentType } from "./documentChat";
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
import { defaultFormData as defaultNdaData, missingRequiredFields as missingNdaFields, ndaFileSlug } from "./nda";
import {
  defaultDesignPartnerFormData,
  missingRequiredFields as missingDesignPartnerFields,
  designPartnerFileSlug,
} from "./designPartner";
import { defaultPilotFormData, missingRequiredFields as missingPilotFields, pilotFileSlug } from "./pilot";
import {
  defaultCloudServiceFormData,
  missingRequiredFields as missingCloudServiceFields,
  cloudServiceFileSlug,
} from "./cloudService";
import {
  defaultServiceLevelFormData,
  missingRequiredFields as missingServiceLevelFields,
  serviceLevelFileSlug,
} from "./serviceLevel";
import {
  defaultProfessionalServicesFormData,
  missingRequiredFields as missingProfessionalServicesFields,
  professionalServicesFileSlug,
} from "./professionalServices";
import {
  defaultDataProcessingFormData,
  missingRequiredFields as missingDataProcessingFields,
  dataProcessingFileSlug,
} from "./dataProcessing";
import {
  defaultSoftwareLicenseFormData,
  missingRequiredFields as missingSoftwareLicenseFields,
  softwareLicenseFileSlug,
} from "./softwareLicense";
import {
  defaultPartnershipFormData,
  missingRequiredFields as missingPartnershipFields,
  partnershipFileSlug,
} from "./partnership";
import {
  defaultBusinessAssociateFormData,
  missingRequiredFields as missingBusinessAssociateFields,
  businessAssociateFileSlug,
} from "./businessAssociate";
import {
  defaultAiAddendumFormData,
  missingRequiredFields as missingAiAddendumFields,
  aiAddendumFileSlug,
} from "./aiAddendum";

export type FieldData = Record<string, unknown>;

export interface DocumentConfig {
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

export const DOCUMENT_REGISTRY: Record<DocumentType, DocumentConfig> = {
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

export const DOCUMENT_TYPES = Object.keys(DOCUMENT_REGISTRY) as DocumentType[];

/** e.g. "Pilot Agreement creator" -> "Pilot Agreement". */
export function documentDisplayName(type: DocumentType): string {
  return DOCUMENT_REGISTRY[type].title.replace(/ creator$/, "");
}

// Display names for the chat's opening greeting - derived from the
// registry rather than a second hardcoded list, so it can't drift.
export const DOCUMENT_NAMES = DOCUMENT_TYPES.map(documentDisplayName);

export function initialDataByType(): Record<DocumentType, FieldData> {
  const entries = DOCUMENT_TYPES.map((type) => [type, DOCUMENT_REGISTRY[type].defaultData] as const);
  return Object.fromEntries(entries) as Record<DocumentType, FieldData>;
}
