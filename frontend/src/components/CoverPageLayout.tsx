export interface CoverPageLayoutField {
  heading: string;
  note?: string;
  value: string;
}

export interface CoverPageLayoutSignatureRow {
  label: string;
  left: string;
  right: string;
}

export interface CoverPageLayoutClause {
  number: string;
  title: string;
  text: string;
}

export interface CoverPageLayoutProps {
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

/**
 * Shared on-screen layout for a "Cover Page + Standard Terms" document.
 * Mirrors `CoverPagePdfLayout`; a clause's `text` may contain `\n\n`-joined
 * paragraphs (only the Design Partner Agreement's Standard Terms use this).
 */
export default function CoverPageLayout({
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
}: CoverPageLayoutProps) {
  const [leftColumn, rightColumn] = signatureColumns;

  return (
    <article className="space-y-6 text-[13px] leading-relaxed text-slate-900">
      <header className="space-y-1 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">
          {documentTitle}
        </h1>
        <p className="text-xs text-slate-500">Cover Page</p>
      </header>

      <p>{introParagraph}</p>
      <p>{partiesParagraph}</p>

      <dl className="space-y-4">
        {fields.map((field) => (
          <div key={field.heading}>
            <dt className="font-semibold">{field.heading}</dt>
            {field.note ? (
              <p className="text-xs italic text-slate-500">{field.note}</p>
            ) : null}
            <dd className="whitespace-pre-wrap">{field.value}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-3">
        <p>{signatureIntro}</p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left" />
              <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left">
                {leftColumn}
              </th>
              <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left">
                {rightColumn}
              </th>
            </tr>
          </thead>
          <tbody>
            {signatureRows.map((row) => (
              <tr key={row.label}>
                <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left font-medium">
                  {row.label}
                </th>
                <td className="border border-slate-300 px-2 py-1 align-top">
                  {row.left || " "}
                </td>
                <td className="border border-slate-300 px-2 py-1 align-top">
                  {row.right || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-slate-500">{attribution}</p>
      </section>

      <hr className="border-slate-300" />

      <section className="space-y-4">
        <h2 className="text-base font-bold uppercase tracking-wide">
          {standardTermsHeading}
        </h2>
        <p className="text-xs italic text-slate-500">{standardTermsIntro}</p>
        <ol className="space-y-3">
          {clauses.map((clause) => (
            <li key={clause.number} className="space-y-1">
              <p className="font-semibold">
                {clause.number}. {clause.title}.
              </p>
              {clause.text.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-slate-500">{standardTermsAttribution}</p>
      </section>
    </article>
  );
}
