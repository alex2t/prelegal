/**
 * Turns the form data into a presentation-ready model of the Software
 * License Agreement's Cover Page. Both the on-screen preview and the PDF
 * renderer consume this so the two always stay in sync.
 */

import { SoftwareLicenseFormData, formatEffectiveDate, partyLabel } from "./softwareLicense";

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

export interface SoftwareLicenseCoverPageModel {
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
} as const;

export function buildCoverPage(data: SoftwareLicenseFormData): SoftwareLicenseCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const customerName = partyLabel(data.customer, "Customer");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    customerName,
    effectiveDate,
    introParagraph:
      "This Software License Agreement (the “Agreement”) consists of: (1) this Cover Page and (2) the Software License Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${providerName} (“Provider”) and ${customerName} (“Customer”) as of the Effective Date.`,
    fields: [
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Subscription Period",
        note: "How long the license subscription runs",
        value: data.subscriptionPeriod.trim() || "12 months",
      },
      {
        heading: "Permitted Uses",
        note: "What Customer may use the Software for",
        value: data.permittedUses.trim() || "Internal business purposes.",
      },
      {
        heading: "License Limits",
        note: "Any restrictions on Customer's use of the Software",
        value: data.licenseLimits.trim() || "None specified.",
      },
      {
        heading: "Payment Process",
        note: "How and when Fees are invoiced or charged",
        value: data.paymentProcess.trim() || "Invoiced annually in advance.",
      },
      {
        heading: "Warranty Period",
        note: "How long Provider's warranty for the Software lasts",
        value: data.warrantyPeriod.trim() || "90 days.",
      },
      {
        heading: "Additional Warranties",
        note: "Any extra warranties Provider makes",
        value: data.additionalWarranties.trim() || "None.",
      },
      {
        heading: "General Cap Amount",
        note: "Each party's total liability cap under this Agreement",
        value: data.generalCapAmount.trim() || "The total Fees paid in the 12 months before the claim.",
      },
      {
        heading: "Deletion Procedure",
        note: "How Customer must remove the Software after termination",
        value: data.deletionProcedure.trim() || "Provider will delete Customer data within 30 days of termination.",
      },
      {
        heading: "Governing Law",
        value: data.governingLaw.trim() || PLACEHOLDER.governingLaw,
      },
      {
        heading: "Chosen Courts",
        value: data.chosenCourts.trim() || PLACEHOLDER.chosenCourts,
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
      "Common Paper Software License Agreement, free to use under CC BY 4.0.",
  };
}
