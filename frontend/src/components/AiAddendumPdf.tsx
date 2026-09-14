/**
 * PDF rendering of the AI Addendum, built via the shared
 * `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateAiAddendumBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { AiAddendumFormData } from "@/lib/aiAddendum";
import { buildCoverPage } from "@/lib/aiAddendumDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/aiAddendumStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateAiAddendumBlob(data: AiAddendumFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`AI Addendum — ${cover.providerName} and ${cover.customerName}`}
      documentTitle="AI Addendum"
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
