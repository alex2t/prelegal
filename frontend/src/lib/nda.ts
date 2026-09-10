/**
 * Types, defaults and formatting helpers for the Mutual NDA creator.
 *
 * The generated document pairs a filled-in Cover Page (the values below) with
 * the Common Paper Mutual NDA Standard Terms v1.0 (see `standardTerms.ts`).
 */

export interface Party {
  company: string;
  signatoryName: string;
  title: string;
  noticeAddress: string;
}

/** How the MNDA itself ends. */
export type MndaTermKind = "fixed" | "untilTerminated";

/** How long Confidential Information stays protected. */
export type ConfidentialityTermKind = "fixed" | "perpetual";

export interface NdaFormData {
  party1: Party;
  party2: Party;
  purpose: string;
  effectiveDate: string; // ISO `yyyy-mm-dd`
  mndaTermKind: MndaTermKind;
  mndaTermYears: number;
  confidentialityTermKind: ConfidentialityTermKind;
  confidentialityTermYears: number;
  governingLaw: string; // US state
  jurisdiction: string; // city or county and state
  modifications: string;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const emptyParty: Party = {
  company: "",
  signatoryName: "",
  title: "",
  noticeAddress: "",
};

export const defaultFormData: NdaFormData = {
  party1: { ...emptyParty },
  party2: { ...emptyParty },
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: todayIso(),
  mndaTermKind: "fixed",
  mndaTermYears: 1,
  confidentialityTermKind: "fixed",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
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

function years(n: number): string {
  const safe = Number.isFinite(n) && n > 0 ? n : 1;
  return `${safe} year${safe === 1 ? "" : "s"}`;
}

export function mndaTermText(data: NdaFormData): string {
  return data.mndaTermKind === "fixed"
    ? `Expires ${years(data.mndaTermYears)} from the Effective Date.`
    : "Continues until terminated in accordance with the terms of the MNDA.";
}

export function confidentialityTermText(data: NdaFormData): string {
  return data.confidentialityTermKind === "fixed"
    ? `${years(
        data.confidentialityTermYears,
      )} from the Effective Date, but in the case of trade secrets until the Confidential Information is no longer considered a trade secret under applicable law.`
    : "In perpetuity.";
}

export function partyLabel(party: Party, fallback: string): string {
  return party.company.trim() || fallback;
}

/** Fields that must be filled before the document can be downloaded. */
export function missingRequiredFields(data: NdaFormData): string[] {
  const missing: string[] = [];
  if (!data.party1.company.trim()) missing.push("Party 1 company name");
  if (!data.party2.company.trim()) missing.push("Party 2 company name");
  if (!data.purpose.trim()) missing.push("Purpose");
  if (!data.governingLaw.trim()) missing.push("Governing law");
  if (!data.jurisdiction.trim()) missing.push("Jurisdiction");
  return missing;
}

export function ndaFileSlug(data: NdaFormData): string {
  const parts = [data.party1.company, data.party2.company]
    .map((name) =>
      name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return parts.length ? parts.join("-and-") : "parties";
}
