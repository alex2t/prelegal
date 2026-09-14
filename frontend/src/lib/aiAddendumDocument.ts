/**
 * Turns the form data into a presentation-ready model of the AI Addendum's
 * Cover Page. Both the on-screen preview and the PDF renderer consume this
 * so the two always stay in sync.
 */

import { AiAddendumFormData, formatEffectiveDate, partyLabel } from "./aiAddendum";

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

export interface AiAddendumCoverPageModel {
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

export function buildCoverPage(data: AiAddendumFormData): AiAddendumCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const customerName = partyLabel(data.customer, "Customer");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    customerName,
    effectiveDate,
    introParagraph:
      "This AI Addendum (the “Addendum”) consists of: (1) this Cover Page and (2) the AI Addendum Standard Terms, which are attached and incorporated by reference. This Addendum supplements and is incorporated into the underlying agreement described below (the “Agreement”). Any modifications to the Standard Terms are made on this Cover Page, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Addendum is entered into by ${providerName} (“Provider”) and ${customerName} (“Customer”) as of the Effective Date.`,
    fields: [
      {
        heading: "Base Agreement",
        note: "The underlying agreement and Product this Addendum supplements",
        value: data.baseAgreementDescription.trim() || "[Base agreement]",
      },
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Training Data Use",
        note: "Whether and how Provider may use Customer's data to train the Product's AI features",
        value:
          data.trainingDataUse.trim() ||
          "Provider may use Customer's data to train and improve the Product's AI features, subject to the restrictions below.",
      },
      {
        heading: "Training Restrictions",
        value: data.trainingRestrictions.trim() || "None.",
      },
      {
        heading: "Improvement Restrictions",
        note: "Limits on using Input, Output, and Training Data for non-training improvement",
        value: data.improvementRestrictions.trim() || "None.",
      },
    ],
    signatureIntro:
      "By signing this Cover Page, each party agrees to enter into this Addendum as of the Effective Date.",
    signatureRows: [
      { label: "Signature", provider: "", customer: "" },
      { label: "Company", provider: providerName, customer: customerName },
      { label: "Date", provider: "", customer: "" },
    ],
    attribution: "Common Paper AI Addendum, free to use under CC BY 4.0.",
  };
}
