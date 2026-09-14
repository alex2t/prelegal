/**
 * PDF rendering of the Business Associate Agreement, built via the shared
 * `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateBusinessAssociateBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { BusinessAssociateFormData } from "@/lib/businessAssociate";
import { buildCoverPage } from "@/lib/businessAssociateDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/businessAssociateStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateBusinessAssociateBlob(data: BusinessAssociateFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Business Associate Agreement — ${cover.providerName} and ${cover.companyName}`}
      documentTitle="Business Associate Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Provider", "Company"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.provider,
        right: row.company,
      }))}
      attribution={cover.attribution}
      standardTermsHeading={STANDARD_TERMS_HEADING}
      standardTermsIntro={STANDARD_TERMS_INTRO}
      clauses={standardTermsClauses}
      standardTermsAttribution={STANDARD_TERMS_ATTRIBUTION}
    />,
  ).toBlob();
}
