/**
 * Turns the form data into a presentation-ready model of the Pilot
 * Agreement's Order Form. Both the on-screen preview and the PDF renderer
 * consume this so the two always stay in sync.
 */

import { PilotFormData, formatEffectiveDate, partyLabel } from "./pilot";

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

export interface PilotCoverPageModel {
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

export function buildCoverPage(data: PilotFormData): PilotCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const customerName = partyLabel(data.customer, "Customer");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    customerName,
    effectiveDate,
    introParagraph:
      "This Pilot Agreement (the “Agreement”) consists of: (1) this Order Form and (2) the Pilot Agreement Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Order Form, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${providerName} (“Provider”) and ${customerName} (“Customer”) as of the Effective Date.`,
    fields: [
      {
        heading: "Product",
        note: "What Customer is evaluating during the pilot",
        value: data.product.trim() || "[Product]",
      },
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Pilot Period",
        note: "How long the pilot runs",
        value: data.pilotPeriod.trim() || "30 days",
      },
      {
        heading: "Fees",
        value: data.fees.trim() || "None.",
      },
      {
        heading: "General Cap Amount",
        note: "Each party's total liability cap under this Agreement",
        value: data.generalCapAmount.trim() || "The total Fees paid under this Agreement.",
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
      "By signing this Order Form, each party agrees to enter into this Agreement as of the Effective Date.",
    signatureRows: [
      { label: "Signature", provider: "", customer: "" },
      { label: "Company", provider: providerName, customer: customerName },
      { label: "Date", provider: "", customer: "" },
    ],
    attribution:
      "Common Paper Pilot Agreement, free to use under CC BY 4.0.",
  };
}
