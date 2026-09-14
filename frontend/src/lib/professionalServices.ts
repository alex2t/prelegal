/**
 * Types, defaults and formatting helpers for the Professional Services
 * Agreement creator.
 *
 * Common Paper's real PSA spec splits variables across two tiers: Key Terms
 * (agreement-level details like Provider, Customer, and Governing Law) and a
 * per-Statement-of-Work "SOW" tier (Deliverables, Fees, and similar
 * per-engagement details) referenced in templates/PSA.md via `keyterms_link`
 * and `sow_link` placeholders. For this MVP, both tiers are flattened into
 * one flat field set - there is no per-SOW repeating-group UI.
 */

export interface ProfessionalServicesFormData {
  provider: string;
  customer: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  governingLaw: string; // US state
  chosenCourts: string;
  deliverables: string;
  paymentPeriod: string;
  fees: string;
  sowTerm: string;
  rejectionPeriod: string;
  additionalWarranties: string;
  generalCapAmount: string;
  noticeAddress: string;
}

export const defaultProfessionalServicesFormData: ProfessionalServicesFormData = {
  provider: "",
  customer: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  governingLaw: "",
  chosenCourts: "",
  deliverables: "As mutually agreed in writing.",
  paymentPeriod: "Net 30 days.",
  fees: "As set forth in the applicable Statement of Work.",
  sowTerm: "Until completion of the Deliverables.",
  rejectionPeriod: "10 days.",
  additionalWarranties: "None.",
  generalCapAmount: "The total Fees paid under the applicable Statement of Work.",
  noticeAddress: "",
};

/** Format an ISO date as e.g. `September 10, 2026`; falls back to a placeholder. */
export function formatEffectiveDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "[Effective Date]";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function partyLabel(name: string, fallback: string): string {
  return name.trim() || fallback;
}

/** Fields that must be filled before the document can be downloaded. */
export function missingRequiredFields(data: ProfessionalServicesFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.customer.trim()) missing.push("Customer company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  return missing;
}

export function professionalServicesFileSlug(data: ProfessionalServicesFormData): string {
  const parts = [data.provider, data.customer]
    .map((name) =>
      name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return parts.length ? parts.join("-and-") : "parties";
}
