/**
 * PDF rendering of the Service Level Agreement, built via the shared
 * `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateServiceLevelBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { ServiceLevelFormData } from "@/lib/serviceLevel";
import { buildCoverPage } from "@/lib/serviceLevelDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/serviceLevelStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateServiceLevelBlob(data: ServiceLevelFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Service Level Agreement — ${cover.providerName} and ${cover.customerName}`}
      documentTitle="Service Level Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Provider", "Customer"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.provider,
        right: row.customer,
      }))}
      attribution={cover.attribution}
      standardTermsHeading={STANDARD_TERMS_HEADING}
      standardTermsIntro={STANDARD_TERMS_INTRO}
      clauses={standardTermsClauses}
      standardTermsAttribution={STANDARD_TERMS_ATTRIBUTION}
    />,
  ).toBlob();
}
