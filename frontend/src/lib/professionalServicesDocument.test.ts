import { describe, expect, it } from "vitest";
import { defaultProfessionalServicesFormData, type ProfessionalServicesFormData } from "./professionalServices";
import { buildCoverPage } from "./professionalServicesDocument";

function makeData(
  overrides: Partial<ProfessionalServicesFormData> = {},
): ProfessionalServicesFormData {
  return { ...defaultProfessionalServicesFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
      effectiveDate: "2026-09-11",
      governingLaw: "Delaware",
      chosenCourts: "New Castle County, Delaware",
      deliverables: "A market analysis report.",
      fees: "$10,000",
      paymentPeriod: "Net 15 days.",
      sowTerm: "90 days.",
      rejectionPeriod: "5 days.",
      additionalWarranties: "None beyond Section 6.",
      generalCapAmount: "$50,000",
    });

    const model = buildCoverPage(data);

    expect(model.providerName).toBe("Acme, Inc.");
    expect(model.customerName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This Agreement is entered into by Acme, Inc. (“Provider”) and Globex Corp. (“Customer”) as of the Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Deliverables")?.value).toBe(
      "A market analysis report.",
    );
    expect(model.fields.find((f) => f.heading === "Fees")?.value).toBe("$10,000");
    expect(model.fields.find((f) => f.heading === "Payment Period")?.value).toBe(
      "Net 15 days.",
    );
    expect(model.fields.find((f) => f.heading === "SOW Term")?.value).toBe("90 days.");
    expect(model.fields.find((f) => f.heading === "Rejection Period")?.value).toBe(
      "5 days.",
    );
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe(
      "None beyond Section 6.",
    );
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "$50,000",
    );
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("Delaware");

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

  it("falls back to default text for optional fields when left blank", () => {
    const model = buildCoverPage(
      makeData({
        deliverables: "",
        paymentPeriod: "",
        fees: "",
        sowTerm: "",
        rejectionPeriod: "",
        additionalWarranties: "",
        generalCapAmount: "",
      }),
    );
    expect(model.fields.find((f) => f.heading === "Deliverables")?.value).toBe(
      "As mutually agreed in writing.",
    );
    expect(model.fields.find((f) => f.heading === "Fees")?.value).toBe(
      "As set forth in the applicable Statement of Work.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Period")?.value).toBe(
      "Net 30 days.",
    );
    expect(model.fields.find((f) => f.heading === "SOW Term")?.value).toBe(
      "Until completion of the Deliverables.",
    );
    expect(model.fields.find((f) => f.heading === "Rejection Period")?.value).toBe(
      "10 days.",
    );
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe(
      "None.",
    );
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "The total Fees paid under the applicable Statement of Work.",
    );
  });
});
