/**
 * Turns the form data into a presentation-ready model of the Cloud Service
 * Agreement's Cover Page. Both the on-screen preview and the PDF renderer
 * consume this so the two always stay in sync.
 */

import { CloudServiceFormData, formatEffectiveDate, partyLabel } from "./cloudService";

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

export interface CloudServiceCoverPageModel {
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

export function buildCoverPage(data: CloudServiceFormData): CloudServiceCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const customerName = partyLabel(data.customer, "Customer");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    customerName,
    effectiveDate,
    introParagraph:
      "This Cloud Service Agreement (the “Agreement”) consists of: (1) this Cover Page and (2) the Cloud Service Agreement Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${providerName} (“Provider”) and ${customerName} (“Customer”) as of the Effective Date.`,
    fields: [
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Subscription Period",
        note: "How long each subscription to the Cloud Service runs",
        value: data.subscriptionPeriod.trim() || "12 months",
      },
      {
        heading: "Technical Support",
        value:
          data.technicalSupport.trim() ||
          "Standard support during business hours, Monday through Friday.",
      },
      {
        heading: "Payment Process",
        value: data.paymentProcess.trim() || "Invoiced annually in advance.",
      },
      {
        heading: "Non-Renewal Notice Date",
        note: "When notice of non-renewal is due before a Subscription Period ends",
        value:
          data.nonRenewalNoticeDate.trim() ||
          "30 days before the end of the Subscription Period.",
      },
      {
        heading: "Use Limitations",
        value: data.useLimitations.trim() || "None.",
      },
      {
        heading: "General Cap Amount",
        note: "Each party's total liability cap under this Agreement",
        value:
          data.generalCapAmount.trim() ||
          "The total Fees paid in the 12 months before the claim.",
      },
      {
        heading: "Additional Warranties",
        value: data.additionalWarranties.trim() || "None.",
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
    attribution: "Common Paper Cloud Service Agreement, free to use under CC BY 4.0.",
  };
}
