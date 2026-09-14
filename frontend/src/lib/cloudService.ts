/**
 * Types, defaults and formatting helpers for the Cloud Service Agreement creator.
 *
 * Like the Design Partner and Pilot Agreements, Common Paper's actual fill-in
 * Cover Page for this template isn't published alongside the Standard Terms.
 * The real spec splits its Variables across two tiers - a per-subscription
 * Order Form and party-level Key Terms, referenced via the
 * `orderform_link`/`keyterms_link` spans in templates/CSA.md - flattened here
 * into one flat field set with no repeating per-subscription groups.
 *
 * Field names match `CloudServiceFields` in
 * backend/src/backend/documents/cloudService.py exactly (camelCase) so the
 * chat's JSON round-trips into this form with no mapping layer.
 */

export interface CloudServiceFormData {
  provider: string;
  customer: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  governingLaw: string; // US state
  chosenCourts: string;
  subscriptionPeriod: string;
  technicalSupport: string;
  paymentProcess: string;
  nonRenewalNoticeDate: string;
  useLimitations: string;
  generalCapAmount: string;
  additionalWarranties: string;
  noticeAddress: string;
}

export const defaultCloudServiceFormData: CloudServiceFormData = {
  provider: "",
  customer: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  governingLaw: "",
  chosenCourts: "",
  subscriptionPeriod: "12 months",
  technicalSupport: "Standard support during business hours, Monday through Friday.",
  paymentProcess: "Invoiced annually in advance.",
  nonRenewalNoticeDate: "30 days before the end of the Subscription Period.",
  useLimitations: "None.",
  generalCapAmount: "The total Fees paid in the 12 months before the claim.",
  additionalWarranties: "None.",
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
export function missingRequiredFields(data: CloudServiceFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.customer.trim()) missing.push("Customer company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  return missing;
}

export function cloudServiceFileSlug(data: CloudServiceFormData): string {
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
