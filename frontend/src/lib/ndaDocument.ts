/**
 * Turns the form data into a presentation-ready model of the Cover Page.
 * Both the on-screen preview and the PDF renderer consume this so the two
 * always stay in sync.
 */

import {
  NdaFormData,
  confidentialityTermText,
  formatEffectiveDate,
  mndaTermText,
  partyLabel,
} from "./nda";

export interface CoverPageField {
  heading: string;
  note?: string;
  value: string;
}

export interface SignatureRow {
  label: string;
  party1: string;
  party2: string;
}

export interface CoverPageModel {
  party1Name: string;
  party2Name: string;
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
  jurisdiction: "[City or county and state]",
} as const;

export function buildCoverPage(data: NdaFormData): CoverPageModel {
  const party1Name = partyLabel(data.party1, "Party 1");
  const party2Name = partyLabel(data.party2, "Party 2");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    party1Name,
    party2Name,
    effectiveDate,
    introParagraph:
      "This Mutual Non-Disclosure Agreement (the “MNDA”) consists of: (1) this Cover Page and (2) the Common Paper Mutual NDA Standard Terms Version 1.0 (“Standard Terms”), which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This MNDA is entered into by ${party1Name} (“Party 1”) and ${party2Name} (“Party 2”) as of the Effective Date.`,
    fields: [
      {
        heading: "Purpose",
        note: "How Confidential Information may be used",
        value: data.purpose.trim() || "[Purpose]",
      },
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "MNDA Term",
        note: "The length of this MNDA",
        value: mndaTermText(data),
      },
      {
        heading: "Term of Confidentiality",
        note: "How long Confidential Information is protected",
        value: confidentialityTermText(data),
      },
      {
        heading: "Governing Law",
        value: data.governingLaw.trim() || PLACEHOLDER.governingLaw,
      },
      {
        heading: "Jurisdiction",
        value: data.jurisdiction.trim() || PLACEHOLDER.jurisdiction,
      },
      {
        heading: "MNDA Modifications",
        note: "Any modifications to the Standard Terms",
        value: data.modifications.trim() || "None.",
      },
    ],
    signatureIntro:
      "By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.",
    signatureRows: [
      { label: "Signature", party1: "", party2: "" },
      {
        label: "Print Name",
        party1: data.party1.signatoryName.trim(),
        party2: data.party2.signatoryName.trim(),
      },
      {
        label: "Title",
        party1: data.party1.title.trim(),
        party2: data.party2.title.trim(),
      },
      {
        label: "Company",
        party1: party1Name,
        party2: party2Name,
      },
      {
        label: "Notice Address",
        party1: data.party1.noticeAddress.trim(),
        party2: data.party2.noticeAddress.trim(),
      },
      { label: "Date", party1: "", party2: "" },
    ],
    attribution:
      "Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.",
  };
}
