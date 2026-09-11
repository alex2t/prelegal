import { NdaFormData } from "@/lib/nda";
import { buildCoverPage } from "@/lib/ndaDocument";
import {
  STANDARD_TERMS_ATTRIBUTION,
  STANDARD_TERMS_HEADING,
  STANDARD_TERMS_INTRO,
  standardTermsClauses,
} from "@/lib/standardTerms";

interface NdaPreviewProps {
  data: NdaFormData;
}

/** On-screen rendering of the generated document; mirrors the PDF layout. */
export default function NdaPreview({ data }: NdaPreviewProps) {
  const cover = buildCoverPage(data);

  return (
    <article className="space-y-6 text-[13px] leading-relaxed text-slate-900">
      <header className="space-y-1 text-center">
        <h1 className="text-lg font-bold uppercase tracking-wide">
          Mutual Non-Disclosure Agreement
        </h1>
        <p className="text-xs text-slate-500">Cover Page</p>
      </header>

      <p>{cover.introParagraph}</p>
      <p>{cover.partiesParagraph}</p>

      <dl className="space-y-4">
        {cover.fields.map((field) => (
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
        <p>{cover.signatureIntro}</p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left" />
              <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left">
                Party 1
              </th>
              <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left">
                Party 2
              </th>
            </tr>
          </thead>
          <tbody>
            {cover.signatureRows.map((row) => (
              <tr key={row.label}>
                <th className="border border-slate-300 bg-slate-50 px-2 py-1 text-left font-medium">
                  {row.label}
                </th>
                <td className="border border-slate-300 px-2 py-1 align-top">
                  {row.party1 || " "}
                </td>
                <td className="border border-slate-300 px-2 py-1 align-top">
                  {row.party2 || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-slate-500">{cover.attribution}</p>
      </section>

      <hr className="border-slate-300" />

      <section className="space-y-4">
        <h2 className="text-base font-bold uppercase tracking-wide">
          {STANDARD_TERMS_HEADING}
        </h2>
        <p className="text-xs italic text-slate-500">{STANDARD_TERMS_INTRO}</p>
        <ol className="space-y-3">
          {standardTermsClauses.map((clause) => (
            <li key={clause.number}>
              <span className="font-semibold">
                {clause.number}. {clause.title}.
              </span>{" "}
              {clause.text}
            </li>
          ))}
        </ol>
        <p className="text-[11px] text-slate-500">
          {STANDARD_TERMS_ATTRIBUTION}
        </p>
      </section>
    </article>
  );
}
