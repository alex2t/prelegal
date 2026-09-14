/**
 * Types, defaults and formatting helpers for the Business Associate
 * Agreement creator.
 *
 * Common Paper's real BAA is a rider that attaches to and depends on a
 * separate main "Agreement" (e.g. a Cloud Service Agreement) - it can't
 * stand alone. Like the Design Partner Agreement and Pilot Agreement, this
 * app doesn't yet support documents attaching to other documents, so
 * instead of a live link to another document, `baseAgreementDescription` is
 * a plain free-text field where the user describes what agreement this BAA
 * attaches to (e.g. "the Cloud Service Agreement dated January 1, 2026").
 */

export interface BusinessAssociateFormData {
  provider: string;
  company: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  baseAgreementDescription: string;
  limitations: string;
  breachNotificationPeriod: string;
}

export const defaultBusinessAssociateFormData: BusinessAssociateFormData = {
  provider: "",
  company: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  baseAgreementDescription: "",
  limitations: "None.",
  breachNotificationPeriod: "5 business days.",
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
export function missingRequiredFields(data: BusinessAssociateFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.company.trim()) missing.push("Company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.baseAgreementDescription.trim()) missing.push("Base agreement description");
  return missing;
}

export function businessAssociateFileSlug(data: BusinessAssociateFormData): string {
  const parts = [data.provider, data.company]
    .map((name) =>
      name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return parts.length ? parts.join("-and-") : "parties";
}
