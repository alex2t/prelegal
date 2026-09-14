/**
 * PDF rendering of the Professional Services Agreement, built via the
 * shared `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateProfessionalServicesBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { ProfessionalServicesFormData } from "@/lib/professionalServices";
import { buildCoverPage } from "@/lib/professionalServicesDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/professionalServicesStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateProfessionalServicesBlob(
  data: ProfessionalServicesFormData,
): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Professional Services Agreement — ${cover.providerName} and ${cover.customerName}`}
      documentTitle="Professional Services Agreement"
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
