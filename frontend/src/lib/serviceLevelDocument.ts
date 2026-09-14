/**
 * Turns the form data into a presentation-ready model of the Service Level
 * Agreement's Order Form. Both the on-screen preview and the PDF renderer
 * consume this so the two always stay in sync.
 */

import { ServiceLevelFormData, formatEffectiveDate, partyLabel } from "./serviceLevel";

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

export interface ServiceLevelCoverPageModel {
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

export function buildCoverPage(data: ServiceLevelFormData): ServiceLevelCoverPageModel {
  const providerName = partyLabel(data.provider, "Provider");
  const customerName = partyLabel(data.customer, "Customer");
  const effectiveDate = formatEffectiveDate(data.effectiveDate);

  return {
    providerName,
    customerName,
    effectiveDate,
    introParagraph:
      "This Service Level Agreement (the “Agreement”) consists of: (1) this Order Form and (2) the Service Level Agreement Standard Terms, which are attached and incorporated by reference. Any modifications to the Standard Terms are made on this Order Form, which controls over any conflict with the Standard Terms.",
    partiesParagraph: `This Agreement is entered into by ${providerName} (“Provider”) and ${customerName} (“Customer”) as of the Effective Date.`,
    fields: [
      {
        heading: "Effective Date",
        value: effectiveDate,
      },
      {
        heading: "Target Uptime",
        note: "The minimum monthly uptime Provider commits to for the Cloud Service",
        value: data.targetUptime.trim() || "99.9%",
      },
      {
        heading: "Target Response Time",
        note: "How quickly Provider commits to acknowledge support requests",
        value: data.targetResponseTime.trim() || "24 hours",
      },
      {
        heading: "Support Channel",
        note: "Where Customer submits support requests",
        value: data.supportChannel.trim() || "Email support.",
      },
      {
        heading: "Uptime Credit",
        note: "The Service Credit owed if Target Uptime is not met",
        value: data.uptimeCredit.trim() || "None.",
      },
      {
        heading: "Response Time Credit",
        note: "The Service Credit owed if Target Response Time is not met",
        value: data.responseTimeCredit.trim() || "None.",
      },
      {
        heading: "Subscription Period",
        value: data.subscriptionPeriod.trim() || "12 months",
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
      "By signing this Order Form, each party agrees to enter into this Agreement as of the Effective Date.",
    signatureRows: [
      { label: "Signature", provider: "", customer: "" },
      { label: "Company", provider: providerName, customer: customerName },
      { label: "Date", provider: "", customer: "" },
    ],
    attribution:
      "Common Paper Service Level Agreement, free to use under CC BY 4.0.",
  };
}
