/**
 * Types, defaults and formatting helpers for the AI Addendum creator.
 *
 * Common Paper's actual AI Addendum is a rider that supplements a separate
 * main Agreement and Product. This app doesn't yet support documents
 * attaching to other documents, so - following the same simplification
 * already used for the Design Partner Agreement and Pilot Agreement - it is
 * standalone-ified here: instead of a live link to another document, users
 * describe the underlying agreement/product in a free-text
 * `baseAgreementDescription` field.
 */

export interface AiAddendumFormData {
  provider: string;
  customer: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  baseAgreementDescription: string;
  trainingDataUse: string;
  trainingRestrictions: string;
  improvementRestrictions: string;
}

export const defaultAiAddendumFormData: AiAddendumFormData = {
  provider: "",
  customer: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  baseAgreementDescription: "",
  trainingDataUse:
    "Provider may use Customer's data to train and improve the Product's AI features, subject to the restrictions below.",
  trainingRestrictions: "None.",
  improvementRestrictions: "None.",
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
export function missingRequiredFields(data: AiAddendumFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.customer.trim()) missing.push("Customer company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.baseAgreementDescription.trim()) missing.push("Base agreement description");
  return missing;
}

export function aiAddendumFileSlug(data: AiAddendumFormData): string {
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
