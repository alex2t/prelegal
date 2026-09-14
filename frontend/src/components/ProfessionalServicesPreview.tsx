import { ProfessionalServicesFormData } from "@/lib/professionalServices";
import { buildCoverPage } from "@/lib/professionalServicesDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/professionalServicesStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface ProfessionalServicesPreviewProps {
  data: ProfessionalServicesFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function ProfessionalServicesPreview({
  data,
}: ProfessionalServicesPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
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
    />
  );
}
