/**
 * Types, defaults and formatting helpers for the Data Processing Agreement
 * creator.
 *
 * Common Paper's real DPA Cover Page requires GDPR-specific structured
 * annexes (subprocessor lists, categories of personal data as tables,
 * per-module SCC selections). For this MVP, every such annex is simplified
 * into a single plain-text field rather than a table or repeating-group UI.
 */

export interface DataProcessingFormData {
  controller: string;
  processor: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  governingMemberState: string;
  categoriesOfPersonalData: string;
  categoriesOfDataSubjects: string;
  purposeOfProcessing: string;
  durationOfProcessing: string;
  specialCategoryData: string;
  approvedSubprocessors: string;
  providerSecurityContact: string;
}

export const defaultDataProcessingFormData: DataProcessingFormData = {
  controller: "",
  processor: "",
  // Left blank rather than `todayIso()`: this constant is evaluated once at
  // module load, which on a prerendered page would freeze "today" to build
  // time. The page fills in the real local date on mount instead.
  effectiveDate: "",
  governingMemberState: "",
  categoriesOfPersonalData: "",
  categoriesOfDataSubjects: "",
  purposeOfProcessing: "",
  durationOfProcessing: "The term of the Agreement.",
  specialCategoryData: "None.",
  approvedSubprocessors: "None.",
  providerSecurityContact: "",
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
export function missingRequiredFields(data: DataProcessingFormData): string[] {
  const missing: string[] = [];
  if (!data.controller.trim()) missing.push("Controller company name");
  if (!data.processor.trim()) missing.push("Processor company name");
  if (!data.effectiveDate.trim()) missing.push("Effective date");
  if (!data.governingMemberState.trim()) missing.push("Governing member state");
  if (!data.categoriesOfPersonalData.trim()) missing.push("Categories of personal data");
  if (!data.categoriesOfDataSubjects.trim()) missing.push("Categories of data subjects");
  if (!data.purposeOfProcessing.trim()) missing.push("Purpose of processing");
  return missing;
}

export function dataProcessingFileSlug(data: DataProcessingFormData): string {
  const parts = [data.controller, data.processor]
    .map((name) =>
      name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return parts.length ? parts.join("-and-") : "parties";
}
