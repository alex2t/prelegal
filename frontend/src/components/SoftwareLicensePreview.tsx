import { SoftwareLicenseFormData } from "@/lib/softwareLicense";
import { buildCoverPage } from "@/lib/softwareLicenseDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/softwareLicenseStandardTerms";
import CoverPageLayout from "./CoverPageLayout";

interface SoftwareLicensePreviewProps {
  data: SoftwareLicenseFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function SoftwareLicensePreview({ data }: SoftwareLicensePreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <CoverPageLayout
      documentTitle="Software License Agreement"
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
