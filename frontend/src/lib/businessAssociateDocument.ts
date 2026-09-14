/**
 * Turns the form data into a presentation-ready model of the Business
 * Associate Agreement's Cover Page. Both the on-screen preview and the PDF
 * renderer consume this so the two always stay in sync.
 */

import { BusinessAssociateFormData, formatEffectiveDate, partyLabel } from "./businessAssociate";

export interface CoverPageField {
  heading: string;
  note?: string;
  value: string;
}

export interface SignatureRow {
  label: string;
  provider: string;
  company: string;
}

export interface BusinessAssociateCoverPageModel {
  providerName: string;
  companyName: string;
  effectiveDate: string;
  introParagraph: string;
  partiesParagraph: string;
  fields: CoverPageField[];
  signatureIntro: string;
  signatureRows: SignatureRow[];
  attribution: string;
}

export function buildCoverPage(data: BusinessAssociateFormData): BusinessAssociateCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const companyName = partyLabel(data.company, "Company");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);
  const baseAgreementDescription = data.baseAgreementDescription.trim() || "[Base agreement]";

  return {
    providerName,
    companyName,
    effectiveDate,
    introParagraph:
      `This Business Associate Agreement (the “BAA”) consists of: (1) this Cover Page and (2) the BAA Standard Terms, which are attached and incorporated by reference. This BAA supplements and is incorporated into ${baseAgreementDescription} (the “Agreement”), which remains in full force and effect.`,
    partiesParagraph: `This BAA is entered into by ${providerName} (“Provider”) and ${companyName} (“Company”) as of the BAA Effective Date.`,
    fields: [
      {
        heading: "Base Agreement",
        note: "The agreement this BAA supplements and attaches to",
        value: baseAgreementDescription,
      },
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Limitations",
        note: "Restrictions on Provider's use or disclosure of PHI",
        value: data.limitations.trim() || "None.",
      },
      {
        heading: "Breach Notification Period",
        note: "How quickly Provider must report a breach to Company",
        value: data.breachNotificationPeriod.trim() || "5 business days.",
      },
    ],
    signatureIntro: "By signing this Cover Page, each party agrees to enter into this BAA as of the BAA Effective Date.",
    signatureRows: [
      { label: "Signature", provider: "", company: "" },
      { label: "Company", provider: providerName, company: companyName },
      { label: "Date", provider: "", company: "" },
    ],
    attribution: "Common Paper Business Associate Agreement, free to use under CC BY 4.0.",
  };
}
