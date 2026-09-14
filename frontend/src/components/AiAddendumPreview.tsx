import { AiAddendumFormData } from "@/lib/aiAddendum";
import { buildCoverPage } from "@/lib/aiAddendumDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/aiAddendumStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface AiAddendumPreviewProps {
  data: AiAddendumFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function AiAddendumPreview({ data }: AiAddendumPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
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
    />
  );
}
