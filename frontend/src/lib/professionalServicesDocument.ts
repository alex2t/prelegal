/**
 * Turns the form data into a presentation-ready model of the Professional
 * Services Agreement's Cover Page. Both the on-screen preview and the PDF
 * renderer consume this so the two always stay in sync.
 */

import {
  ProfessionalServicesFormData,
  formatEffectiveDate,
  partyLabel,
} from "./professionalServices";

export interface CoverPageField {
  heading: string;
  note?: string;
  value: string;
}

export interface SignatureRow {
  label: string;
  provider: string;
  customer: string;
}

export interface ProfessionalServicesCoverPageModel {
  providerName: string;
  customerName: string;
  effectiveDate: string;
  introParagraph: string;
  partiesParagraph: string;
  fields: CoverPageField[];
  signatureIntro: string;
  signatureRows: SignatureRow[];
  attribution: string;
}

const PLACEHOLDER = {
  governingLaw: "[State]",
  chosenCourts: "[City or county and state]",
  noticeAddress: "[Notice address]",
} as const;

export function buildCoverPage(
  data: ProfessionalServicesFormData,
): ProfessionalServicesCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const customerName = partyLabel(data.customer, "Customer");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    customerName,
    effectiveDate,
    introParagraph:
      "This Professional Services Agreement (the “Agreement”) consists of: (1) this Cover Page and (2) the Professional Services Agreement Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${providerName} (“Provider”) and ${customerName} (“Customer”) as of the Effective Date.`,
    fields: [
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Deliverables",
        note: "What Provider will deliver under the Statement of Work",
        value: data.deliverables.trim() || "As mutually agreed in writing.",
      },
      {
        heading: "Fees",
        value: data.fees.trim() || "As set forth in the applicable Statement of Work.",
      },
      {
        heading: "Payment Period",
        note: "How long Customer has to pay an invoice",
        value: data.paymentPeriod.trim() || "Net 30 days.",
      },
      {
        heading: "SOW Term",
        note: "How long the engagement runs",
        value: data.sowTerm.trim() || "Until completion of the Deliverables.",
      },
      {
        heading: "Rejection Period",
        note: "How long Customer has to reject a Deliverable",
        value: data.rejectionPeriod.trim() || "10 days.",
      },
      {
        heading: "Additional Warranties",
        value: data.additionalWarranties.trim() || "None.",
      },
      {
        heading: "General Cap Amount",
        note: "Each party's total liability cap under this Agreement",
        value:
          data.generalCapAmount.trim() ||
          "The total Fees paid under the applicable Statement of Work.",
      },
      {
        heading: "Governing Law",
        value: data.governingLaw.trim() || PLACEHOLDER.governingLaw,
      },
      {
        heading: "Chosen Courts",
        value: data.chosenCourts.trim() || PLACEHOLDER.chosenCourts,
      },
      {
        heading: "Notice Address",
        note: "Where notices under the Agreement are sent",
        value: data.noticeAddress.trim() || PLACEHOLDER.noticeAddress,
      },
    ],
    signatureIntro:
      "By signing this Cover Page, each party agrees to enter into this Agreement as of the Effective Date.",
    signatureRows: [
      { label: "Signature", provider: "", customer: "" },
      { label: "Company", provider: providerName, customer: customerName },
      { label: "Date", provider: "", customer: "" },
    ],
    attribution:
      "Common Paper Professional Services Agreement, free to use under CC BY 4.0.",
  };
}
