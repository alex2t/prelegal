/**
 * PDF rendering of the Mutual NDA, built with `@react-pdf/renderer`.
 *
 * This module pulls in the (browser-only) PDF engine, so it must never be
 * imported during server rendering — load it with a dynamic `import()` from a
 * client event handler (see `generateNdaBlob`).
 */

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { NdaFormData } from "@/lib/nda";
import { buildCoverPage } from "@/lib/ndaDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/standardTerms";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 56,
    paddingHorizontal: 64,
    fontSize: 10,
    lineHeight: 1.5,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#64748b",
    marginTop: 2,
    marginBottom: 16,
  },
  paragraph: { marginBottom: 10 },
  fieldGroup: { marginBottom: 10 },
  fieldHeading: { fontFamily: "Helvetica-Bold" },
  fieldNote: {
    fontFamily: "Helvetica-Oblique",
    color: "#64748b",
    fontSize: 9,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 8,
  },
  clause: { marginBottom: 8 },
  clauseTitle: { fontFamily: "Helvetica-Bold" },
  attribution: { fontSize: 8, color: "#64748b", marginTop: 8 },
  table: { marginTop: 8, borderTop: "1pt solid #cbd5e1" },
  row: { flexDirection: "row", borderBottom: "1pt solid #cbd5e1" },
  cellLabel: {
    width: "22%",
    padding: 4,
    fontFamily: "Helvetica-Bold",
    borderRight: "1pt solid #cbd5e1",
  },
  cell: {
    width: "39%",
    padding: 4,
    borderRight: "1pt solid #cbd5e1",
  },
  cellLast: { width: "39%", padding: 4 },
  divider: {
    borderBottom: "1pt solid #cbd5e1",
    marginVertical: 14,
  },
});

function NdaDocument({ data }: { data: NdaFormData }) {
  const cover = buildCoverPage(data);

  return (
    <Document
      title={`Mutual NDA — ${cover.party1Name} and ${cover.party2Name}`}
      author="prelegal"
    >
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
        <Text style={styles.subtitle}>Cover Page</Text>

        <Text style={styles.paragraph}>{cover.introParagraph}</Text>
        <Text style={styles.paragraph}>{cover.partiesParagraph}</Text>

        {cover.fields.map((field) => (
          <View key={field.heading} style={styles.fieldGroup} wrap={false}>
            <Text style={styles.fieldHeading}>{field.heading}</Text>
            {field.note ? (
              <Text style={styles.fieldNote}>{field.note}</Text>
            ) : null}
            <Text>{field.value}</Text>
          </View>
        ))}

        <Text style={styles.paragraph}>{cover.signatureIntro}</Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellLabel}> </Text>
            <Text style={styles.cell}>Party 1</Text>
            <Text style={styles.cellLast}>Party 2</Text>
          </View>
          {cover.signatureRows.map((sigRow) => (
            <View key={sigRow.label} style={styles.row} wrap={false}>
              <Text style={styles.cellLabel}>{sigRow.label}</Text>
              <Text style={styles.cell}>{sigRow.party1 || " "}</Text>
              <Text style={styles.cellLast}>{sigRow.party2 || " "}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.attribution}>{cover.attribution}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionHeading}>{STANDARD_TERMS_HEADING}</Text>
        <Text style={[styles.fieldNote, styles.paragraph]}>
          {STANDARD_TERMS_INTRO}
        </Text>
        {standardTermsClauses.map((clause) => (
          <View key={clause.number} style={styles.clause}>
            <Text>
              <Text style={styles.clauseTitle}>
                {clause.number}. {clause.title}.
              </Text>{" "}
              {clause.text}
            </Text>
          </View>
        ))}
        <Text style={styles.attribution}>{STANDARD_TERMS_ATTRIBUTION}</Text>
      </Page>
    </Document>
  );
}

export function generateNdaBlob(data: NdaFormData): Promise<Blob> {
  return pdf(<NdaDocument data={data} />).toBlob();
}
