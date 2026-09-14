import { describe, expect, it } from "vitest";
import {
  dataProcessingFileSlug,
  defaultDataProcessingFormData,
  formatEffectiveDate,
  missingRequiredFields,
  partyLabel,
  type DataProcessingFormData,
} from "./dataProcessing";

function makeData(overrides: Partial<DataProcessingFormData> = {}): DataProcessingFormData {
  return { ...defaultDataProcessingFormData, effectiveDate: "2026-09-11", ...overrides };
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
    expect(partyLabel("  Acme, Inc.  ", "Controller")).toBe("Acme, Inc.");
  });

  it("falls back when the name is blank or whitespace", () => {
    expect(partyLabel("", "Controller")).toBe("Controller");
    expect(partyLabel("   ", "Controller")).toBe("Controller");
  });
});

describe("missingRequiredFields", () => {
  it("lists every required field when the form is empty", () => {
    const data = makeData({
      controller: "",
      processor: "",
      effectiveDate: "",
      governingMemberState: "",
      categoriesOfPersonalData: "",
      categoriesOfDataSubjects: "",
      purposeOfProcessing: "",
    });
    expect(missingRequiredFields(data)).toEqual([
      "Controller company name",
      "Processor company name",
      "Effective date",
      "Governing member state",
      "Categories of personal data",
      "Categories of data subjects",
      "Purpose of processing",
    ]);
  });

  it("returns an empty list once all required fields are filled", () => {
    const data = makeData({
      controller: "Acme, Inc.",
      processor: "Globex Corp.",
      governingMemberState: "Ireland",
      categoriesOfPersonalData: "Name, email address",
      categoriesOfDataSubjects: "Customer's employees",
      purposeOfProcessing: "Providing the Service",
    });
    expect(missingRequiredFields(data)).toEqual([]);
  });

  it("treats whitespace-only values as missing", () => {
    const data = makeData({
      controller: "   ",
      processor: "Globex Corp.",
      governingMemberState: "Ireland",
      categoriesOfPersonalData: "Name, email address",
      categoriesOfDataSubjects: "Customer's employees",
      purposeOfProcessing: "Providing the Service",
    });
    expect(missingRequiredFields(data)).toEqual(["Controller company name"]);
  });
});

describe("dataProcessingFileSlug", () => {
  it("builds a slug from both company names", () => {
    const data = makeData({ controller: "Acme, Inc.", processor: "Globex Corp." });
    expect(dataProcessingFileSlug(data)).toBe("Acme-Inc-and-Globex-Corp");
  });

  it("falls back to a generic slug when both companies are blank", () => {
    expect(dataProcessingFileSlug(makeData({ controller: "", processor: "" }))).toBe("parties");
  });

  it("uses whichever single company name is present", () => {
    const data = makeData({ controller: "Acme, Inc.", processor: "" });
    expect(dataProcessingFileSlug(data)).toBe("Acme-Inc");
  });
});
