import { describe, expect, it } from "vitest";
import { defaultPartnershipFormData, type PartnershipFormData } from "./partnership";
import { buildCoverPage } from "./partnershipDocument";

function makeData(overrides: Partial<PartnershipFormData> = {}): PartnershipFormData {
  return { ...defaultPartnershipFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      company: "Acme, Inc.",
      partner: "Globex Corp.",
      effectiveDate: "2026-09-11",
      governingLaw: "Delaware",
      chosenCourts: "New Castle County, Delaware",
      obligations: "Company will promote Partner's product to its customers.",
      paymentProcess: "Invoiced monthly.",
      paymentSchedule: "Net 15.",
      territory: "United States.",
      endDate: "December 31, 2027.",
      brandGuidelines: "Per the attached brand guide.",
      additionalWarranties: "None beyond Section 7.",
      generalCapAmount: "$50,000.",
    });

    const model = buildCoverPage(data);

    expect(model.companyName).toBe("Acme, Inc.");
    expect(model.partnerName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This Agreement is entered into by Acme, Inc. (“Company”) and Globex Corp. (“Partner”) as of the Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Obligations")?.value).toBe(
      "Company will promote Partner's product to its customers.",
    );
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("Delaware");
    expect(model.fields.find((f) => f.heading === "Payment Process")?.value).toBe(
      "Invoiced monthly.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Schedule")?.value).toBe("Net 15.");
    expect(model.fields.find((f) => f.heading === "Territory")?.value).toBe("United States.");
    expect(model.fields.find((f) => f.heading === "End Date")?.value).toBe("December 31, 2027.");
    expect(model.fields.find((f) => f.heading === "Brand Guidelines")?.value).toBe(
      "Per the attached brand guide.",
    );
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe(
      "None beyond Section 7.",
    );
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe("$50,000.");

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      company: "Acme, Inc.",
      partner: "Globex Corp.",
    });
  });

  it("uses placeholders for party names, governing law and chosen courts when blank", () => {
    const model = buildCoverPage(makeData({ governingLaw: "", chosenCourts: "" }));

    expect(model.companyName).toBe("Company");
    expect(model.partnerName).toBe("Partner");
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("[State]");
    expect(model.fields.find((f) => f.heading === "Chosen Courts")?.value).toBe(
      "[City or county and state]",
    );
  });

  it("falls back to default text for optional fields when left blank", () => {
    const model = buildCoverPage(
      makeData({
        paymentProcess: "",
        paymentSchedule: "",
        territory: "",
        endDate: "",
        brandGuidelines: "",
        additionalWarranties: "",
        generalCapAmount: "",
      }),
    );
    expect(model.fields.find((f) => f.heading === "Payment Process")?.value).toBe(
      "As mutually agreed in writing.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Schedule")?.value).toBe("Monthly.");
    expect(model.fields.find((f) => f.heading === "Territory")?.value).toBe("Worldwide.");
    expect(model.fields.find((f) => f.heading === "End Date")?.value).toBe(
      "Until terminated by either party.",
    );
    expect(model.fields.find((f) => f.heading === "Brand Guidelines")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "The total Fees paid in the 12 months before the claim.",
    );
  });

  it("falls back to a placeholder for obligations when left blank", () => {
    const model = buildCoverPage(makeData({ obligations: "" }));
    expect(model.fields.find((f) => f.heading === "Obligations")?.value).toBe("[Obligations]");
  });
});
