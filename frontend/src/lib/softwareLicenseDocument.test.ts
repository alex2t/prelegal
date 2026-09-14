import { describe, expect, it } from "vitest";
import { defaultSoftwareLicenseFormData, type SoftwareLicenseFormData } from "./softwareLicense";
import { buildCoverPage } from "./softwareLicenseDocument";

function makeData(overrides: Partial<SoftwareLicenseFormData> = {}): SoftwareLicenseFormData {
  return { ...defaultSoftwareLicenseFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
      effectiveDate: "2026-09-11",
      subscriptionPeriod: "24 months",
      permittedUses: "Internal analytics only.",
      licenseLimits: "Up to 50 users.",
      paymentProcess: "Invoiced quarterly in advance.",
      warrantyPeriod: "180 days.",
      additionalWarranties: "Provider warrants SOC 2 compliance.",
      generalCapAmount: "$100,000.",
      deletionProcedure: "Provider will delete Customer data within 7 days of termination.",
      governingLaw: "Delaware",
      chosenCourts: "New Castle County, Delaware",
    });

    const model = buildCoverPage(data);

    expect(model.providerName).toBe("Acme, Inc.");
    expect(model.customerName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This Agreement is entered into by Acme, Inc. (“Provider”) and Globex Corp. (“Customer”) as of the Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Subscription Period")?.value).toBe(
      "24 months",
    );
    expect(model.fields.find((f) => f.heading === "Permitted Uses")?.value).toBe(
      "Internal analytics only.",
    );
    expect(model.fields.find((f) => f.heading === "License Limits")?.value).toBe(
      "Up to 50 users.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Process")?.value).toBe(
      "Invoiced quarterly in advance.",
    );
    expect(model.fields.find((f) => f.heading === "Warranty Period")?.value).toBe("180 days.");
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe(
      "Provider warrants SOC 2 compliance.",
    );
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe("$100,000.");
    expect(model.fields.find((f) => f.heading === "Deletion Procedure")?.value).toBe(
      "Provider will delete Customer data within 7 days of termination.",
    );
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("Delaware");
    expect(model.fields.find((f) => f.heading === "Chosen Courts")?.value).toBe(
      "New Castle County, Delaware",
    );

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
    });
  });

  it("uses placeholders for party names, governing law and chosen courts when blank", () => {
    const model = buildCoverPage(makeData({ governingLaw: "", chosenCourts: "" }));

    expect(model.providerName).toBe("Provider");
    expect(model.customerName).toBe("Customer");
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("[State]");
    expect(model.fields.find((f) => f.heading === "Chosen Courts")?.value).toBe(
      "[City or county and state]",
    );
  });

  it("falls back to default text for the optional fields when left blank", () => {
    const model = buildCoverPage(
      makeData({
        subscriptionPeriod: "",
        permittedUses: "",
        licenseLimits: "",
        paymentProcess: "",
        warrantyPeriod: "",
        additionalWarranties: "",
        generalCapAmount: "",
        deletionProcedure: "",
      }),
    );
    expect(model.fields.find((f) => f.heading === "Subscription Period")?.value).toBe(
      "12 months",
    );
    expect(model.fields.find((f) => f.heading === "Permitted Uses")?.value).toBe(
      "Internal business purposes.",
    );
    expect(model.fields.find((f) => f.heading === "License Limits")?.value).toBe(
      "None specified.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Process")?.value).toBe(
      "Invoiced annually in advance.",
    );
    expect(model.fields.find((f) => f.heading === "Warranty Period")?.value).toBe("90 days.");
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "The total Fees paid in the 12 months before the claim.",
    );
    expect(model.fields.find((f) => f.heading === "Deletion Procedure")?.value).toBe(
      "Provider will delete Customer data within 30 days of termination.",
    );
  });
});
