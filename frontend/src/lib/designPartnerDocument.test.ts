import { describe, expect, it } from "vitest";
import { defaultDesignPartnerFormData, type DesignPartnerFormData } from "./designPartner";
import { buildCoverPage } from "./designPartnerDocument";

function makeData(overrides: Partial<DesignPartnerFormData> = {}): DesignPartnerFormData {
  return { ...defaultDesignPartnerFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      partner: "Globex Corp.",
      program: "Early access to the beta product.",
      fees: "$500/month",
      effectiveDate: "2026-09-11",
      term: "6 months",
      governingLaw: "Delaware",
      chosenCourts: "New Castle County, Delaware",
    });

    const model = buildCoverPage(data);

    expect(model.providerName).toBe("Acme, Inc.");
    expect(model.partnerName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This Agreement is entered into by Acme, Inc. (“Provider”) and Globex Corp. (“Partner”) as of the Effective Date.",
    );

    const programField = model.fields.find((f) => f.heading === "Program");
    expect(programField?.value).toBe("Early access to the beta product.");

    const feesField = model.fields.find((f) => f.heading === "Fees");
    expect(feesField?.value).toBe("$500/month");

    const governingLawField = model.fields.find((f) => f.heading === "Governing Law");
    expect(governingLawField?.value).toBe("Delaware");

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      provider: "Acme, Inc.",
      partner: "Globex Corp.",
    });
  });

  it("uses placeholders for party names, governing law and chosen courts when blank", () => {
    const model = buildCoverPage(makeData({ governingLaw: "", chosenCourts: "" }));

    expect(model.providerName).toBe("Provider");
    expect(model.partnerName).toBe("Partner");

    const governingLawField = model.fields.find((f) => f.heading === "Governing Law");
    expect(governingLawField?.value).toBe("[State]");

    const chosenCourtsField = model.fields.find((f) => f.heading === "Chosen Courts");
    expect(chosenCourtsField?.value).toBe("[City or county and state]");
  });

  it("falls back to default text for fees and term when left blank", () => {
    const model = buildCoverPage(makeData({ fees: "", term: "" }));
    expect(model.fields.find((f) => f.heading === "Fees")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Term")?.value).toBe("12 months");
  });
});
