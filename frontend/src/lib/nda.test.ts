import { describe, expect, it, vi } from "vitest";
import {
  confidentialityTermText,
  defaultFormData,
  emptyParty,
  formatEffectiveDate,
  missingRequiredFields,
  mndaTermText,
  ndaFileSlug,
  partyLabel,
  todayIso,
  type NdaFormData,
} from "./nda";

// defaultFormData ships with a blank effectiveDate (it's filled in by the
// page on mount) - tests that don't care about that field opt back in to a
// concrete date so they aren't tripped up by the "Effective date" check.
function makeData(overrides: Partial<NdaFormData> = {}): NdaFormData {
  return {
    ...defaultFormData,
    party1: { ...emptyParty },
    party2: { ...emptyParty },
    effectiveDate: "2026-09-11",
    ...overrides,
  };
}

describe("todayIso", () => {
  it("formats the current local date as zero-padded yyyy-mm-dd", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0, 0));
    expect(todayIso()).toBe("2026-01-05");
    vi.useRealTimers();
  });
});

describe("formatEffectiveDate", () => {
  it("formats an ISO date as a long US date", () => {
    expect(formatEffectiveDate("2026-09-11")).toBe("September 11, 2026");
  });

  it("falls back to a placeholder for an empty or invalid date", () => {
    expect(formatEffectiveDate("")).toBe("[Effective Date]");
    expect(formatEffectiveDate("not-a-date")).toBe("[Effective Date]");
  });
});

describe("mndaTermText", () => {
  it("describes a fixed term using the year count, singular", () => {
    const data = makeData({ mndaTermKind: "fixed", mndaTermYears: 1 });
    expect(mndaTermText(data)).toBe("Expires 1 year from the Effective Date.");
  });

  it("describes a fixed term using the year count, plural", () => {
    const data = makeData({ mndaTermKind: "fixed", mndaTermYears: 3 });
    expect(mndaTermText(data)).toBe(
      "Expires 3 years from the Effective Date.",
    );
  });

  it("falls back to 1 year for a non-positive year count", () => {
    const data = makeData({ mndaTermKind: "fixed", mndaTermYears: 0 });
    expect(mndaTermText(data)).toBe("Expires 1 year from the Effective Date.");
  });

  it("describes an until-terminated term", () => {
    const data = makeData({ mndaTermKind: "untilTerminated" });
    expect(mndaTermText(data)).toBe(
      "Continues until terminated in accordance with the terms of the MNDA.",
    );
  });
});

describe("confidentialityTermText", () => {
  it("describes a fixed confidentiality term", () => {
    const data = makeData({
      confidentialityTermKind: "fixed",
      confidentialityTermYears: 2,
    });
    expect(confidentialityTermText(data)).toContain("2 years from the Effective Date");
  });

  it("describes a perpetual confidentiality term", () => {
    const data = makeData({ confidentialityTermKind: "perpetual" });
    expect(confidentialityTermText(data)).toBe("In perpetuity.");
  });
});

describe("partyLabel", () => {
  it("uses the company name when present", () => {
    expect(partyLabel({ ...emptyParty, company: "  Acme, Inc.  " }, "Party 1")).toBe(
      "Acme, Inc.",
    );
  });

  it("falls back when the company name is blank or whitespace", () => {
    expect(partyLabel(emptyParty, "Party 1")).toBe("Party 1");
    expect(partyLabel({ ...emptyParty, company: "   " }, "Party 1")).toBe("Party 1");
  });
});

describe("missingRequiredFields", () => {
  it("lists every required field when the form is empty", () => {
    const data = makeData({
      purpose: "",
      effectiveDate: "",
      governingLaw: "",
      jurisdiction: "",
    });
    expect(missingRequiredFields(data)).toEqual([
      "Party 1 company name",
      "Party 2 company name",
      "Purpose",
      "Effective date",
      "Governing law",
      "Jurisdiction",
    ]);
  });

  it("flags a cleared effective date even when every other field is filled", () => {
    const data = makeData({
      party1: { ...emptyParty, company: "Acme, Inc." },
      party2: { ...emptyParty, company: "Globex Corp." },
      effectiveDate: "",
      governingLaw: "Delaware",
      jurisdiction: "New Castle County, Delaware",
    });
    expect(missingRequiredFields(data)).toEqual(["Effective date"]);
  });

  it("returns an empty list once all required fields are filled", () => {
    const data = makeData({
      party1: { ...emptyParty, company: "Acme, Inc." },
      party2: { ...emptyParty, company: "Globex Corp." },
      purpose: "Evaluating a partnership.",
      governingLaw: "Delaware",
      jurisdiction: "New Castle County, Delaware",
    });
    expect(missingRequiredFields(data)).toEqual([]);
  });

  it("treats whitespace-only values as missing", () => {
    const data = makeData({
      party1: { ...emptyParty, company: "   " },
      party2: { ...emptyParty, company: "Globex Corp." },
      purpose: "  ",
      governingLaw: "Delaware",
      jurisdiction: "New Castle County, Delaware",
    });
    expect(missingRequiredFields(data)).toEqual([
      "Party 1 company name",
      "Purpose",
    ]);
  });
});

describe("ndaFileSlug", () => {
  it("builds a slug from both company names", () => {
    const data = makeData({
      party1: { ...emptyParty, company: "Acme, Inc." },
      party2: { ...emptyParty, company: "Globex Corp." },
    });
    expect(ndaFileSlug(data)).toBe("Acme-Inc-and-Globex-Corp");
  });

  it("falls back to a generic slug when both companies are blank", () => {
    expect(ndaFileSlug(makeData())).toBe("parties");
  });

  it("uses whichever single company name is present", () => {
    const data = makeData({
      party1: { ...emptyParty, company: "Acme, Inc." },
    });
    expect(ndaFileSlug(data)).toBe("Acme-Inc");
  });
});
