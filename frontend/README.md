# prelegal — frontend

A Next.js web app that turns a short form into a completed **Mutual Non-Disclosure
Agreement** and lets the user download it as a PDF.

Implements Jira issue **PL-3** ("Prototype of Mutual NDA creator").

## What it does

1. The user fills in the key terms (the two parties, purpose, effective date,
   MNDA term, term of confidentiality, governing law, jurisdiction, and any
   modifications).
2. A live preview shows the assembled agreement — the filled-in **Cover Page**
   followed by the full **Common Paper Mutual NDA Standard Terms v1.0**.
3. **Download PDF** generates the document in the browser and saves it locally.

The document text is based on the [Common Paper Mutual NDA](https://commonpaper.com/standards/mutual-nda/1.0/)
(CC BY 4.0), mirrored in `../templates/Mutual-NDA*.md`.

## Architecture

Pure client-side — no backend or database. The Standard Terms are bundled as
static data; everything else is derived from form state.

| Path | Responsibility |
| --- | --- |
| `src/lib/nda.ts` | Form types, defaults, formatting and validation helpers |
| `src/lib/standardTerms.ts` | Verbatim Common Paper Standard Terms v1.0 |
| `src/lib/ndaDocument.ts` | Builds the presentation model shared by preview + PDF |
| `src/components/NdaForm.tsx` | The input form |
| `src/components/NdaPreview.tsx` | On-screen rendering of the document |
| `src/components/NdaPdf.tsx` | `@react-pdf/renderer` document + `generateNdaBlob()` |
| `src/app/page.tsx` | Holds form state, wires up the PDF download |

`NdaPdf.tsx` pulls in the browser-only PDF engine, so it is loaded with a dynamic
`import()` from the download click handler and never runs during SSR.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + typecheck
npx eslint .     # lint
```
