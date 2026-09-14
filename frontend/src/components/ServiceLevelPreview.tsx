import { ServiceLevelFormData } from "@/lib/serviceLevel";
import { buildCoverPage } from "@/lib/serviceLevelDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/serviceLevelStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface ServiceLevelPreviewProps {
  data: ServiceLevelFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function ServiceLevelPreview({ data }: ServiceLevelPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
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
    />
  );
}
