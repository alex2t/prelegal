/**
 * Types, defaults and formatting helpers for the Partnership Agreement
 * creator.
 *
 * Common Paper's actual fill-in "Cover Page" for this template isn't
 * published alongside the Standard Terms - these fields were derived from
 * the `keyterms_link`/`businessterms_link` placeholders referenced in
 * templates/Partnership-Agreement.md (Company, Partner, Effective Date,
 * Governing Law, Chosen Courts, Obligations, Payment Process, Payment
 * Schedule, Territory, End Date, Brand Guidelines, Additional Warranties,
 * General Cap Amount).
 */

export interface PartnershipFormData {
  company: string;
  partner: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  governingLaw: string; // US state
  chosenCourts: string;
  obligations: string;
  paymentProcess: string;
  paymentSchedule: string;
  territory: string;
  endDate: string;
  brandGuidelines: string;
  additionalWarranties: string;
  generalCapAmount: string;
}

export const defaultPartnershipFormData: PartnershipFormData = {
  company: "",
  partner: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  governingLaw: "",
  chosenCourts: "",
  obligations: "",
  paymentProcess: "As mutually agreed in writing.",
  paymentSchedule: "Monthly.",
  territory: "Worldwide.",
  endDate: "Until terminated by either party.",
  brandGuidelines: "None.",
  additionalWarranties: "None.",
  generalCapAmount: "The total Fees paid in the 12 months before the claim.",
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
export function missingRequiredFields(data: PartnershipFormData): string[] {
  const missing: string[] = [];
  if (!data.company.trim()) missing.push("Company name");
  if (!data.partner.trim()) missing.push("Partner name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  if (!data.obligations.trim()) missing.push("Obligations");
  return missing;
}

export function partnershipFileSlug(data: PartnershipFormData): string {
  const parts = [data.company, data.partner]
    .map((name) =>
      name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return parts.length ? parts.join("-and-") : "parties";
}
