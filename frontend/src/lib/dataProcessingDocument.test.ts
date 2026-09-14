import { describe, expect, it } from "vitest";
import { defaultDataProcessingFormData, type DataProcessingFormData } from "./dataProcessing";
import { buildCoverPage } from "./dataProcessingDocument";

function makeData(overrides: Partial<DataProcessingFormData> = {}): DataProcessingFormData {
  return { ...defaultDataProcessingFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      controller: "Acme, Inc.",
      processor: "Globex Corp.",
      effectiveDate: "2026-09-11",
      governingMemberState: "Ireland",
      categoriesOfPersonalData: "Name, email address, IP address",
      categoriesOfDataSubjects: "Customer's employees and end users",
      purposeOfProcessing: "Providing and maintaining the Service",
      durationOfProcessing: "Two years",
      specialCategoryData: "Health data",
      approvedSubprocessors: "Acme Cloud LLC (United States)",
      providerSecurityContact: "security@acme.example",
    });

    const model = buildCoverPage(data);

    expect(model.controllerName).toBe("Acme, Inc.");
    expect(model.processorName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This DPA is entered into by Acme, Inc. (“Controller”) and Globex Corp. (“Processor”) as of the Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Governing Member State")?.value).toBe(
      "Ireland",
    );
    expect(model.fields.find((f) => f.heading === "Categories of Personal Data")?.value).toBe(
      "Name, email address, IP address",
    );
    expect(model.fields.find((f) => f.heading === "Categories of Data Subjects")?.value).toBe(
      "Customer's employees and end users",
    );
    expect(model.fields.find((f) => f.heading === "Purpose of Processing")?.value).toBe(
      "Providing and maintaining the Service",
    );
    expect(model.fields.find((f) => f.heading === "Duration of Processing")?.value).toBe(
      "Two years",
    );
    expect(model.fields.find((f) => f.heading === "Special Category Data")?.value).toBe(
      "Health data",
    );
    expect(model.fields.find((f) => f.heading === "Approved Subprocessors")?.value).toBe(
      "Acme Cloud LLC (United States)",
    );
    expect(model.fields.find((f) => f.heading === "Provider Security Contact")?.value).toBe(
      "security@acme.example",
    );

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      controller: "Acme, Inc.",
      processor: "Globex Corp.",
    });
  });

  it("uses placeholders for party names, governing member state and security contact when blank", () => {
    const model = buildCoverPage(makeData({ governingMemberState: "", providerSecurityContact: "" }));

    expect(model.controllerName).toBe("Controller");
    expect(model.processorName).toBe("Processor");
    expect(model.fields.find((f) => f.heading === "Governing Member State")?.value).toBe(
      "[Member State]",
    );
    expect(model.fields.find((f) => f.heading === "Provider Security Contact")?.value).toBe(
      "[Security contact]",
    );
  });

  it("falls back to default text for duration, special category data and subprocessors when left blank", () => {
    const model = buildCoverPage(
      makeData({ durationOfProcessing: "", specialCategoryData: "", approvedSubprocessors: "" }),
    );
    expect(model.fields.find((f) => f.heading === "Duration of Processing")?.value).toBe(
      "The term of the Agreement.",
    );
    expect(model.fields.find((f) => f.heading === "Special Category Data")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Approved Subprocessors")?.value).toBe("None.");
  });
});
