/**
 * Types, defaults and formatting helpers for the Design Partner Agreement
 * creator.
 *
 * Unlike the Mutual NDA, Common Paper's actual fill-in "Cover Page" for this
 * template isn't published alongside the Standard Terms - these fields were
 * derived from the `keyterms_link` placeholders referenced in
 * templates/Design-Partner-Agreement.md (Partner, Provider, Program, Fees,
 * Term, Effective Date, Governing Law, Chosen Courts, Notice Address).
 */

export interface DesignPartnerFormData {
  provider: string;
  partner: string;
  program: string;
  fees: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  term: string;
  governingLaw: string; // US state
  chosenCourts: string;
  noticeAddress: string;
}

export const defaultDesignPartnerFormData: DesignPartnerFormData = {
  provider: "",
  partner: "",
  program:
    "Early access to the Product in exchange for feedback to help shape it.",
  fees: "None.",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  term: "12 months",
  governingLaw: "",
  chosenCourts: "",
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
export function missingRequiredFields(data: DesignPartnerFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.partner.trim()) missing.push("Partner company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  return missing;
}

export function designPartnerFileSlug(data: DesignPartnerFormData): string {
  const parts = [data.provider, data.partner]
    .map((name) =>
      name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return parts.length ? parts.join("-and-") : "parties";
}
