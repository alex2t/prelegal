/**
 * Types, defaults and formatting helpers for the Service Level Agreement
 * creator.
 *
 * In Common Paper's actual design, the SLA Standard Terms have no fields of
 * their own - they attach to a Cloud Service Agreement and every variable
 * used in them (Target Uptime, Support Channel, etc.) lives on that CSA's
 * Order Form, so the SLA cannot stand alone. This app does not yet support
 * documents attaching to other documents, so - following the same
 * simplification already used for the Design Partner Agreement and Pilot
 * Agreement - this module invents a minimal standalone "Order Form" with
 * generic party/date/governing-law scaffolding fields plus the SLA's own
 * variables, so the SLA can be generated as its own complete, signable
 * document.
 */

export interface ServiceLevelFormData {
  provider: string;
  customer: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  governingLaw: string; // US state
  chosenCourts: string;
  targetUptime: string;
  targetResponseTime: string;
  supportChannel: string;
  uptimeCredit: string;
  responseTimeCredit: string;
  subscriptionPeriod: string;
}

export const defaultServiceLevelFormData: ServiceLevelFormData = {
  provider: "",
  customer: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  governingLaw: "",
  chosenCourts: "",
  targetUptime: "99.9%",
  targetResponseTime: "24 hours",
  supportChannel: "Email support.",
  uptimeCredit: "None.",
  responseTimeCredit: "None.",
  subscriptionPeriod: "12 months",
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
export function missingRequiredFields(data: ServiceLevelFormData): string[] {
  const missing: string[] = [];
  if (!data.provider.trim()) missing.push("Provider company name");
  if (!data.customer.trim()) missing.push("Customer company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.chosenCourts.trim()) missing.push("Chosen courts");
  return missing;
}

export function serviceLevelFileSlug(data: ServiceLevelFormData): string {
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
