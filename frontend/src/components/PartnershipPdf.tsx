/**
 * PDF rendering of the Partnership Agreement, built via the shared
 * `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generatePartnershipBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { PartnershipFormData } from "@/lib/partnership";
import { buildCoverPage } from "@/lib/partnershipDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/partnershipStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generatePartnershipBlob(data: PartnershipFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Partnership Agreement — ${cover.companyName} and ${cover.partnerName}`}
      documentTitle="Partnership Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Company", "Partner"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.company,
        right: row.partner,
      }))}
      attribution={cover.attribution}
      standardTermsHeading={STANDARD_TERMS_HEADING}
      standardTermsIntro={STANDARD_TERMS_INTRO}
      clauses={standardTermsClauses}
      standardTermsAttribution={STANDARD_TERMS_ATTRIBUTION}
    />,
  ).toBlob();
}
