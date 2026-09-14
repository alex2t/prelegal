import { describe, expect, it } from "vitest";
import { defaultBusinessAssociateFormData, type BusinessAssociateFormData } from "./businessAssociate";
import { buildCoverPage } from "./businessAssociateDocument";

function makeData(overrides: Partial<BusinessAssociateFormData> = {}): BusinessAssociateFormData {
  return { ...defaultBusinessAssociateFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      company: "Globex Corp.",
      effectiveDate: "2026-09-11",
      baseAgreementDescription: "the Cloud Service Agreement dated January 1, 2026",
      limitations: "Provider may not offshore PHI.",
      breachNotificationPeriod: "48 hours.",
    });

    const model = buildCoverPage(data);

    expect(model.providerName).toBe("Acme, Inc.");
    expect(model.companyName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This BAA is entered into by Acme, Inc. (“Provider”) and Globex Corp. (“Company”) as of the BAA Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Base Agreement")?.value).toBe(
      "the Cloud Service Agreement dated January 1, 2026",
    );
    expect(model.fields.find((f) => f.heading === "Limitations")?.value).toBe(
      "Provider may not offshore PHI.",
    );
    expect(model.fields.find((f) => f.heading === "Breach Notification Period")?.value).toBe(
      "48 hours.",
    );

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      provider: "Acme, Inc.",
      company: "Globex Corp.",
    });
  });

  it("uses placeholders for party names and the base agreement description when blank", () => {
    const model = buildCoverPage(makeData({ baseAgreementDescription: "" }));

    expect(model.providerName).toBe("Provider");
    expect(model.companyName).toBe("Company");
    expect(model.fields.find((f) => f.heading === "Base Agreement")?.value).toBe(
      "[Base agreement]",
    );
  });

  it("falls back to default text for limitations and breach notification period when left blank", () => {
    const model = buildCoverPage(makeData({ limitations: "", breachNotificationPeriod: "" }));
    expect(model.fields.find((f) => f.heading === "Limitations")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Breach Notification Period")?.value).toBe(
      "5 business days.",
    );
  });
});
