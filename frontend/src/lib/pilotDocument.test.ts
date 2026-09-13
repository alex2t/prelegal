import { describe, expect, it } from "vitest";
import { defaultPilotFormData, type PilotFormData } from "./pilot";
import { buildCoverPage } from "./pilotDocument";

function makeData(overrides: Partial<PilotFormData> = {}): PilotFormData {
  return { ...defaultPilotFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
      product: "The beta analytics dashboard.",
      fees: "$1,000",
      effectiveDate: "2026-09-11",
      pilotPeriod: "60 days",
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

    expect(model.fields.find((f) => f.heading === "Product")?.value).toBe(
      "The beta analytics dashboard.",
    );
    expect(model.fields.find((f) => f.heading === "Fees")?.value).toBe("$1,000");
    expect(model.fields.find((f) => f.heading === "Pilot Period")?.value).toBe("60 days");
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

  it("falls back to default text for fees, pilot period and cap amount when left blank", () => {
    const model = buildCoverPage(makeData({ fees: "", pilotPeriod: "", generalCapAmount: "" }));
    expect(model.fields.find((f) => f.heading === "Fees")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Pilot Period")?.value).toBe("30 days");
    expect(model.fields.find((f) => f.heading === "General Cap Amount")?.value).toBe(
      "The total Fees paid under this Agreement.",
    );
  });
});
