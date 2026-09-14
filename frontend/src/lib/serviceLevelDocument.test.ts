import { describe, expect, it } from "vitest";
import { defaultServiceLevelFormData, type ServiceLevelFormData } from "./serviceLevel";
import { buildCoverPage } from "./serviceLevelDocument";

function makeData(overrides: Partial<ServiceLevelFormData> = {}): ServiceLevelFormData {
  return { ...defaultServiceLevelFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
      effectiveDate: "2026-09-11",
      governingLaw: "Delaware",
      chosenCourts: "New Castle County, Delaware",
      targetUptime: "99.95%",
      targetResponseTime: "4 hours",
      supportChannel: "support@acme.example",
      uptimeCredit: "5% of monthly fees",
      responseTimeCredit: "2% of monthly fees",
      subscriptionPeriod: "24 months",
    });

    const model = buildCoverPage(data);

    expect(model.providerName).toBe("Acme, Inc.");
    expect(model.customerName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This Agreement is entered into by Acme, Inc. (“Provider”) and Globex Corp. (“Customer”) as of the Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Target Uptime")?.value).toBe("99.95%");
    expect(model.fields.find((f) => f.heading === "Target Response Time")?.value).toBe(
      "4 hours",
    );
    expect(model.fields.find((f) => f.heading === "Support Channel")?.value).toBe(
      "support@acme.example",
    );
    expect(model.fields.find((f) => f.heading === "Uptime Credit")?.value).toBe(
      "5% of monthly fees",
    );
    expect(model.fields.find((f) => f.heading === "Response Time Credit")?.value).toBe(
      "2% of monthly fees",
    );
    expect(model.fields.find((f) => f.heading === "Subscription Period")?.value).toBe(
      "24 months",
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
        targetUptime: "",
        targetResponseTime: "",
        supportChannel: "",
        uptimeCredit: "",
        responseTimeCredit: "",
        subscriptionPeriod: "",
      }),
    );
    expect(model.fields.find((f) => f.heading === "Target Uptime")?.value).toBe("99.9%");
    expect(model.fields.find((f) => f.heading === "Target Response Time")?.value).toBe(
      "24 hours",
    );
    expect(model.fields.find((f) => f.heading === "Support Channel")?.value).toBe(
      "Email support.",
    );
    expect(model.fields.find((f) => f.heading === "Uptime Credit")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Response Time Credit")?.value).toBe(
      "None.",
    );
    expect(model.fields.find((f) => f.heading === "Subscription Period")?.value).toBe(
      "12 months",
    );
  });
});
