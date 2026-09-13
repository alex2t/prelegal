import { NdaFormData } from "@/lib/nda";
import { buildCoverPage } from "@/lib/ndaDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/standardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface NdaPreviewProps {
  data: NdaFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function NdaPreview({ data }: NdaPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
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
    />
  );
}
