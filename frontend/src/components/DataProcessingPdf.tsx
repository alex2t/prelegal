/**
 * PDF rendering of the Data Processing Agreement, built via the shared
 * `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateDataProcessingBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { DataProcessingFormData } from "@/lib/dataProcessing";
import { buildCoverPage } from "@/lib/dataProcessingDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/dataProcessingStandardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateDataProcessingBlob(data: DataProcessingFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Data Processing Agreement — ${cover.controllerName} and ${cover.processorName}`}
      documentTitle="Data Processing Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Controller", "Processor"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.controller,
        right: row.processor,
      }))}
      attribution={cover.attribution}
      standardTermsHeading={STANDARD_TERMS_HEADING}
      standardTermsIntro={STANDARD_TERMS_INTRO}
      clauses={standardTermsClauses}
      standardTermsAttribution={STANDARD_TERMS_ATTRIBUTION}
    />,
  ).toBlob();
}
