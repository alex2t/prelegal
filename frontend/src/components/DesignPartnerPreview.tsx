import { DesignPartnerFormData } from "@/lib/designPartner";
import { buildCoverPage } from "@/lib/designPartnerDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/designPartnerStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface DesignPartnerPreviewProps {
  data: DesignPartnerFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function DesignPartnerPreview({ data }: DesignPartnerPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
      documentTitle="Design Partner Agreement"
      introParagraph={cover.introParagraph}
      partiesParagraph={cover.partiesParagraph}
      fields={cover.fields}
      signatureIntro={cover.signatureIntro}
      signatureColumns={["Provider", "Partner"]}
      signatureRows={cover.signatureRows.map((row) => ({
        label: row.label,
        left: row.provider,
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
