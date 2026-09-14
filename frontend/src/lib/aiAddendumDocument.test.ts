import { describe, expect, it } from "vitest";
import { defaultAiAddendumFormData, type AiAddendumFormData } from "./aiAddendum";
import { buildCoverPage } from "./aiAddendumDocument";

function makeData(overrides: Partial<AiAddendumFormData> = {}): AiAddendumFormData {
  return { ...defaultAiAddendumFormData, effectiveDate: "2026-09-11", ...overrides };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
      effectiveDate: "2026-09-11",
      baseAgreementDescription: "the Cloud Service Agreement covering the Acme Analytics product",
      trainingDataUse: "Provider may not use Customer's data for training.",
      trainingRestrictions: "No use of Personal Data for training.",
      improvementRestrictions: "No use outside the Product.",
    });

    const model = buildCoverPage(data);

    expect(model.providerName).toBe("Acme, Inc.");
    expect(model.customerName).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This Addendum is entered into by Acme, Inc. (“Provider”) and Globex Corp. (“Customer”) as of the Effective Date.",
    );

    expect(model.fields.find((f) => f.heading === "Base Agreement")?.value).toBe(
      "the Cloud Service Agreement covering the Acme Analytics product",
    );
    expect(model.fields.find((f) => f.heading === "Training Data Use")?.value).toBe(
      "Provider may not use Customer's data for training.",
    );
    expect(model.fields.find((f) => f.heading === "Training Restrictions")?.value).toBe(
      "No use of Personal Data for training.",
    );
    expect(model.fields.find((f) => f.heading === "Improvement Restrictions")?.value).toBe(
      "No use outside the Product.",
    );

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      provider: "Acme, Inc.",
      customer: "Globex Corp.",
    });
  });

  it("uses placeholders for party names and base agreement description when blank", () => {
    const model = buildCoverPage(makeData({ baseAgreementDescription: "" }));

    expect(model.providerName).toBe("Provider");
    expect(model.customerName).toBe("Customer");
    expect(model.fields.find((f) => f.heading === "Base Agreement")?.value).toBe(
      "[Base agreement]",
    );
  });

  it("falls back to default text for training and improvement fields when left blank", () => {
    const model = buildCoverPage(
      makeData({ trainingDataUse: "", trainingRestrictions: "", improvementRestrictions: "" }),
    );
    expect(model.fields.find((f) => f.heading === "Training Data Use")?.value).toBe(
      "Provider may use Customer's data to train and improve the Product's AI features, subject to the restrictions below.",
    );
    expect(model.fields.find((f) => f.heading === "Training Restrictions")?.value).toBe("None.");
    expect(model.fields.find((f) => f.heading === "Improvement Restrictions")?.value).toBe(
      "None.",
    );
  });
});
