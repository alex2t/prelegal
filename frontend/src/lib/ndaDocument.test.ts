import { describe, expect, it } from "vitest";
import { defaultFormData, emptyParty, type NdaFormData } from "./nda";
import { buildCoverPage } from "./ndaDocument";

function makeData(overrides: Partial<NdaFormData> = {}): NdaFormData {
  return {
    ...defaultFormData,
    party1: { ...emptyParty },
    party2: { ...emptyParty },
    ...overrides,
  };
}

describe("buildCoverPage", () => {
  it("fills in party names and key terms from the form data", () => {
    const data = makeData({
      party1: {
        company: "Acme, Inc.",
        signatoryName: "Jordan Lee",
        title: "Chief Executive Officer",
        noticeAddress: "legal@acme.com",
      },
      party2: {
        company: "Globex Corp.",
        signatoryName: "Sam Rivera",
        title: "General Counsel",
        noticeAddress: "legal@globex.com",
      },
      purpose: "Evaluating a potential business relationship.",
      effectiveDate: "2026-09-11",
      governingLaw: "Delaware",
      jurisdiction: "New Castle County, Delaware",
    });

    const model = buildCoverPage(data);

    expect(model.party1Name).toBe("Acme, Inc.");
    expect(model.party2Name).toBe("Globex Corp.");
    expect(model.effectiveDate).toBe("September 11, 2026");
    expect(model.partiesParagraph).toBe(
      "This MNDA is entered into by Acme, Inc. (“Party 1”) and Globex Corp. (“Party 2”) as of the Effective Date.",
    );

    const purposeField = model.fields.find((f) => f.heading === "Purpose");
    expect(purposeField?.value).toBe("Evaluating a potential business relationship.");

    const governingLawField = model.fields.find((f) => f.heading === "Governing Law");
    expect(governingLawField?.value).toBe("Delaware");

    const signatureRow = model.signatureRows.find((r) => r.label === "Company");
    expect(signatureRow).toEqual({
      label: "Company",
      party1: "Acme, Inc.",
      party2: "Globex Corp.",
    });
  });

  it("uses placeholders for party names, governing law and jurisdiction when blank", () => {
    const model = buildCoverPage(makeData({ governingLaw: "", jurisdiction: "" }));

    expect(model.party1Name).toBe("Party 1");
    expect(model.party2Name).toBe("Party 2");

    const governingLawField = model.fields.find((f) => f.heading === "Governing Law");
    expect(governingLawField?.value).toBe("[State]");

    const jurisdictionField = model.fields.find((f) => f.heading === "Jurisdiction");
    expect(jurisdictionField?.value).toBe("[City or county and state]");
  });

  it("shows 'None.' for modifications when left blank", () => {
    const model = buildCoverPage(makeData({ modifications: "" }));
    const modificationsField = model.fields.find(
      (f) => f.heading === "MNDA Modifications",
    );
    expect(modificationsField?.value).toBe("None.");
  });

  it("passes through provided modifications text", () => {
    const model = buildCoverPage(
      makeData({ modifications: "Section 3 is deleted in its entirety." }),
    );
    const modificationsField = model.fields.find(
      (f) => f.heading === "MNDA Modifications",
    );
    expect(modificationsField?.value).toBe(
      "Section 3 is deleted in its entirety.",
    );
  });
});
