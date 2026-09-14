/**
 * PDF rendering of the Software License Agreement, built via the shared
 * `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateSoftwareLicenseBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { SoftwareLicenseFormData } from "@/lib/softwareLicense";
import { buildCoverPage } from "@/lib/softwareLicenseDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/softwareLicenseStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateSoftwareLicenseBlob(data: SoftwareLicenseFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Software License Agreement — ${cover.providerName} and ${cover.customerName}`}
      documentTitle="Software License Agreement"
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
