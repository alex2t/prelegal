/**
 * Turns the form data into a presentation-ready model of the Data
 * Processing Agreement's Cover Page. Both the on-screen preview and the PDF
 * renderer consume this so the two always stay in sync.
 */

import { DataProcessingFormData, formatEffectiveDate, partyLabel } from "./dataProcessing";

export interface CoverPageField {
  heading: string;
  note?: string;
  value: string;
}

export interface SignatureRow {
  label: string;
  controller: string;
  processor: string;
}

export interface DataProcessingCoverPageModel {
  controllerName: string;
  processorName: string;
  effectiveDate: string;
  introParagraph: string;
  partiesParagraph: string;
  fields: CoverPageField[];
  signatureIntro: string;
  signatureRows: SignatureRow[];
  attribution: string;
}

const PLACEHOLDER = {
  governingMemberState: "[Member State]",
  providerSecurityContact: "[Security contact]",
} as const;

export function buildCoverPage(data: DataProcessingFormData): DataProcessingCoverPageModel {
  const controllerName = partyLabel(data.controller, "Controller");
  const processorName = partyLabel(data.processor, "Processor");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    controllerName,
    processorName,
    effectiveDate,
    introParagraph:
      "This Data Processing Agreement (the “DPA”) consists of: (1) this Cover Page and (2) the DPA Standard Terms, which are attached and incorporated by reference. This DPA supplements and forms part of the underlying Agreement between the parties.",
    partiesParagraph: `This DPA is entered into by ${controllerName} (“Controller”) and ${processorName} (“Processor”) as of the Effective Date.`,
    fields: [
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Governing Member State",
        note: "The EU member state whose law governs the EEA SCCs",
        value: data.governingMemberState.trim() || PLACEHOLDER.governingMemberState,
      },
      {
        heading: "Categories of Personal Data",
        value: data.categoriesOfPersonalData.trim() || "[Categories of Personal Data]",
      },
      {
        heading: "Categories of Data Subjects",
        value: data.categoriesOfDataSubjects.trim() || "[Categories of Data Subjects]",
      },
      {
        heading: "Purpose of Processing",
        value: data.purposeOfProcessing.trim() || "[Purpose of Processing]",
      },
      {
        heading: "Duration of Processing",
        value: data.durationOfProcessing.trim() || "The term of the Agreement.",
      },
      {
        heading: "Special Category Data",
        note: "Any special categories of data under Article 9 of the GDPR",
        value: data.specialCategoryData.trim() || "None.",
      },
      {
        heading: "Approved Subprocessors",
        note: "Identities, locations, and Processing tasks of approved Subprocessors",
        value: data.approvedSubprocessors.trim() || "None.",
      },
      {
        heading: "Provider Security Contact",
        note: "Where Controller sends security due-diligence requests",
        value: data.providerSecurityContact.trim() || PLACEHOLDER.providerSecurityContact,
      },
    ],
    signatureIntro:
      "By signing this Cover Page, each party agrees to enter into this DPA as of the Effective Date.",
    signatureRows: [
      { label: "Signature", controller: "", processor: "" },
      { label: "Company", controller: controllerName, processor: processorName },
      { label: "Date", controller: "", processor: "" },
    ],
    attribution:
      "Common Paper Data Processing Agreement, free to use under CC BY 4.0.",
  };
}
