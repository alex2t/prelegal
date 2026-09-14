/**
 * Shared PDF layout for a "Cover Page + Standard Terms" document, built with
 * `@react-pdf/renderer`. Mirrors `CoverPageLayout` (the on-screen version).
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering - load it with a dynamic `import()` from
 * a client event handler, as `NdaPdf.tsx`/`DesignPartnerPdf.tsx` do.
 */

import { Document, Page, Text, View } from "@react-pdf/renderer";
import { LEGAL_DISCLAIMER } from "@/lib/disclaimer";
import { coverPagePdfStyles as styles } from "./coverPagePdfStyles";
import {
  CoverPageLayoutClause,
  CoverPageLayoutField,
  CoverPageLayoutSignatureRow,
} from "./CoverPageLayout";

export interface CoverPagePdfLayoutProps {
  pdfTitle: string;
  documentTitle: string;
  introParagraph: string;
  partiesParagraph: string;
  fields: CoverPageLayoutField[];
  signatureIntro: string;
  signatureColumns: [string, string];
  signatureRows: CoverPageLayoutSignatureRow[];
  attribution: string;
  standardTermsHeading: string;
  standardTermsIntro: string;
  clauses: CoverPageLayoutClause[];
  standardTermsAttribution: string;
}

export function CoverPagePdfLayout({
  pdfTitle,
  documentTitle,
  introParagraph,
  partiesParagraph,
  fields,
  signatureIntro,
  signatureColumns,
  signatureRows,
  attribution,
  standardTermsHeading,
  standardTermsIntro,
  clauses,
  standardTermsAttribution,
}: CoverPagePdfLayoutProps) {
  const [leftColumn, rightColumn] = signatureColumns;

  return (
    <Document title={pdfTitle} author="prelegal">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{documentTitle}</Text>
        <Text style={styles.subtitle}>Cover Page</Text>

        <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>

        <Text style={styles.paragraph}>{introParagraph}</Text>
        <Text style={styles.paragraph}>{partiesParagraph}</Text>

        {fields.map((field) => (
          <View key={field.heading} style={styles.fieldGroup} wrap={false}>
            <Text style={styles.fieldHeading}>{field.heading}</Text>
            {field.note ? (
              <Text style={styles.fieldNote}>{field.note}</Text>
            ) : null}
            <Text>{field.value}</Text>
          </View>
        ))}

        <Text style={styles.paragraph}>{signatureIntro}</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellLabel}> </Text>
            <Text style={styles.cell}>{leftColumn}</Text>
            <Text style={styles.cellLast}>{rightColumn}</Text>
          </View>
          {signatureRows.map((sigRow) => (
            <View key={sigRow.label} style={styles.row} wrap={false}>
              <Text style={styles.cellLabel}>{sigRow.label}</Text>
              <Text style={styles.cell}>{sigRow.left || " "}</Text>
              <Text style={styles.cellLast}>{sigRow.right || " "}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.attribution}>{attribution}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionHeading}>{standardTermsHeading}</Text>
        <Text style={[styles.fieldNote, styles.paragraph]}>
          {standardTermsIntro}
        </Text>
        {clauses.map((clause) => (
          <View key={clause.number} style={styles.clause}>
            <Text style={styles.clauseTitle}>
              {clause.number}. {clause.title}.
            </Text>
            {clause.text.split("\n\n").map((paragraph, index) => (
              <Text key={index} style={styles.clauseParagraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
        <Text style={styles.attribution}>{standardTermsAttribution}</Text>
      </Page>
    </Document>
  );
}
