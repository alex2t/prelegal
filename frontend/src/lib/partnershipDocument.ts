/**
 * Turns the form data into a presentation-ready model of the Partnership
 * Agreement's Cover Page. Both the on-screen preview and the PDF renderer
 * consume this so the two always stay in sync.
 */

import { PartnershipFormData, formatEffectiveDate, partyLabel } from "./partnership";

export interface CoverPageField {
  heading: string;
  note?: string;
  value: string;
}

export interface SignatureRow {
  label: string;
  company: string;
  partner: string;
}

export interface PartnershipCoverPageModel {
  companyName: string;
  partnerName: string;
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

export function buildCoverPage(data: PartnershipFormData): PartnershipCoverPageModel {
  const companyName = partyLabel(data.company, "Company");
  const partnerName = partyLabel(data.partner, "Partner");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    companyName,
    partnerName,
    effectiveDate,
    introParagraph:
      "This Partnership Agreement (the “Agreement”) consists of: (1) this Cover Page and (2) the Partnership Agreement Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${companyName} (“Company”) and ${partnerName} (“Partner”) as of the Effective Date.`,
    fields: [
      {
        heading: "Obligations",
        note: "What each party will do under this Agreement",
        value: data.obligations.trim() || "[Obligations]",
      },
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Payment Process",
        note: "How Fees, if any, will be billed or invoiced",
        value: data.paymentProcess.trim() || "As mutually agreed in writing.",
      },
      {
        heading: "Payment Schedule",
        note: "How often Fees, if any, are paid",
        value: data.paymentSchedule.trim() || "Monthly.",
      },
      {
        heading: "Territory",
        note: "Where the trademark license under Section 3 applies",
        value: data.territory.trim() || "Worldwide.",
      },
      {
        heading: "End Date",
        note: "When the Agreement ends absent earlier termination",
        value: data.endDate.trim() || "Until terminated by either party.",
      },
      {
        heading: "Brand Guidelines",
        value: data.brandGuidelines.trim() || "None.",
      },
      {
        heading: "Additional Warranties",
        value: data.additionalWarranties.trim() || "None.",
      },
      {
        heading: "General Cap Amount",
        note: "Each party's total liability cap under this Agreement",
        value: data.generalCapAmount.trim() || "The total Fees paid in the 12 months before the claim.",
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
      { label: "Signature", company: "", partner: "" },
      { label: "Company", company: companyName, partner: partnerName },
      { label: "Date", company: "", partner: "" },
    ],
    attribution:
      "Common Paper Partnership Agreement, free to use under CC BY 4.0.",
  };
}
