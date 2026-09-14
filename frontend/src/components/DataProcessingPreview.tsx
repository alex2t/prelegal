import { DataProcessingFormData } from "@/lib/dataProcessing";
import { buildCoverPage } from "@/lib/dataProcessingDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/dataProcessingStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface DataProcessingPreviewProps {
  data: DataProcessingFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function DataProcessingPreview({ data }: DataProcessingPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
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
    />
  );
}
