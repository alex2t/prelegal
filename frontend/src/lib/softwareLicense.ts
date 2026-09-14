/**
 * Types, defaults and formatting helpers for the Software License Agreement
 * creator.
 *
 * Fields mirror the `orderform_link`/`keyterms_link` placeholders referenced
 * in templates/Software-License-Agreement.md (Provider, Customer, Effective
 * Date, Governing Law, Chosen Courts, Subscription Period, Permitted Uses,
 * License Limits, Payment Process, Warranty Period, Additional Warranties,
 * General Cap Amount, Deletion Procedure).
 */

export interface SoftwareLicenseFormData {
  provider: string;
  customer: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  governingLaw: string; // US state
  chosenCourts: string;
  subscriptionPeriod: string;
  permittedUses: string;
  licenseLimits: string;
  paymentProcess: string;
  warrantyPeriod: string;
  additionalWarranties: string;
  generalCapAmount: string;
  deletionProcedure: string;
}

export const defaultSoftwareLicenseFormData: SoftwareLicenseFormData = {
  provider: "",
  customer: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  governingLaw: "",
  chosenCourts: "",
  subscriptionPeriod: "12 months",
  permittedUses: "Internal business purposes.",
  licenseLimits: "None specified.",
  paymentProcess: "Invoiced annually in advance.",
  warrantyPeriod: "90 days.",
  additionalWarranties: "None.",
  generalCapAmount: "The total Fees paid in the 12 months before the claim.",
  deletionProcedure: "Provider will delete Customer data within 30 days of termination.",
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
export function missingRequiredFields(data: SoftwareLicenseFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.customer.trim()) missing.push("Customer company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  return missing;
}

export function softwareLicenseFileSlug(data: SoftwareLicenseFormData): string {
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
