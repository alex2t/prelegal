/**
 * PDF rendering of the Mutual NDA, built via the shared `CoverPagePdfLayout`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler (see `generateNdaBlob`).
 */

import { pdf } from "@react-pdf/renderer";
import { NdaFormData } from "@/lib/nda";
import { buildCoverPage } from "@/lib/ndaDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/standardTerms";
import { CoverPagePdfLayout } from "./CoverPagePdfLayout";

export function generateNdaBlob(data: NdaFormData): Promise<Blob> {
  const cover = buildCoverPage(data);

  return pdf(
    <CoverPagePdfLayout
      pdfTitle={`Mutual NDA — ${cover.party1Name} and ${cover.party2Name}`}
      documentTitle="Mutual Non-Disclosure Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Party 1", "Party 2"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.party1,
        right: row.party2,
      }))}
      attribution={cover.attribution}
      standardTermsHeading={STANDARD_TERMS_HEADING}
      standardTermsIntro={STANDARD_TERMS_INTRO}
      clauses={standardTermsClauses.map((clause) => ({
        number: String(clause.number),
        title: clause.title,
        text: clause.text,
      }))}
      standardTermsAttribution={STANDARD_TERMS_ATTRIBUTION}
    />,
  ).toBlob();
}
