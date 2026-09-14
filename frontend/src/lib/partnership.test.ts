import { describe, expect, it } from "vitest";
import {
  defaultPartnershipFormData,
  formatEffectiveDate,
  missingRequiredFields,
  partnershipFileSlug,
  partyLabel,
  type PartnershipFormData,
} from "./partnership";

function makeData(overrides: Partial<PartnershipFormData> = {}): PartnershipFormData {
  return {
    ...defaultPartnershipFormData,
    effectiveDate: "2026-09-11",
    company: "Acme, Inc.",
    partner: "Globex Corp.",
    governingLaw: "Delaware",
    chosenCourts: "New Castle County, Delaware",
    obligations: "Company will promote Partner's product to its customers.",
    ...overrides,
  };
}

describe("formatEffectiveDate", () => {
  it("formats an ISO date as a long US date", () => {
    expect(formatEffectiveDate("2026-09-11")).toBe("September 11, 2026");
  });

  it("falls back to a placeholder for an empty or invalid date", () => {
    expect(formatEffectiveDate("")).toBe("[Effective Date]");
    expect(formatEffectiveDate("not-a-date")).toBe("[Effective Date]");
  });
});

describe("partyLabel", () => {
  it("uses the name when present", () => {
    expect(partyLabel("  Acme, Inc.  ", "Company")).toBe("Acme, Inc.");
  });

  it("falls back when the name is blank or whitespace", () => {
    expect(partyLabel("", "Company")).toBe("Company");
    expect(partyLabel("   ", "Company")).toBe("Company");
  });
});

describe("missingRequiredFields", () => {
  it("lists every required field when the form is empty", () => {
    const data = makeData({
      company: "",
      partner: "",
      effectiveDate: "",
      governingLaw: "",
      chosenCourts: "",
      obligations: "",
    });
    expect(missingRequiredFields(data)).toEqual([
      "Company name",
      "Partner name",
      "Effective date",
      "Governing law",
      "Chosen courts",
      "Obligations",
    ]);
  });

  it("returns an empty list once all required fields are filled", () => {
    expect(missingRequiredFields(makeData())).toEqual([]);
  });

  it("treats whitespace-only values as missing", () => {
    const data = makeData({ company: "   " });
    expect(missingRequiredFields(data)).toEqual(["Company name"]);
  });

  it("requires obligations even when every other field is filled", () => {
    const data = makeData({ obligations: "   " });
    expect(missingRequiredFields(data)).toEqual(["Obligations"]);
  });
});

describe("partnershipFileSlug", () => {
  it("builds a slug from both company names", () => {
    const data = makeData({ company: "Acme, Inc.", partner: "Globex Corp." });
    expect(partnershipFileSlug(data)).toBe("Acme-Inc-and-Globex-Corp");
  });

  it("falls back to a generic slug when both companies are blank", () => {
    expect(partnershipFileSlug(makeData({ company: "", partner: "" }))).toBe("parties");
  });

  it("uses whichever single company name is present", () => {
    const data = makeData({ company: "Acme, Inc.", partner: "" });
    expect(partnershipFileSlug(data)).toBe("Acme-Inc");
  });
});
