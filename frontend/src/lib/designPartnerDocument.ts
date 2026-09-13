/**
 * Turns the form data into a presentation-ready model of the Design Partner
 * Agreement's Cover Page. Both the on-screen preview and the PDF renderer
 * consume this so the two always stay in sync.
 */

import {
  DesignPartnerFormData,
  formatEffectiveDate,
  partyLabel,
} from "./designPartner";

export interface CoverPageField {
  heading: string;
  note?: string;
  value: string;
}

export interface SignatureRow {
  label: string;
  provider: string;
  partner: string;
}

export interface DesignPartnerCoverPageModel {
  providerName: string;
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
  noticeAddress: "[Notice address]",
} as const;

export function buildCoverPage(data: DesignPartnerFormData): DesignPartnerCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const partnerName = partyLabel(data.partner, "Partner");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    partnerName,
    effectiveDate,
    introParagraph:
      "This Design Partner Agreement (the “Agreement”) consists of: (1) this Cover Page and (2) the Design Partner Agreement Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${providerName} (“Provider”) and ${partnerName} (“Partner”) as of the Effective Date.`,
    fields: [
      {
        heading: "Program",
        note: "What the partner gets early access to, and gives feedback on",
        value: data.program.trim() || "[Program]",
      },
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Term",
        note: "How long this Agreement lasts",
        value: data.term.trim() || "12 months",
      },
      {
        heading: "Fees",
        value: data.fees.trim() || "None.",
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
      { label: "Signature", provider: "", partner: "" },
      { label: "Company", provider: providerName, partner: partnerName },
      { label: "Date", provider: "", partner: "" },
    ],
    attribution:
      "Common Paper Design Partner Agreement, free to use under CC BY 4.0.",
  };
}
