import { PartnershipFormData } from "@/lib/partnership";
import { buildCoverPage } from "@/lib/partnershipDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/partnershipStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface PartnershipPreviewProps {
  data: PartnershipFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function PartnershipPreview({ data }: PartnershipPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
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
    />
  );
}
