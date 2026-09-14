import { BusinessAssociateFormData } from "@/lib/businessAssociate";
import { buildCoverPage } from "@/lib/businessAssociateDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/businessAssociateStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface BusinessAssociatePreviewProps {
  data: BusinessAssociateFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function BusinessAssociatePreview({ data }: BusinessAssociatePreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
      documentTitle="Business Associate Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Provider", "Company"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.provider,
        right: row.company,
      }))}
      attribution={cover.attribution}
      standardTermsHeading={STANDARD_TERMS_HEADING}
      standardTermsIntro={STANDARD_TERMS_INTRO}
      clauses={standardTermsClauses}
      standardTermsAttribution={STANDARD_TERMS_ATTRIBUTION}
    />
  );
}
