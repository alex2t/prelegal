import { describe, expect, it } from "vitest";
import { defaultCloudServiceFormData, type CloudServiceFormData } from "./cloudService";
import { buildCoverPage } from "./cloudServiceDocument";

function makeData(overrides: Partial<CloudServiceFormData> = {}): CloudServiceFormData {
  return { ...defaultCloudServiceFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
      effectiveDate: "2026-09-11",
      governingLaw: "Delaware",
      chosenCourts: "New Castle County, Delaware",
      subscriptionPeriod: "24 months",
      technicalSupport: "24/7 support with a 1-hour response time.",
      paymentProcess: "Invoiced quarterly in advance.",
      nonRenewalNoticeDate: "60 days before the end of the Subscription Period.",
      useLimitations: "Up to 50 seats.",
      generalCapAmount: "$100,000",
      additionalWarranties: "Provider will maintain SOC 2 Type II certification.",
      noticeAddress: "123 Main St, Anytown, DE",
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
    expect(model.fields.find((f) => f.heading === "Technical Support")?.value).toBe(
      "24/7 support with a 1-hour response time.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Process")?.value).toBe(
      "Invoiced quarterly in advance.",
    );
    expect(model.fields.find((f) => f.heading === "Non-Renewal Notice Date")?.value).toBe(
      "60 days before the end of the Subscription Period.",
    );
    expect(model.fields.find((f) => f.heading === "Use Limitations")?.value).toBe(
      "Up to 50 seats.",
    );
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "$100,000",
    );
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe(
      "Provider will maintain SOC 2 Type II certification.",
    );
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("Delaware");
    expect(model.fields.find((f) => f.heading === "Notice Address")?.value).toBe(
      "123 Main St, Anytown, DE",
    );

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
    });
  });

  it("uses placeholders for party names, governing law, chosen courts and notice address when blank", () => {
    const model = buildCoverPage(
      makeData({ governingLaw: "", chosenCourts: "", noticeAddress: "" }),
    );

    expect(model.providerName).toBe("Provider");
    expect(model.customerName).toBe("Customer");
    expect(model.fields.find((f) => f.heading === "Governing Law")?.value).toBe("[State]");
    expect(model.fields.find((f) => f.heading === "Chosen Courts")?.value).toBe(
      "[City or county and state]",
    );
    expect(model.fields.find((f) => f.heading === "Notice Address")?.value).toBe(
      "[Notice address]",
    );
  });

  it("falls back to default text for optional fields when left blank", () => {
    const model = buildCoverPage(
      makeData({
        subscriptionPeriod: "",
        technicalSupport: "",
        paymentProcess: "",
        nonRenewalNoticeDate: "",
        useLimitations: "",
        generalCapAmount: "",
        additionalWarranties: "",
      }),
    );
    expect(model.fields.find((f) => f.heading === "Subscription Period")?.value).toBe(
      "12 months",
    );
    expect(model.fields.find((f) => f.heading === "Technical Support")?.value).toBe(
      "Standard support during business hours, Monday through Friday.",
    );
    expect(model.fields.find((f) => f.heading === "Payment Process")?.value).toBe(
      "Invoiced annually in advance.",
    );
    expect(model.fields.find((f) => f.heading === "Non-Renewal Notice Date")?.value).toBe(
      "30 days before the end of the Subscription Period.",
    );
    expect(model.fields.find((f) => f.heading === "Use Limitations")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "The total Fees paid in the 12 months before the claim.",
    );
    expect(model.fields.find((f) => f.heading === "Additional Warranties")?.value).toBe(
      "None.",
    );
  });
});
