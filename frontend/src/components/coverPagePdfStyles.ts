import { StyleSheet } from "@react-pdf/renderer";

export const coverPagePdfStyles = StyleSheet.create({
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
  disclaimer: {
    fontSize: 8,
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: 6,
    marginBottom: 12,
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
  clauseParagraph: { marginTop: 4 },
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
