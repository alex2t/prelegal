import { describe, expect, it } from "vitest";
import {
  businessAssociateFileSlug,
  defaultBusinessAssociateFormData,
  formatEffectiveDate,
  missingRequiredFields,
  partyLabel,
  type BusinessAssociateFormData,
} from "./businessAssociate";

function makeData(overrides: Partial<BusinessAssociateFormData> = {}): BusinessAssociateFormData {
  return { ...defaultBusinessAssociateFormData, effectiveDate: "2026-09-11", ...overrides };
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
    expect(partyLabel("  Acme, Inc.  ", "Provider")).toBe("Acme, Inc.");
  });

  it("falls back when the name is blank or whitespace", () => {
    expect(partyLabel("", "Provider")).toBe("Provider");
    expect(partyLabel("   ", "Provider")).toBe("Provider");
  });
});

describe("missingRequiredFields", () => {
  it("lists every required field when the form is empty", () => {
    const data = makeData({
      provider: "",
      company: "",
      effectiveDate: "",
      baseAgreementDescription: "",
    });
    expect(missingRequiredFields(data)).toEqual([
      "Provider company name",
      "Company name",
      "Effective date",
      "Base agreement description",
    ]);
  });

  it("returns an empty list once all required fields are filled", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      company: "Globex Corp.",
      baseAgreementDescription: "the Cloud Service Agreement dated January 1, 2026",
    });
    expect(missingRequiredFields(data)).toEqual([]);
  });

  it("treats whitespace-only values as missing", () => {
    const data = makeData({
      provider: "   ",
      company: "Globex Corp.",
      baseAgreementDescription: "the Cloud Service Agreement dated January 1, 2026",
    });
    expect(missingRequiredFields(data)).toEqual(["Provider company name"]);
  });
});

describe("businessAssociateFileSlug", () => {
  it("builds a slug from both company names", () => {
    const data = makeData({ provider: "Acme, Inc.", company: "Globex Corp." });
    expect(businessAssociateFileSlug(data)).toBe("Acme-Inc-and-Globex-Corp");
  });

  it("falls back to a generic slug when both companies are blank", () => {
    expect(businessAssociateFileSlug(makeData({ provider: "", company: "" }))).toBe("parties");
  });

  it("uses whichever single company name is present", () => {
    const data = makeData({ provider: "Acme, Inc.", company: "" });
    expect(businessAssociateFileSlug(data)).toBe("Acme-Inc");
  });
});
