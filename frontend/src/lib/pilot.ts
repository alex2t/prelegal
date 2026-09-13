/**
 * Types, defaults and formatting helpers for the Pilot Agreement creator.
 *
 * Like the Design Partner Agreement, Common Paper's actual fill-in "Order
 * Form" for this template isn't published alongside the Standard Terms -
 * these fields were derived from the `orderform_link` placeholders
 * referenced in templates/Pilot-Agreement.md (Provider, Customer, Effective
 * Date, Pilot Period, Governing Law, Chosen Courts, General Cap Amount,
 * Notice Address), plus Product and Fees from the Definitions section.
 */

export interface PilotFormData {
  provider: string;
  customer: string;
  product: string;
  fees: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  pilotPeriod: string;
  governingLaw: string; // US state
  chosenCourts: string;
  generalCapAmount: string;
  noticeAddress: string;
}

export const defaultPilotFormData: PilotFormData = {
  provider: "",
  customer: "",
  product: "The Product being evaluated.",
  fees: "None.",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  pilotPeriod: "30 days",
  governingLaw: "",
  chosenCourts: "",
  generalCapAmount: "The total Fees paid under this Agreement.",
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
export function missingRequiredFields(data: PilotFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.customer.trim()) missing.push("Customer company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.pilotPeriod.trim()) missing.push("Pilot period");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  return missing;
}

export function pilotFileSlug(data: PilotFormData): string {
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
